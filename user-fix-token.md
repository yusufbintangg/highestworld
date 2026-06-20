# 📄 /src/context/AuthContext.tsx

## 🎯 1. Peran Modul & Status Saat Ini (Module Role & Current State)

* **Deskripsi:**
  File ini adalah *single source of truth* untuk autentikasi customer (user non-admin). File bertanggung jawab menyimpan:
  - `session` (Supabase `Session | null`)
  - `user` (profil customer yang diproyeksikan ke `UserProfile`)
  - `isAuthenticated` (boolean derivatif dari `session`)
  - `isLoading` (status inisialisasi/hidratasi session)

  Secara arsitektural, seluruh rute publik yang menampilkan UI berbasis auth (mis. Header: `LOGIN` → `ACCOUNT`) mengandalkan context ini.

* **Kondisi Saat Bug Terjadi:**
  Saat *hard refresh*, terlihat bahwa:
  - Header tetap bisa berubah (atau minimal menampilkan shell layout), sehingga React root & router masih hidup.
  - Tetapi data utama rute publik (produk/kategori/banner) menjadi `blank`/hilang.
  - Telemetry: `Zero Network Requests` ke Supabase setelah refresh.

  Dari sisi `AuthContext.tsx`, ada indikasi bahwa hidrasinya `session` / perubahan auth state memengaruhi *render gating* pada child components, sehingga hook data-fetching milik halaman publik tidak mengeksekusi.

  Pada implementasi saat ini, file ini **hanya menggunakan** `supabase.auth.onAuthStateChange` dan memakai ref `initialized` untuk menghindari race antara `getSession()` vs listener. Itu desain yang bagus, tetapi masih ada risiko *silent gating* karena:
  - `isLoading` hanya disetel `false` di dalam handler `onAuthStateChange`.
  - Jika event `INITIAL_SESSION` tidak pernah diproses (atau tertahan oleh kondisi try/catch yang menyembunyikan error), `isLoading` bisa bertahan `true`.
  - Namun pada kasus gejala kamu: `Zero Network Requests`, artinya bukan hanya account-guard yang memblokir, tetapi juga komponen fetching di halaman publik yang seharusnya bisa berjalan independen auth menjadi ikut terblokir.

## 🏗️ 2. Arsitektur Pemulihan Sesi (Session Hydration & Data Flow)

* **Komponen Terkait:**
  - `src/app/App.tsx` membungkus app dengan `<AuthProvider>`
  - `src/app/Layout.jsx` (shell layout yang selalu dirender)
  - `src/app/components/auth/ProtectedRoute.tsx` (gating untuk rute account)
  - `src/app/components/layout/Navbar.jsx` (UI `LOGIN/ACCOUNT`)

* **Diagram Alur Sinkronisasi Sesi (ASCII):**

```text
[localStorage auth token (Supabase SDK)]
          |
          |  (onAuthStateChange)
          v
[AuthProvider/AuthContext.tsx]
  - initialized ref false -> true on INITIAL_SESSION
  - setSession(session)
  - setIsLoading(false)
  - if session.user -> fetchProfile(user)
          |
          v
[Context consumers]
  - Navbar: user ? 'ACCOUNT' : 'LOGIN'
  - ProtectedRoute: if isLoading show spinner; if !isAuthenticated redirect
  - Public pages: (harusnya tetap fetch produk/kategori/banner via supabase client)

[Bug condition expectation]
  If INITIAL_SESSION handler never completes => isLoading stays true
  => any gating that depends on isLoading can block downstream rendering
  => leading to zero supabase requests from public data hooks.
```

## 💾 3. Analisis State & Kondisi Rendering (State & Render Conditioning)

* **Global/Context/Server State:**
  - `session` dan `user` adalah state lokal context.
  - `isLoading` mengontrol apakah provider dianggap siap.

