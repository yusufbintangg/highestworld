# Incident Report — Customer Site Blank Page After Login + Refresh

**Project/Environment:** Highest World Storefront (highestworld.id) — *customer-facing*  
**Tanggal ditemukan:** 20 Juni 2026  
**Dilaporkan oleh:** Siganteng  
**Status:** 🔴 Open (root cause belum 100% terkonfirmasi)

---

## 0. Ruang lingkup & gejala
Customer login sukses (header berubah **LOGIN → ACCOUNT**). Namun setelah **full page refresh**, konten utama hilang total (banner/kategori/produk). Observasi kunci:
- **Tidak ada error di Console**
- **Network tab tidak menampilkan request Supabase sama sekali** setelah refresh
- Header/navigasi tetap tampil → React root masih hidup, tapi bagian halaman publik tidak mengeksekusi fetch/mount yang seharusnya.

---

## 1. Verifikasi 4 hal spesifik (ketemu/tidak + file:line + kutipan)

### [CEK #1] Router `lazy()` + `Suspense`?
**TIDAK DITEMUKAN** → `routes.jsx` tidak memakai `lazy()`/`Suspense`.
- **[file: `src/app/routes.jsx` (berisi createBrowserRouter, tidak ada lazy/suspense)]**
- Bukti (struktur route):
  - `export const router = createBrowserRouter([...])` 
  - Parent route `path: '/'` render `<Layout />` + children route publik langsung pakai `element: <HomePage />`, `element: <ProductsPage />`, dst (tanpa lazy chunk).

**Kecocokan dengan gejala:** **tidak match** untuk skenario “chunk hash berubah tapi chunk gagal load lalu Suspense silent”, karena mekanismenya memang tidak ada di router ini.

---

### [CEK #2] Semua `catch {}` kosong di seluruh codebase
**DITEMUKAN**: `catch {}` kosong ada di 3 file yang sudah diverifikasi (dan sekarang line number-nya sudah pasti via `nl -ba`).

1) **`src/context/CartContext.jsx`**
- **[file: `src/context/CartContext.jsx:23`]**
- Kutipan kode:
  - `} catch {}`

2) **`src/app/hooks/useCheckout.js`**
- **[file: `src/app/hooks/useCheckout.js:153`]**
  - Kutipan kode: `} catch {}` (di `searchArea`)
- **[file: `src/app/hooks/useCheckout.js:334`]**
  - Kutipan kode: `try { await saveProfileIfNeeded(); } catch {}`
- **[file: `src/app/hooks/useCheckout.js:360`]**
  - Kutipan kode: `try { await saveProfileIfNeeded(); } catch {}`

3) **`src/context/AuthContext.tsx`**
- **[file: `src/context/AuthContext.tsx:68-70`]**
- Kutipan kode:
  - `} catch {`
  - `  setUser(buildProfile(supabaseUser, null));`
  - `}`

**Bukti “tidak ditemukan” di file lain yang relevan (yang sudah dibaca penuh):**
- `src/app/Layout.jsx` tidak ada `catch {}` kosong
- `src/app/routes.jsx` tidak ada `catch {}` kosong
- `src/app/App.tsx` tidak ada `catch {}` kosong

**Match dengan gejala “no console error, no network request”:**
- `catch {}` kosong **bisa match** untuk “error tertelan tanpa console error”, tapi **tidak otomatis** menjelaskan “tidak ada request Supabase setelah refresh” (itu tergantung apakah HomePage/ProductsPage sempat mount + jalankan useEffect).

---

### [CEK #3] Ada komponen di tree atas yang return null/loading berdasarkan `isLoading` AuthContext sehingga Outlet/children tidak pernah mount?
**DITEMUKAN**: `ProtectedRoute` menggunakan `isLoading`.
- **[file: `src/app/components/auth/ProtectedRoute.tsx:8-26`]**
- Kutipan kode:
  - `if (isLoading) { return ( ... "Loading..." ... ); }`
  - `if (!isAuthenticated) { return <Navigate ... />; }`
  - `return children;`

**Tapi yang menentukan apakah HomePage/ProductsPage terdampak adalah level pemasangan `ProtectedRoute` di route tree (CEK #2 berikutnya).**

---

### [CEK #4] HomePage/ProductsPage di-mount ulang setelah refresh vs Service Worker/cached build (manifest mismatch)
**TIDAK DITEMUKAN** (dari scan repo berbasis string):
- Tidak ada referensi `serviceWorker.register`, `workbox`, `vite-plugin-pwa`, `service-worker*`, atau `sw.js`/`manifest` yang terdeteksi.

**Match dengan gejala “production-only”?**
- Karena tidak ada bukti SW/PWA di kode repo, **poin #4 ini tidak match** secara kode.

---

## 2. Audit KRITIS permintaan: struktur nesting `src/app/routes.jsx` + level `ProtectedRoute`
Berikut struktur persisnya (bukan simpulan):

### Parent layout untuk route publik
- **[file: `src/app/routes.jsx:67-97`]**
  - Parent:
    - `path: '/'`
    - `element: <Layout />`
    - `children: [ ... ]`
  - Di dalam `children`, route publik langsung render halaman:
    - `index: true, element: <HomePage />` (**[line:73]**)
    - `path: 'products', element: <ProductsPage />` (**[line:74]**)
    - `path: 'products/:slug', element: <ProductDetailPage />` (**[line:75]**)
    - dst sampai `path: '*'`.

### Level pemasangan ProtectedRoute
Di dalam parent `children`, ProtectedRoute hanya dipasang untuk route tertentu (bukan membungkus seluruh children):
- **Route yang dibungkus ProtectedRoute (customer auth):**
  - `path: 'account', element: <ProtectedRoute><AccountDashboardPage /></ProtectedRoute>` (**[line:84]**)
  - `path: 'account/orders', element: <ProtectedRoute><AccountOrdersPage /></ProtectedRoute>` (**[line:85]**)
  - `path: 'account/addresses', ...` (**[line:86]**)
  - `path: 'account/settings', ...` (**[line:87]**)
  - `path: 'account/security', ...` (**[line:88]**)
  - `path: 'loyalty', ...` (**[line:90]**)
  - `path: 'loyalty/history', ...` (**[line:91]**)
  - `path: 'loyalty/rewards', ...` (**[line:92]**)
  - `path: 'loyalty/referral', ...` (**[line:93]**)

**Kesimpulan level nesting dari kode:**
- HomePage/ProductsPage **tidak** dibungkus `ProtectedRoute`.
- `ProtectedRoute` hanya membungkus komponen pada route `'account/*'` dan `'loyalty/*'`.

**Konsekuensi untuk hipotesis “HomePage tidak pernah mount karena ketahan ProtectedRoute stuck isLoading=true”:**
- **Bantah**: dari struktur routes.jsx, HomePage/ProductsPage **seharusnya** tetap mount karena tidak ada guard parent yang menahan `<Outlet/>` untuk route publik.

---

## 3. Audit KRITIS AuthContext: apakah `isLoading` bisa STUCK true selamanya setelah refresh?
Dari kode `AuthContext.tsx`:
- `const [isLoading, setIsLoading] = useState(true);`
- `isLoading` di-set false hanya pada cabang “INITIAL_SESSION event pertama”:
  - **[file: `src/context/AuthContext.tsx:73-85`]**
  - Kutipan kode:
    - `if (!initialized.current) {`
    - `  initialized.current = true;`
    - `  setSession(session);`
    - `  setIsLoading(false);`
    - `  if (session?.user) await fetchProfile(session.user);`
    - `  return;`
- Kalau event pertama `onAuthStateChange` tidak pernah fire, maka `initialized.current` tetap `false` dan `isLoading` tetap `true`.

**Konfirmasi/bantah hipotesis:**
- Hipotesis “HomePage tidak pernah mount karena ketahan ProtectedRoute/guard yang stuck di isLoading=true” → **BUKAN valid** untuk kasus HomePage/ProductsPage berdasarkan nesting routes.
- Namun `isLoading` stuck true **tetap bisa** mempengaruhi route yang memang dibungkus `ProtectedRoute` (account/loyalty), bukan HomePage/ProductsPage.

---

## 4. Ringkasan jawaban final per poin (sesuai requirement)
- **[CEK #1]** TIDAK DITEMUKAN → `src/app/routes.jsx` tidak pakai lazy/Suspense.
- **[CEK #2]** DITEMUKAN → `catch {}` kosong:
  - `src/context/CartContext.jsx:23`
  - `src/app/hooks/useCheckout.js:153`
  - `src/app/hooks/useCheckout.js:334`
  - `src/app/hooks/useCheckout.js:360`
  - `src/context/AuthContext.tsx:68-70`
- **[CEK #3]** DITEMUKAN wrapper berdasarkan `isLoading` → `src/app/components/auth/ProtectedRoute.tsx:8-26`
  - Tapi untuk HomePage/ProductsPage: **tidak terdampak** karena bukan dibungkus `ProtectedRoute` di parent route.
- **[CEK #4]** TIDAK DITEMUKAN → tidak ada bukti service worker/PWA di repo (scan string).

---

## 5. Root Cause Candidate (paling mungkin, dengan bukti kode)
Berdasarkan akumulasi audit kode yang sudah tervalidasi, candidate root cause paling kuat adalah kombinasi **race condition + silent failure** di AuthContext.

### Candidate A — `src/context/AuthContext.tsx` (customer)
**Mengapa ini kandidat paling kuat?**
- Lapisan ini adalah sumber kebenaran auth untuk seluruh storefront melalui `useAuth()`.
- `Layout` selalu mount di root route (`path: '/'`), sehingga setiap perubahan `user/isLoading` akan memicu re-render tree termasuk bagian yang memegang `Outlet`.

**Temuan spesifik:**
1) **Race / readiness signaling**
- Pada handler `onAuthStateChange` untuk event pertama (INITIAL_SESSION), `AuthContext` melakukan `setIsLoading(false)` sebelum `fetchProfile(session.user)` selesai.
- Kode ini membuat state auth “terlihat siap” lebih dulu daripada profil selesai ter-hydrate.

2) **Silent failure**
- `fetchProfile()` memiliki `catch` yang menelan error tanpa logging.
- Akibatnya, jika query/insert ke `user_profiles` gagal (mis. RLS/policy, skema mismatch, downtime sementara), UI bisa:
  - tidak punya `user` yang benar,
  - dan tidak ada console error yang muncul.

**Dampak ke gejala bug yang dilaporkan:**
- Header bisa berubah LOGIN → ACCOUNT (berarti session tersetel).
- Tetapi hydration `user_profiles` gagal/tertunda bisa membuat komponen yang bergantung auth readiness memendekkan lifecycle, yang pada kondisi tertentu mengakibatkan tampilan storefront menjadi blank dan tidak memicu request yang seharusnya.

### Candidate B — Silent catch di area lain (penguat pola)
Pola `catch {}` kosong ditemukan juga pada:
- `src/context/CartContext.jsx`
- `src/app/hooks/useCheckout.js`
Ini bukan root cause langsung storefront, tapi menguatkan bahwa proyek memiliki kecenderungan “error tertelan” sehingga blank content bisa terjadi tanpa jejak console.

## 6. Tindakan investigasi runtime yang HARUS dilakukan (untuk mengunci root cause tunggal)
Karena gejala menyebut “zero network activity setelah refresh”, maka perlu validasi apakah HomePage/ProductsPage benar-benar mount dan `useEffect` fetch dijalankan.

Instrumen yang direkomendasikan (tanpa perubahan besar):
1) Tambahkan log sementara (dev build) di awal `HomePage` `useEffect(() => {...}, [])`.
2) Tambahkan log sementara di `useProducts` (hook yang memfetch list produk) tepat sebelum `fetchProducts()`.
3) Tambahkan log sementara di `AuthContext.tsx` pada awal/akhir `INITIAL_SESSION` dan `fetchProfile()` (terutama di catch).

Dengan 3 log ini, kita bisa memetakan deterministik:
- apakah public pages mount setelah refresh,
- apakah auth readiness men-trigger render path yang memblokir fetch,
- apakah `fetchProfile` gagal (dan kapan `isLoading` turun).