* **Local Conditional Rendering:**
  Dalam file ini, tidak ada `if (isLoading) return ...` di provider; provider selalu merender `children`.
  Tetapi consumer seperti `ProtectedRoute` punya:
  - `if (isLoading) return <LoadingScreen />`
  - `if (!isAuthenticated) return <Navigate ... />`

  Untuk rute publik (Home/Products/Collections), tidak ada `ProtectedRoute`, jadi seharusnya fetch produk tetap jalan.

  Namun gejala kamu menunjukkan komponen fetching publik **tidak mounted**.
  Ini mengindikasikan kemungkinan lain: ada *guard global* yang tidak terlihat dari file yang sudah terbaca (misalnya `Layout` atau `Navbar` yang memanfaatkan auth state untuk meng-hide render area utama), atau event auth handler mengubah router state/redirect diam-diam.

* **Skema / Contoh Mutasi State yang Salah:**

  Risiko state menggantung:
  - `initialized.current` hanya diset `true` setelah handler event pertama masuk.
  - `setIsLoading(false)` hanya terjadi di dalam handler `INITIAL_SESSION`.
  - Jika `fetchProfile` melempar error yang tidak ditangani (di kode saat ini `fetchProfile` punya `catch { setUser(...) }`, tapi `setIsLoading` berada di handler yang tetap memanggil `await fetchProfile(...)` tanpa `try/catch` khusus pada handler itu sendiri).

  Skema salah yang mungkin terjadi saat refresh:

```text
INITIAL_SESSION event masuk
  setSession(session)         (mungkin)
  setIsLoading(false)         (tergantung apakah handler mencapai line tsb)
  await fetchProfile(user)   (bisa hang / throw)

Jika await fetchProfile tidak selesai karena exception yang tidak tertangkap di level handler:
  => handler tidak lanjut
  => isLoading tidak pernah diubah => tetap true
  => consumer gating tetap mengunci rendering.
```

## 🛡️ 4. Analisis Keamanan & Validasi Token (Security & Session Validation)

* **Mekanisme Penanganan Sesi:**
  - Supabase SDK menyimpan token customer di localStorage.
  - AuthProvider mengandalkan `onAuthStateChange` untuk restore session.
  - `fetchProfile` melakukan query ke tabel `user_profiles` dengan `.eq('id', supabaseUser.id).single()`.
  - Jika profil belum ada (kode `PGRST116`), provider melakukan insert baru.

* **Race Condition yang Dikurangi:**
  Komentar di file menjelaskan bahwa implementasi ini sudah mencoba menghindari race antara `getSession()` dan listener.
  Jadi untuk masalah utama, kemungkinan race ini **bukan** akar penyebab utama.

## 🛑 5. Kegagalan Penanganan Asinkronus (Asynchronous & Lifecycle Failures)

* **Race Condition / Hydration Block:**
  Hotspot utama adalah handler async `onAuthStateChange`:
  - Handler menjalankan `if (!initialized.current) { ... await fetchProfile(session.user); return; }`

  Jika `fetchProfile` mengakibatkan *hang* (mis. query ke Supabase macet karena token tidak valid/timeout) atau terjadi exception yang tidak tertangkap di level handler, maka `setIsLoading(false)` dan `return` tidak akan pernah terjadi.

* **Silent Failure Analysis:**
  - `fetchProfile` memakai `catch { setUser(...) }` (silent, tanpa `console.error`).
  - Tetapi silent di sini tidak menyebabkan crash, tetap bisa membuat context terlihat “tidak siap”.
  - Pada gejala kamu: `Zero Network Requests` setelah refresh. Itu mengarah ke pembekuan render pada level yang lebih atas dari halaman.

  Ini berarti kita harus cari kemungkinan:
  - handler AuthContext memicu redirect / navigation yang membuat public page unmounted sebelum fetch.
  - atau ada komponen root yang menunggu `isLoading` context auth, padahal yang diperlukan adalah tetap mount page fetching.

## 🔄 6. Urutan Eksekusi Logika Saat Refresh (Refresh Lifecycle Sequence)

```text
T=0ms (hard refresh)
  App mounts
    AuthProvider mounts
      registers supabase.auth.onAuthStateChange

T=50-300ms
  Supabase SDK tries restore token from storage
  emits INITIAL_SESSION (expected)

T=300-800ms
  AuthContext handler INITIAL_SESSION:
    initialized=false => true
    setSession(session)
    setIsLoading(false)   (hanya jika handler mencapai line itu)
    if session.user => await fetchProfile(user)

T=800ms+
  Navbar renders ACCOUNT/LOGIN
  Public pages should mount & execute their useEffect fetchProducts.

Bug branch:
  if handler stuck before setIsLoading(false)
  => downstream components depending on auth readiness remain blocked
  => public child data-fetch hooks never run
  => Zero Supabase network calls observed.
```

## 🔌 7. Rencana Perbaikan Kode (Proposed Code Remediation)

* **Lokasi Titik Kegagalan (Bug Location):**
  File ini berpotensi bermasalah pada bagian handler:
  - `if (!initialized.current) { ... await fetchProfile(session.user); return; }`

  dan pada `fetchProfile` yang melakukan `catch { ... }` tanpa log/observability.

* **Komparasi Kode (Sebelum vs Sesudah):**

```ts
// Sebelum (AuthContext.tsx) — risiko hydration lock + error swallowing
if (session?.user) await fetchProfile(session.user);
return;

// fetchProfile
} catch {
  setUser(buildProfile(supabaseUser, null));
}
```

```ts
// Sesudah — best practice: 1) pastikan isLoading selalu false, 2) jangan silent catch
if (session?.user) {
  try {
    await fetchProfile(session.user);
  } catch (e) {
    console.error('[AuthContext] fetchProfile failed:', e);
    setUser(buildProfile(session.user, null));
  }
}
setIsLoading(false);
return;

// fetchProfile
} catch (e) {
  console.error('[AuthContext] fetchProfile catch:', e);
  setUser(buildProfile(supabaseUser, null));
}
```

## 📐 8. Prinsip Desain yang Dilanggar & Solusinya

* **Lack of Observability:**
  `fetchProfile` melakukan `catch` tanpa logging sehingga pipeline debugging menjadi buta.

* **Fragile Control Flow (Hydration Hazard):**
  `setIsLoading(false)` harus dianggap sebagai *invariant* “provider siap setelah INITIAL_SESSION selesai memproses”. Tapi saat ini, invariant itu tergantung pada keberhasilan/kelancaran await `fetchProfile`.

* **Obscure States:**
  State `isLoading` berpotensi menggantung tanpa jalur fail-safe.

* **Enterprise-grade Fix:**
  - tambahkan `try/finally` di dalam handler INITIAL_SESSION
  - pastikan `setIsLoading(false)` dijamin
  - tambahkan observability (console.error / telemetry logger)

---

# 📄 user-fix-token.md (Dokumentasi Perbaikan Teknis Token)

Dokumentasi ini dibuat sebagai *enterprise-grade fix documentation* yang memetakan akar penyebab potensial pada file auth hydration. Dari hasil *deep scan* pada modul-modul yang memegang peran vital dalam session lifecycle, kandidat akar masalah utama adalah `AuthProvider/AuthContext.tsx` karena ia dapat menyebabkan *hydration block* yang membuat child fetching publik tidak pernah mount/menjalankan effect.

---

## Catatan RCA Status

* Analisis untuk file lain seperti `useProducts.js`, `HomePage.jsx`, `ProductsPage.jsx`, `CollectionsPage.jsx`, `CollectionDetailPage.jsx`, `Navbar.jsx` sudah dilakukan secara pembacaan isi file (tanpa modifikasi).
* Pada modul tersebut, pola fetching ke Supabase ada dan semestinya tetap terjadi pada rute publik.
* Karena gejala menunjukkan `Zero Network Requests`, maka akar paling mungkin adalah *render blocking/hard redirect* yang terjadi akibat status session/provider readiness yang tidak terselesaikan.

File lain dapat ditambahkan ke template laporan ini bila diminta untuk memperluas RCA sampai ke titik paling spesifik (mis. file yang melakukan global gating pada rendering publik).

