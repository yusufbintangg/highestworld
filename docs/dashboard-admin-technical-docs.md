# Dashboard Admin — Enterprise-Grade Technical Documentation

> Catatan: Dokumentasi ini disusun sebagai **satu file besar**. Setiap file admin memiliki blok template lengkap (tanpa gabungan antar file).

---

# 📄 src/context/AdminAuthContext.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Modul ini menyediakan *role-aware authentication state* untuk pengguna bertipe **admin** pada dashboard. Seluruh komponen admin memperoleh akses melalui *React Context* yang mengekspose state `admin`, status `loading`, serta aksi `signIn` dan `signOut`.
- **Tanggung Jawab Utama:**
  * Menginisialisasi session admin dari Supabase dengan *session restore* menggunakan `supabase.auth.getSession()`.
  * Menerapkan verifikasi otorisasi berbasis database pada tabel `admin_users` (kolom `is_active`, `role`) sehingga “logged-in via Supabase” tidak otomatis berarti “berhak akses dashboard”.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/lib/supabaseAdmin.js` (sumber client Supabase admin)
  * `src/app/components/auth/AdminProtectedRoute.tsx` (mengonsumsi `useAdminAuth()`)
  * `src/app/pages/admin/AdminLayout.jsx` (mengonsumsi `useAdminAuth()`)
  * `src/app/pages/admin/AdminLogin.jsx` (mengonsumsi `useAdminAuth()`)
- **Diagram Alur Makro:**
```text
[App Mount]
   |
   v
[AdminAuthProvider: MOUNT]
   |
   |-- withTimeout(getSession)
   |-- if session.user exists -> checkAdminRole(user)
   |-- else: loading=false
   |
   |-- onAuthStateChange(subscription)
   |     |
   |     |-- SIGNED_IN / TOKEN_REFRESHED -> checkAdminRole(session.user)
   |     |-- SIGNED_OUT -> setAdmin(null), loading=false
   |
   v
[Context Value]
{ admin, loading, signIn, signOut }
   |
   v
[AdminProtectedRoute/AdminLayout/AdminLogin]
   |
   |-- guard redirect based on {admin, loading}
   v
[Dashboard Admin Render]
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:**
  * Context state: 
    - `admin: object | null`
    - `loading: boolean`
  * Server-driven state (Supabase):
    - `supabase.auth.getSession()` menghasilkan `session.user`
    - tabel `admin_users` via query `.from('admin_users')... maybeSingle()`
- **Local State:**
  * `initialized.current: boolean` (guard untuk mencegah race saat listener auth first emit)
  * `roleCheckRetries.current: number` + `maxRetries=3`
  * `sessionMissCount.current: number` (validasi berkala konsistensi session)
- **Skema / Contoh Struktur Data:**
  * `admin` terbentuk dari gabungan `user` (dari Supabase auth) + `adminUser` (dari `admin_users`):

```ts
type Admin = {
  id: string;          // user.id
  email: string;       // user.email
  // user fields may include more
  full_name?: string; // from admin_users
  role?: string;      // from admin_users
  is_active?: boolean;// from admin_users
  // plus any fields from supabase auth user
}
```

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * **Isolasi token session admin** melalui `src/lib/supabaseAdmin.js` dengan `storageKey: 'hw-admin-session'`.
  * **Role enforcement via server validation**:
    - `checkAdminRole()` query ke `admin_users` dan mengecek `is_active=true`.
    - Menggunakan `maybeSingle()` untuk mencegah ambiguitas.
  * **Defensive async timeouts**:
    - `withTimeout()` menolak query yang “hang” agar UI tidak infinite loading.
  * **Client-side guard**:
    - Guard redirect dikerjakan oleh `AdminProtectedRoute` & `AdminLayout` berdasarkan `admin` dan `loading`.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * `checkAdminRole()`:
    - menangkap error query Supabase termasuk error dari timeout wrapper.
    - melakukan retry terbatas (`maxRetries=3`) dengan exponential backoff.
    - apabila retry habis: memaksa `setLoading(false)` agar UI tidak hang.
  * `initFromStorage()`:
    - membungkus `getSession()` dengan timeout.
    - bila timeout terjadi, catch mencegah proses berhenti tanpa state update.
  * Listener `onAuthStateChange` juga dilindungi try/catch.
- **Retry Strategy:**
  * Backoff:
    - delay = `min(1000 * 2^(attempt-1), 8000)`
    - attempt mulai dari 1 saat retry pertama.
  * Retry hanya terjadi saat `!isRetry` dan `roleCheckRetries.current < maxRetries`.
- **Timeout & Fallback Strategy:**
  * `withTimeout(..., 5000)` untuk role check query ke `admin_users`.
  * `getSession` init: `withTimeout(..., 5000)`
  * fallback timer: 
    - `fallbackTimeout=3000` sebelum melakukan fallback restore
    - fallback `getSession` timeout: `4000`
  * hard timeout:
    - `8s` memaksa `setLoading(false)`.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
AdminAuthProvider Mount
  |
  +--> initFromStorage()
  |       |
  |       +--> withTimeout(getSession, 5000)
  |       |       |
  |       |       +--> if session.user:
  |       |              +--> checkAdminRole(user, false)
  |       |              +--> initialized=true; setLoading(false)
  |       |              +--> else: loading tetap? (tidak setLoading di branch ini, namun fallback/hard timeout menangani)
  |       |
  |       +--> catch(timeout/error): proses tidak meninggalkan loading menggantung (hard timeout)
  |
  +--> onAuthStateChange subscription
  |       |
  |       +--> first emit (INITIAL_SESSION): initialized.current guard
  |       +--> subsequent events:
  |            SIGNED_OUT  -> setAdmin(null), loading=false
  |            SIGNED_IN   -> checkAdminRole(user), loading=false
  |            TOKEN_REFRESHED -> checkAdminRole(user), loading=false
  |
  +--> fallback timer (3s)
  |       +--> if !initialized.current:
  |              withTimeout(getSession, 4000)
  |              checkAdminRole(user)
  |              setLoading(false)
  |
  +--> hardTimeout (8s)
          +--> setLoading(false)

AdminAuthProvider Unmount
  |
  +--> unsubscribe() listener
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Fungsi / Hooks / Komponen yang Diekspor:**
  * `AdminAuthProvider({ children }) -> JSX.Element`
    - **Parameter:**
      - `children: ReactNode`
    - **Output:**
      - Context provider berisi `{ admin, loading, signIn, signOut }`.
  * `useAdminAuth() -> { admin, loading, signIn, signOut }`
    - **Output:**
      - throw error bila dipakai di luar provider.

- **Rincian Implementasi API (signIn/signOut):**
  * `signIn(email: string, password: string) -> Promise<AuthSignInResponse>`
    - Memanggil `supabase.auth.signInWithPassword` (timeout 8000ms).
    - Melakukan lookup admin role via `admin_users` (timeout 5000ms).
    - Jika bukan admin aktif: `supabase.auth.signOut()` dan throw `new Error('Akses ditolak. Bukan admin.')`.
  * `signOut() -> Promise<void>`
    - `supabase.auth.signOut()` dan `setAdmin(null)`.

- **Contoh Implementasi Penggunaan:**
```javascript
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';

function AdminHeader() {
  const { admin, signOut, loading } = useAdminAuth();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <span>{admin?.email}</span>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}

export function AdminRoot() {
  return (
    <AdminAuthProvider>
      <AdminHeader />
    </AdminAuthProvider>
  );
}
```

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Defensive Programming:** timeout wrapper + `setLoading(false)` pada skenario retry habis.
- **Fail Fast on Authorization:** sign-in tidak langsung dianggap authorized; role check dilakukan pasca autentikasi.
- **Separation of Concerns:**
  - `withTimeout` abstraksi untuk ketahanan jaringan.
  - `checkAdminRole` fokus pada otorisasi.
  - `AdminAuthProvider` fokus pada orkestrasi lifecycle session.
- **Observable/Structured Logging:** fungsi `log/warn/err` dengan prefix timestamp.

---

# 📄 src/lib/supabaseAdmin.js

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Menyediakan instance Supabase client khusus untuk kebutuhan **admin**. Modul ini memisahkan storage token admin dari customer agar tidak terjadi *session pollution* atau konflik key di `localStorage`.
- **Tanggung Jawab Utama:**
  * Menginisialisasi Supabase client dengan parameter runtime environment `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
  * Mengaktifkan persist session + auto refresh token untuk admin.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/context/AdminAuthContext.jsx` (mengimpor `supabase`)
- **Diagram Alur Makro:**
```text
[Admin Pages]
   |
   v
[AdminAuthContext]
   |
   +--> import { supabase }
   v
[Supabase Client]
   |
   +--> storageKey='hw-admin-session'
   +--> persistSession=true
   +--> autoRefreshToken=true
   |
   v
[Supabase Auth + DB Queries]
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:**
  * state supabase tidak disimpan manual; Supabase SDK mengelola token + auto refresh.
- **Local State:** tidak ada.
- **Skema / Contoh Struktur Data:**
  * Tidak berlaku khusus. Modul ini hanya mengekspor client.

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * **Token isolation:** `storageKey: 'hw-admin-session'`.
  * Mengurangi *storage lock collision* terhadap client customer (yang default-nya lain).
  * `detectSessionInUrl: false` mencegah pembacaan session dari URL (mengurangi risiko injection via querystring redirect).

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * Modul ini tidak meng-handle error; error ditangani upstream (mis. `AdminAuthContext` memakai `withTimeout`).
- **Retry Strategy:** tidak ada.
- **Timeout & Fallback Strategy:** tidak ada.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Module Import
  |
  +--> createClient(url, anonKey, authOptions)
  |
  +--> eksport `supabase`

Runtime usage
  |
  +--> AuthProvider/queries menggunakan `supabase` untuk auth & DB access
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Fungsi / Hooks / Komponen yang Diekspor:**
  * `supabase: SupabaseClient`

- **Contoh Implementasi Penggunaan:**
```javascript
import { supabase } from '@/lib/supabaseAdmin';

const { data, error } = await supabase.from('admin_users').select('*');
```

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Explicit Configuration:** storageKey dan auth options didefinisikan jelas.
- **Least Interference:** tidak mempengaruhi flow customer.

---

# 📄 src/app/components/auth/AdminProtectedRoute.tsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Guard route untuk memastikan user yang membuka subtree admin memenuhi dua syarat:
  1) customer auth tidak boleh sudah login (jika sudah login customer, redirect ke `/`),
  2) harus memiliki admin session dari `AdminAuthContext`.
- **Tanggung Jawab Utama:**
  * Mengorkestrasi redirect berdasarkan kombinasi `useAuth()` dan `useAdminAuth()`.
  * Menyajikan loading UI saat salah satu context masih memulihkan session.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/context/AuthContext.tsx` (customer auth)
  * `src/context/AdminAuthContext.jsx` (admin auth)
  * React Router `Navigate` & `useLocation`
- **Diagram Alur Makro:**
```text
[ProtectedRoute Render]
  |
  +--> const { isAuthenticated, isLoading } = useAuth()
  +--> const { admin, loading } = useAdminAuth()
  |
  +--> if userLoading||adminLoading -> show 'Checking access...'
  +--> else if userLoggedIn -> Navigate('/')
  +--> else if !admin -> Navigate('/admin/login')
  +--> else -> render children
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:**
  * `useAuth()` menyediakan `isAuthenticated`, `isLoading`
  * `useAdminAuth()` menyediakan `admin`, `loading`
- **Local State:** tidak ada.
- **Skema / Contoh Struktur Data:**
```ts
children: ReactNode
```

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * **Role enforcement (client-side):** akses admin ditentukan oleh keberadaan `admin` di context.
  * **Redirect customer away:** jika customer sudah login, blokir akses ke admin panel.
  * **Loading gating:** mencegah “flash” halaman admin saat state belum ter-restore.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * Tidak ada internal try/catch. Jika context tidak tersedia, hook akan throw.
- **Retry Strategy:** tidak ada.
- **Timeout & Fallback Strategy:**
  * Timeout implementasi ada di `AdminAuthContext` (upstream).

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Render
  |
  +--> derive isLoading
  |
  +--> if isLoading => render spinner UI
  |
  +--> else => choose Navigate/children
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Komponen yang Diekspor:**
  * `AdminProtectedRoute({ children }) -> JSX.Element`
    - `children: ReactNode`

- **Contoh Implementasi Penggunaan:**
```jsx
<AdminProtectedRoute>
  <AdminDashboard />
</AdminProtectedRoute>
```

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Guard Clause:** alur dibuat berlapis dengan early return.
- **Separation of Concerns:** guard hanya mengatur navigasi/akses, tidak menangani data.

---

# 📄 src/app/routes.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Mendefinisikan seluruh route mapping aplikasi menggunakan `createBrowserRouter` (React Router). Memuat subtree admin dengan wrapper `AdminRoot` agar `AdminAuthProvider` dan `QueryClientProvider` selalu tersedia di area `/admin`.
- **Tanggung Jawab Utama:**
  * Register rute public (login/register/checkout/home) dan private customer routes melalui `ProtectedRoute`.
  * Register rute admin:
    - `/admin/login`
    - `/admin` dengan `AdminLayout` dan child pages `AdminDashboard/AdminProducts/AdminOrders/AdminStock`.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/context/AdminAuthContext.jsx` (via `AdminRoot`)
  * `@tanstack/react-query` QueryClientProvider
  * `src/app/pages/admin/AdminLayout.jsx` sebagai shell route
  * `src/app/pages/admin/*` sebagai leaf route components
- **Diagram Alur Makro:**
```text
URL Request
  |
  v
React Router matched route
  |
  +--> if /admin:
        AdminRoot
          |
          +--> QueryClientProvider(adminQueryClient)
          +--> AdminAuthProvider
          +--> Outlet

/ admin children -> AdminLayout -> <Outlet/> -> page
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:**
  * `adminQueryClient` dengan default query options:
    - `staleTime: 5m`
    - `gcTime: 10m`
    - `retry: 1`
    - `refetchOnWindowFocus: false`
- **Local State:** tidak ada.
- **Skema / Contoh Struktur Data:**
  * `route definitions` array.

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * Subtree `/admin` dibungkus oleh `AdminAuthProvider`.
  * Guard akses spesifik admin dilakukan oleh komponen `AdminLayout` (redirect jika tidak admin) dan/atau `AdminProtectedRoute` (bila dipakai).

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:** tidak ada.
- **Retry Strategy:** React Query default `retry: 1` untuk query admin.
- **Timeout & Fallback Strategy:** tidak ada di level routes (timeout ada di context/hook).

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
BrowserRouter/Router Provider
  |
  +--> resolve route element
  +--> render AdminRoot (if /admin)
        |
        +--> instantiate QueryClient
        +--> mount AdminAuthProvider
        +--> mount AdminLayout
              |
              +--> redirect to /admin/login if !admin and !loading
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Ekspor:**
  * `router` (createBrowserRouter output)
  * `adminQueryClient` didefinisikan internal.

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Configuration via Router Composition:** dependency injection via provider.
- **Performance-aware defaults:** staleTime/gcTime untuk mengurangi fetch berulang.

---

# 📄 src/app/pages/admin/AdminLayout.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Shell layout untuk area admin. Menyediakan navigasi sidebar, topbar dengan welcome, dan menampilkan konten halaman admin melalui `<Outlet />`.
- **Tanggung Jawab Utama:**
  * Menangani redirect ketika admin belum tersedia setelah loading selesai.
  * Menyediakan UI navigasi rapi untuk pages: Dashboard/Produk/Stock/Order.
  * Mengimplementasi mekanisme logout melalui `signOut` dari `AdminAuthContext`.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/context/AdminAuthContext.jsx` (`admin`, `loading`, `signOut`)
  * React Router `Outlet`, `NavLink`, `useNavigate`
  * UI components: `Button`, lucide icons.
- **Diagram Alur Makro:**
```text
AdminLayout Mount
  |
  +--> useEffect([admin,loading])
         |
         +--> if !loading && !admin => navigate('/admin/login')

Render
  |
  +--> if loading => show Loading UI
  +--> else if !admin => return null
  +--> else => render Sidebar + Topbar + <Outlet/>

Logout button
  |
  +--> signOut() -> setAdmin(null)
  +--> navigate('/admin/login')
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:**
  * context: `admin`, `loading`, `signOut`
- **Local State:**
  * `sidebarOpen: boolean` untuk mobile overlay.
- **Skema / Contoh Struktur Data:** tidak ada.

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * **Client-side access control:** redirect untuk mencegah akses UI admin tanpa admin session.
  * **Loading gate:** menghindari rendering admin UI sebelum context terinisialisasi.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:** tidak ada.
- **Retry Strategy:** tidak ada.
- **Timeout & Fallback Strategy:**
  * Fallback diperankan oleh `AdminAuthContext` (hard timeout 8s). Layout hanya merespons state `loading`.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
1) Mount
2) evaluate useEffect redirect logic
3) if loading => show spinner
4) if !admin => return null
5) render layout
6) user click logout => signOut + navigate
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Komponen yang Diekspor:**
  * `AdminLayout() -> JSX.Element`

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Single Responsibility:** layout UI + guard redirect.
- **State gating:** loading/admin null conditions.

---

# 📄 src/app/pages/admin/AdminLogin.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Form UI untuk autentikasi admin. Mengambil `signIn` dari `AdminAuthContext` dan mengelola input form (email/password) + loading state saat request.
- **Tanggung Jawab Utama:**
  * Mengirim kredensial admin ke `signIn(email,password)`.
  * Mengarahkan user ke `/admin` setelah berhasil login.
  * Menampilkan error dengan toast.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/context/AdminAuthContext.jsx`
  * `sonner` toast
  * React Router `useNavigate`
- **Diagram Alur Makro:**
```text
User input (email,password)
  |
  v
onSubmit
  |
  +--> AdminAuthContext.signIn(email,password)
  |       |
  |       +--> supabase auth signIn + admin_users role check
  |
  +--> if success => navigate('/admin')
  |
  +--> if fail => toast.error(error.message)
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:** `admin` & `signIn` dari context.
- **Local State:**
  * `email`, `password`
  * `loading` untuk disable button dan spinner text.
- **Skema / Contoh Struktur Data:**
```ts
form: { email: string, password: string }
```

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * Validasi server-side dilakukan oleh `signIn()` (mencegah login non-admin).
  * UI level: disable tombol saat loading.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * catch error -> `toast.error(error.message)`
- **Retry Strategy:** tidak ada.
- **Timeout & Fallback Strategy:**
  * Timeout ada di `AdminAuthContext.signIn()` (withTimeout 8000ms untuk signIn, 5000ms untuk lookup).

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Mount
  |
  +--> useEffect: if(admin) navigate('/admin')

Submit
  |
  +--> setLoading(true)
  +--> await signIn(email,password)
  +--> navigate('/admin')
  +--> finally setLoading(false)
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Komponen yang Diekspor:**
  * `AdminLogin() -> JSX.Element`

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Fail-Safe Authorization:** admin approval ditentukan oleh context.
- **UI responsiveness:** loading state.

---

# 📄 src/app/pages/admin/AdminDashboard.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Menampilkan ringkasan metrik bisnis untuk admin: total produk, total order, pending order, revenue, order terbaru, dan varian dengan stok rendah.
- **Tanggung Jawab Utama:**
  * Mengambil data dashboard melalui React Query.
  * Menghitung total revenue (reduce dari order `total`) dan menampilkan status label.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/lib/supabaseAdmin.js` via `supabase`.
  * `src/lib/utils.js` (`formatPrice`).
  * TanStack React Query `useQuery`.
- **Diagram Alur Makro:**
```text
AdminDashboard Render
  |
  +--> useQuery(queryKey='admin-dashboard', queryFn)
         |
         +--> supabase.from('products').select(... count)
         +--> supabase.from('orders').select(... count)
         +--> supabase.from('orders').eq(status='waiting_payment') count
         +--> supabase.from('orders').select('total').in(status=[...])
         +--> supabase.from('orders').select('*').order(created_at desc).limit(5)
         +--> supabase.from('product_variants').select('*, products(name)').lt(stock,5)
  |
  v
Render skeleton if isLoading else render cards + tables
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:** server state dari Supabase.
- **Local State:** tidak ada.
- **Skema / Contoh Struktur Data:**
```ts
queryResult = {
  stats: {
    totalProducts: number,
    totalOrders: number,
    pendingOrders: number,
    totalRevenue: number,
  },
  recentOrders: Array<Order>,
  lowStock: Array<ProductVariantWithProduct>
}
```

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * Tidak ada enforcement spesifik di file ini; diasumsikan hanya admin yang dapat mengakses karena guard/context.
  * Tidak ada data sanitization karena data bersifat display (text/number).

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * React Query akan menangani error state secara default; di code ini tidak ada `onError`, namun error dilempar oleh queryFn.
- **Retry Strategy:**
  * Default React Query retry: `1` (di `routes.jsx` untuk adminQueryClient).
- **Timeout & Fallback Strategy:**
  * Tidak ada timeout wrapper di sini.
  * UI fallback adalah skeleton via `isLoading`.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Mount
  |
  +--> useQuery triggers queryFn

queryFn sequential awaits
  |
  +--> gather stats
  +--> gather recentOrders
  +--> gather lowStock

Render
  |
  +--> if isLoading: show skeleton cards
  +--> else: render stats cards + recent orders + low stock lists
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Komponen yang Diekspor:**
  * `AdminDashboard() -> JSX.Element`

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Separation of Concerns:** data fetching via React Query, rendering via JSX.
- **Declarative UI:** cards berdasarkan array `statCards`.

---

# 📄 src/app/pages/admin/AdminProducts.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Halaman daftar produk admin. Menampilkan tabel produk, search, modal tambah/edit produk, serta modal edit varian.
- **Tanggung Jawab Utama:**
  * Menyediakan wiring props dari hook `useAdminProducts()` ke komponen UI.
  * Mengatur kondisi rendering loading vs tabel.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/app/hooks/useAdminProducts.js`
  * `src/app/components/admin/ProductFormModal.jsx`
  * `src/app/components/admin/EditVariantModal.jsx`
  * UI: `Button`, `Input`.
- **Diagram Alur Makro:**
```text
AdminProducts Render
  |
  +--> useAdminProducts()
         |
         +--> React Query: admin-products/admin-categories
         +--> local state: modal form + variants
  |
  +--> render UI
       |
       +--> show ProductFormModal if showForm
       +--> show EditVariantModal if editingVariant
       +--> render table with filtered products
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:** query state dari React Query dalam hook.
- **Local State:** tidak ada (hanya konsumsi hook).
- **Skema / Contoh Struktur Data:**
  * `products` array items dengan shape includes `categories?.name`.

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * Semua mutasi dilakukan via `useAdminProducts` yang menggunakan Supabase admin client.
  * UI tidak melakukan sanitization; diasumsikan backend melindungi dan data aman untuk ditampilkan.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * Tidak terlihat di halaman ini; error query ditangani React Query default.
- **Retry Strategy:** React Query admin default `retry: 1`.
- **Timeout & Fallback Strategy:** skeleton saat `loading`.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Mount
  |
  +--> hook useAdminProducts
  |
  +--> if loading products => skeleton
  |
  +--> else => render table

User actions
  |
  +--> click Tambah Produk -> showForm=true
  +--> click Edit -> set editProduct + existingVariants + showForm=true
  +--> click Delete -> confirm + delete via supabase
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Komponen yang Diekspor:**
  * `AdminProducts() -> JSX.Element`

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Container/Presenter Pattern (semi):** halaman menjadi container yang mendelegasikan logic ke hook.

---

# 📄 src/app/pages/admin/AdminStock.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Halaman manajemen stock untuk produk/varian. Admin dapat mencari varian, mengedit stock inline, dan menyimpan update massal.
- **Tanggung Jawab Utama:**
  * Fetch data `products` dan `product_variants` untuk keperluan tampilan tabel.
  * Mengelola state perubahan stock (`editedStocks`) dan melakukan update Supabase secara batch.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/lib/supabaseAdmin.js` via `supabase`.
  * React Query `useQuery` dan `useQueryClient`.
  * `src/lib/utils.js` (formatPrice)
  * UI: `Input`, `Button`, lucide.
- **Diagram Alur Makro:**
```text
AdminStock Mount
  |
  +--> useQuery('admin-stock')
       |
       +--> select products where is_active=true
       +--> select product_variants join products
  |
  +--> render table grouped by product

User edit
  |
  +--> editedStocks[variantId] = newStock

User Save All
  |
  +--> create updates array from editedStocks
  +--> Promise.all(updates)
  +--> toast success + clear editedStocks
  +--> invalidateQueries('admin-stock')
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:** query state `stockData`.
- **Local State:**
  * `search: string`
  * `filterProduct: string` ('all' or productId)
  * `editedStocks: Record<string, number|string>`
  * `saving: boolean`
- **Skema / Contoh Struktur Data:**
```ts
type EditedStocks = {
  [variantId: string]: number | string
}

type StockData = {
  products: Array<{ id:string, name:string, price:number, original_price:number }>,
  variants: Array<{ id:string, products?:{ id:string, name:string, price:number, original_price:number },
                    color?:string, color_hex?:string, size?:string,
                    sku?:string, msku?:string, stock:number, price?:number, original_price?:number }>
}
```

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * pembatasan stock >= 0 via `Math.max(0, current + delta)`.
  * Mutasi memakai supabase update query berdasarkan `variant id`.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * Tidak ada try/catch saat `Promise.all(updates)`; jika ada request gagal, UI bisa tetap in-flight tanpa toast.
- **Retry Strategy:** none.
- **Timeout & Fallback Strategy:** none.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Mount
  |
  +--> fetch products+variants

Render
  |
  +--> show skeleton while isLoading
  +--> else build filtered/sorted/grouped view

User
  +--> change input number => handleStockChange
  +--> +/- buttons => handleAdjust
  +--> Save => handleSaveAll
        |
        +--> if no edited -> toast info
        +--> else Promise.all(update)
        +--> invalidateQueries
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Komponen yang Diekspor:**
  * `AdminStock() -> JSX.Element`

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Optimistic UI-ish (local editing):** perubahan disimpan di state lokal dulu.
- **Grouping/Sorting:** computed derivations untuk UX.

---

# 📄 src/app/hooks/useAdminProducts.js

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Hook ini bertindak sebagai controller untuk halaman admin produk: mengambil data products+categories, menyediakan state form modal, dan melakukan CRUD untuk produk serta manajemen varian (produk, varian baru, edit varian existing, delete).
- **Tanggung Jawab Utama:**
  * Menyediakan data untuk tabel: `filtered`, `categories`, `loading`.
  * Mengatur state modal form dan state varians (`variants` untuk input baru; `existingVariants` untuk edit mode).
  * Mengimplementasikan transaksi mutasi ke Supabase.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/lib/supabaseAdmin.js`
  * Supabase tables: `products`, `categories`, `product_variants`.
  * React Query `useQuery` dan `useQueryClient`.
- **Diagram Alur Makro:**
```text
useAdminProducts()
  |
  +--> useQuery('admin-products')
       +--> products select join categories

  +--> useQuery('admin-categories')
       +--> categories select is_active=true

UI modal
  |
  +--> handleOpenAdd -> reset form/variants
  +--> handleOpenEdit -> load existingVariants then showForm=true

Submit
  |
  +--> if editProduct: update products
  +--> else insert products -> productId from response

  +--> if variants valid:
        insert product_variants with payload derived from variants state

Post actions
  +--> invalidateQueries('admin-products')
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:** React Query caches; mutasi via Supabase.
- **Local State:**
  * `search` untuk filter client-side.
  * `showForm`, `editProduct`, `form`.
  * `variants` array (varian baru yang akan diinsert).
  * `existingVariants` array (varian yang sudah ada; dipakai untuk tampilan existing dalam form modal).
  * `editingVariant` object (untuk EditVariantModal).
  * `sizeType: 'pakaian'|'celana'` dan `sizeOptions` derived.
- **Skema / Contoh Struktur Data:**
  * `emptyVariant` shape:
```ts
{
 color: string,
 color_hex: string,
 size: string,
 sku: string,
 msku: string,
 stock: number,
 price: string,
 original_price: string,
 images: string
}
```

  * `emptyForm` shape:
```ts
{
 name: string,
 slug: string,
 description: string,
 price: string,
 original_price: string,
 category_id: string,
 weight: string,
 images: string,
 badges: string[],
 is_active: boolean,
 size_chart_image: string,
 shopee_url: string,
 tokopedia_url: string,
}
```

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * `confirm()` sebelum delete product.
  * Mutasi admin dilakukan dengan client admin yang terisolasi token.
  * Payload melakukan coercion angka (parseInt) untuk field harga/weight.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * sebagian besar operation handle error via `toast.error` dan return.
  * contoh: saat insert/update produk gagal => toast error.
- **Retry Strategy:** none.
- **Timeout & Fallback Strategy:** none di hook ini (timeout ada di AdminAuthContext saat signIn, bukan untuk CRUD).

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Mount useAdminProducts
  |
  +--> query products + categories

User flow add
  +--> handleOpenAdd
  +--> showForm
  +--> handleSubmit
        +--> insert/update products
        +--> insert product_variants
  +--> invalidateQueries

User flow edit existing variant
  +--> handleOpenEditExistingVariant
  +--> EditVariantModal -> handleSaveEditingVariant
        +--> supabase.update product_variants where id
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Hook yang Diekspor:**
  * `useAdminProducts() -> {...}`

- **Fungsi utama (yang diekspor via return object):**
  * `handleOpenAdd() -> void`
  * `handleOpenEdit(product) -> Promise<void>`
  * `handleDelete(id) -> Promise<void>`
  * `handleToggleActive(id,currentStatus) -> Promise<void>`
  * `handleSubmit(e) -> Promise<void>`
  * `addVariant() -> void`
  * `removeVariant(i:number) -> void`
  * `updateVariant(i, field, value) -> void`
  * `handleDeleteExistingVariant(variantId) -> Promise<void>`
  * `handleSaveEditingVariant() -> Promise<void>`
  * `toggleBadge(badge) -> void`

- **Contoh Implementasi Penggunaan:**
```jsx
export function AdminProductsPage(){
  const api = useAdminProducts();
  return (
    <button onClick={api.handleOpenAdd}>Tambah Produk</button>
  );
}
```

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Separation of Concerns:** hook sebagai orchestration untuk data & mutasi.
- **Derived state:** `sizeOptions` berdasarkan `sizeType`.

---

# 📄 src/app/hooks/useOrders.js

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Hook pengelola data & workflow untuk halaman admin order. Menggabungkan React Query untuk fetching orders, state UI untuk filtering & selection multi-order, serta logic mutasi: update status, update tracking/AWB, push Biteship (single & massal), dan batch print/export via action handlers.
- **Tanggung Jawab Utama:**
  * Fetch orders dengan join `order_items(*)`.
  * Menyediakan computed `filtered` dan `stats`.
  * Mengelola dialog state: update status massal dan push biteship massal.
  * Menyediakan handlers untuk update status & push biteship.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/lib/supabaseAdmin.js`
  * React Query: `useQuery`, `useQueryClient`
  * External Edge Functions via fetch:
    - `/functions/v1/biteship-create-order`
  * `orderActions.js` memuat handlers print/whatsapp/export (dipakai di AdminOrders page)
- **Diagram Alur Makro:**
```text
useOrders()
  |
  +--> useQuery('admin-orders')
        +--> supabase.from('orders').select('*, order_items(*)')

Filtering & stats
  |
  +--> filtered = orders.filter(search/status/date)
  +--> stats = counts + revenue

Open update dialog
  |
  +--> supabase.from('order_items').select('*').eq('order_id', order.id)
  +--> setSelectedOrder({...order, order_items})

Update single order
  |
  +--> supabase.orders.update(status/notes)
  +--> if trackingNumber:
        supabase.shipping_tracking.upsert(...)
  +--> supabase.order_status_history.insert(...)

Push Biteship (single/massal)
  |
  +--> fetch supabaseUrl/functions/v1/biteship-create-order
  +--> parse response JSON
  +--> invalidateQueries('admin-orders')
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:**
  * React Query caches: `admin-orders`.
  * Supabase tables: `orders`, `order_items`, `shipping_tracking`, `order_status_history`.
- **Local State:**
  * `selectedOrder`, `updateData`
  * `dateRange`, `filters`
  * multi-select `selectedOrders: Set`
  * dialog booleans
  * progress untuk batch biteship
- **Skema / Contoh Struktur Data:**
```ts
type Filters = { status: 'all'|OrderStatus, search: string }

type BatchBiteshipProgress = {
  done: number,
  total: number,
  errors: Array<{ orderNumber: string, error: string }>
}
```

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * Pembatasan eligibility massal: status harus `payment_confirmed`/`processing` dan belum ada `biteship_order_id`.
  * Namun, enforcement yang benar tetap harus di server/edge function; file ini adalah guard client-side.
  * Penggunaan Authorization header `Bearer ${supabaseKey}` ketika memanggil edge function.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * single push biteship: try/catch => toast error.
  * batch push biteship: loop sequential; errors per order dikumpulkan ke `progress.errors` lalu ditampilkan di dialog.
  * update status: tidak ada try/catch spesifik.
- **Retry Strategy:** none.
- **Timeout & Fallback Strategy:** none.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Mount useOrders
  |
  +--> useQuery fetch orders

User interaction:
  - filter/search/date => update derived 'filtered'
  - toggleSelectOrder/toggleSelectAll => update Set
  - open update dialog:
        +--> fetch order_items
        +--> setSelectedOrder + setUpdateData
  - handleUpdateOrder:
        +--> update orders
        +--> if tracking => upsert shipping_tracking
        +--> insert order_status_history
  - handlePushBiteship:
        +--> fetch edge function biteship-create-order
        +--> update selectedOrder fields
  - handleBatchPushBiteship:
        +--> for each eligible order => fetch edge function
        +--> progress update
        +--> invalidateQueries
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Hook yang Diekspor:**
  * `useOrders() -> {...}`
  * `STATUS_ORDER` dan `getStatusInfo(status) -> {label,color}`

- **Contoh Penggunaan:**
```js
const {
  orders, filtered, handleUpdateOrder,
  handleBatchPushBiteship
} = useOrders();
```

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Observable UI State:** progress + selectedOrders Set.
- **Idempotency-ish eligibility:** massal hanya menargetkan order yang belum memiliki `biteship_order_id`.

---

# 📄 src/app/pages/admin/AdminOrders.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Halaman administrasi untuk manajemen order. Menampilkan daftar order yang dapat difilter, multi-select, dan dioperasikan melalui actions: detail update status, WhatsApp, print invoice/AWB, update status massal, dan push biteship massal.
- **Tanggung Jawab Utama:**
  * Render UI kompleks (stats + filters + orders list + dialogs).
  * Mendelegasikan business logic ke `useOrders` dan `orderActions`.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/app/hooks/useOrders.js`
  * `src/app/hooks/orderActions.js` (WhatsApp/print/export)
  * `src/app/components/admin/*Dialog*`
- **Diagram Alur Makro:**
```text
AdminOrders
  |
  +--> useOrders()
        +--> orders fetched + filtered computed + selection state

UI
  |
  +--> Orders list -> on checkbox => toggleSelectOrder
  +--> Detail button => handleOpenUpdateDialog(order)

Dialogs
  +--> OrderDetailDialog
        |
        +--> onUpdate => handleUpdateOrder
        +--> onPushBiteship => handlePushBiteship

  +--> BatchStatusDialog
        |
        +--> onConfirm => handleBatchUpdateStatus

  +--> BatchBiteshipDialog
        |
        +--> onConfirm => handleBatchPushBiteship
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:** disediakan oleh `useOrders` (React Query data & UI state).
- **Local State:** none.
- **Skema / Contoh Struktur Data:**
  * `selectedOrders` adalah `Set<string>`.

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * Multi-select actions hanya muncul ketika `selectedOrders.size > 0`.
  * Guard untuk eligibility biteship ada di hook `useOrders`.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * User feedback melalui toast di action handlers & hook.
- **Retry Strategy:** React Query default `retry:1`.
- **Timeout & Fallback Strategy:** tidak ada di halaman.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Mount -> useOrders() fetch
Render skeleton atau list
User filter/search/date -> filtered recompute
User select -> dialogs enable
User confirm in dialogs -> hook handlers execute
Dialogs close -> invalidateQueries
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Komponen yang Diekspor:**
  * `AdminOrders() -> JSX.Element`

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Delegation:** page fokus render, logic mutasi ada di hook.

---

# 📄 src/app/components/admin/BatchDialogs.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Kumpulan dialog UI untuk operasi batch di admin order.
  1) `BatchStatusDialog`: update status massal.
  2) `BatchBiteshipDialog`: push biteship massal dengan progress dan error list.
- **Tanggung Jawab Utama:**
  * Mengelola state presentational berdasarkan props `open`, `progress`, `batchStatus`.
  * Menghindari perubahan state saat proses berjalan (dialog biteship disable while running).

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/app/hooks/useOrders.js` untuk `STATUS_ORDER`
  * UI primitives: `Dialog`, `Button`, `Select`, dll.
- **Diagram Alur Makro:**
```text
BatchStatusDialog
  props: open, batchStatus
  onConfirm => calls parent handler

BatchBiteshipDialog
  props: progress={done,total,errors}
  if running => Dialog onOpenChange disabled
  if done => show success/failure summary
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:** none.
- **Local State:** none.
- **Skema / Contoh Struktur Data:**
  * `progress: {done:number,total:number,errors:Array<{orderNumber,error}>}`

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * Dialog tidak melakukan mutation; hanya UI. Proteksi dilakukan di hook.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * errors di-prop-kan dan ditampilkan.
- **Retry Strategy:** none.
- **Timeout & Fallback Strategy:** none.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Render dialog sesuai open
  - status dialog: pilih status -> confirm
  - biteship dialog: running -> progress update -> done
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Ekspor:**
  * `BatchStatusDialog(props) -> JSX.Element`
  * `BatchBiteshipDialog(props) -> JSX.Element`

- **Contoh Penggunaan:**
```jsx
<BatchBiteshipDialog
  open={show}
  onOpenChange={setShow}
  selectedCount={selectedOrders.size}
  progress={batchBiteshipProgress}
  onConfirm={handleBatchPushBiteship}
/>
```

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **State-driven UI:** progress menentukan tombol/closing behavior.

---

# 📄 src/app/components/admin/DateRangePicker.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Komponen picker untuk memilih rentang tanggal guna filtering order admin.
- **Tanggung Jawab Utama:**
  * Menyediakan quick select (Hari Ini, 7 Hari, 30 Hari, Minggu Ini, Bulan Ini).
  * Menangani reset dan integrasi dengan komponen `Calendar` mode range.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `date-fns` untuk formatting dan interval
  * UI primitives: `Popover`, `Calendar`, `Button`, `Badge`
- **Diagram Alur Makro:**
```text
User klik trigger Button
  |
  v
Popover open
  |
  +--> pilih quick range => onDateChange({from,to})
  +--> pilih via calendar range => onDateChange(range)
  +--> klik X badge => onDateChange(null)
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:** none.
- **Local State:** `isOpen`.
- **Skema / Contoh Struktur Data:**
```ts
type DateRange = { from: Date, to?: Date }
```

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * Tidak ada aspek security langsung.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:** tidak ada.
- **Retry Strategy:** tidak ada.
- **Timeout & Fallback Strategy:** tidak ada.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Mount
  +--> isOpen=false
User actions
  +--> open/close popover
  +--> onSelect => onDateChange
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Komponen yang Diekspor:**
  * `DateRangePicker({ date, onDateChange, className }) -> JSX.Element`

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Reusable Component:** menerima props.

---

# 📄 src/app/components/admin/OrderDetailDialog.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Dialog detail order yang juga menyediakan form update status dan pencatatan catatan, serta tombol aksi (WhatsApp, Print Invoice, Print AWB, Push Biteship) untuk satu order.
- **Tanggung Jawab Utama:**
  * Menampilkan order details termasuk order items dan customer/shipping information.
  * Mengendalikan update form untuk `updateData.status` dan `updateData.notes`.
  * Mengaktifkan tombol push biteship berdasarkan status dan ketersediaan `biteship_order_id`.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * UI primitives: Dialog, Button, Select, Input.
  * `STATUS_ORDER` dari `useOrders`.
  * `formatPrice` util.
- **Diagram Alur Makro:**
```text
OrderDetailDialog(open = !!selectedOrder)
  |
  +--> if selectedOrder exists:
        render items + customer info
        render status select & notes input

User klik
  - WhatsApp => onWhatsApp(selectedOrder)
  - Print Invoice => onPrintInvoice(selectedOrder)
  - Print AWB => onPrintAWB(selectedOrder, updateData.trackingNumber)
  - Push Biteship => onPushBiteship(selectedOrder.id)
  - Simpan Update => onUpdate()
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:** none langsung; data berasal dari props.
- **Local State:** none.
- **Skema / Contoh Struktur Data:**
  * `selectedOrder` minimal fields:
```ts
{
  id: string,
  order_number: string,
  created_at: string,
  status: string,
  awb_number?: string,
  order_items?: Array<{ product_name, sku, sku_variant, color, size, qty, subtotal, variant_images?: string[] }>,
  customer_name, customer_phone, customer_email?, payment_method,
  shipping_address, shipping_city, shipping_province,
  subtotal, shipping_cost, total,
  courier?, courier_service?, biteship_order_id?,
}
```

  * `updateData` shape:
```ts
{ status: string, trackingNumber: string, notes: string }
```

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * Tombol Push Biteship hanya aktif untuk status `payment_confirmed`/`processing` dan saat `!selectedOrder?.biteship_order_id`.
  * Penggunaan controlled components untuk status & notes.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * Dialog tidak menangani error; error ditangani oleh handler di parent.
- **Retry Strategy:** none.
- **Timeout & Fallback Strategy:** none.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
open change -> Dialog mount/unmount
render data
user input updateData
user clicks actions -> call callbacks
Dialog stays until onClose or parent setSelectedOrder(null)
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Komponen yang Diekspor:**
  * `OrderDetailDialog(props) -> JSX.Element`

- **Callback/props:**
  * `onClose() -> void`
  * `onUpdate() -> Promise<void> | void` (parent uses hook)
  * `onWhatsApp(order)`, `onPrintInvoice(order)`, `onPrintAWB(order, trackingNumber)`,
    `onPushBiteship(orderId)`

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Controlled Inputs:** Select & Input status/notes.
- **Conditional Rendering/Enablement:** push biteship gating.

---

# 📄 src/app/components/admin/ProductFormModal.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Modal form untuk create/update produk beserta manajemen varian baru (inline form) dan daftar varian existing (edit varian via tombol).
- **Tanggung Jawab Utama:**
  * Preview gambar dari teks URL per baris (`form.images`).
  * Form field produk: name, slug, category, price/original_price, weight, description, badges, is_active.
  * Input marketplace links dan size chart.
  * Rendering varian baru: color picker, size select, SKU/MSKU, price/original_price, stock, images per variant.
  * Sticky action bar untuk submit/cancel.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * props dari `useAdminProducts`.
  * UI primitives: Input, Button.
- **Diagram Alur Makro:**
```text
ProductFormModal
  |
  +--> derives previewImages dari form.images
  |
  +--> if editProduct:
        render existingVariants table
        tombol edit -> handleOpenEditExistingVariant
        tombol delete -> handleDeleteExistingVariant
  |
  +--> render variants form
        updateVariant/addVariant/removeVariant
  |
  +--> submit => handleSubmit(e)
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:** none.
- **Local State:**
  * `previewImages: Array<string|null>`
- **Skema / Contoh Struktur Data:**
  * `form.images` adalah string multi-line URL.
  * `variants[]` items menerima fields `color_hex`, `size`, `sku`, `msku`, `price`, `original_price`, `stock`, `images`.

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * Handling `onError` gambar untuk menghindari broken UI.
  * UI hanya mengirim data; validasi kunci ada di hook saat payload insert/update.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * gambar error -> set previewImages[index]=null.
- **Retry Strategy:** none.
- **Timeout & Fallback Strategy:** none.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Mount/Update
  |
  +--> useEffect(form.images) => updatePreviewImages

User interactions
  - edit inputs => setForm / updateVariant callbacks
  - image delete button => splice lines
  - submit => handleSubmit
  - cancel => onClose
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Komponen yang Diekspor:**
  * `ProductFormModal(props) -> JSX.Element`

- **Props penting:**
  * `editProduct`, `form`, `setForm`, `categories`, `toggleBadge`,
    `variants`, `sizeType`, `setSizeType`, `sizeOptions`,
    `existingVariants`, variant handlers, `handleSubmit`, `onClose`, `generateSlug`.

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Preview-driven UX:** previewImages dari input.
- **Modularity:** parent hook mengelola state mutasi; modal hanya UI.

---

# 📄 src/app/components/admin/EditVariantModal.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Modal edit untuk satu varian existing. Memungkinkan perubahan color, size, SKU/MSKU, stock, price, original_price, dan images.
- **Tanggung Jawab Utama:**
  * Editing controlled fields pada `editingVariant`.
  * Menyimpan perubahan via callback `onSave`.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * props `editingVariant`, `setEditingVariant`, `onSave` dari hook.
- **Diagram Alur Makro:**
```text
EditVariantModal open if editingVariant != null
  |
  +--> controlled inputs update setEditingVariant
  |
  +--> onSave button => onSave()
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:** none.
- **Local State:** none.
- **Skema / Contoh Struktur Data:**
  * `editingVariant` mirip `product_variants` row.

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * UI level; mutasi dilakukan di hook/parent.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:** none.
- **Retry Strategy:** none.
- **Timeout & Fallback Strategy:** none.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
if !editingVariant => return null
else render modal
user edit fields
click Save => onSave
click cancel => setEditingVariant(null)
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Komponen yang Diekspor:**
  * `EditVariantModal({ editingVariant, setEditingVariant, onSave })`

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Immutable State Update via setEditingVariant callback**.

---

# 📄 src/app/components/admin/OrderDetailDialog.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Dialog modal untuk menampilkan detail satu order dan memungkinkan admin melakukan update status/notes, melakukan aksi customer service (WhatsApp), mencetak dokumen (invoice dan AWB), serta melakukan integrasi logistik (Push ke Biteship) untuk order tertentu.
- **Tanggung Jawab Utama:**
  * Menyajikan komposisi UI detail order: daftar `order_items`, identitas customer, alamat pengiriman, dan ringkasan biaya.
  * Menyediakan *controlled form* untuk update `status` dan `notes` melalui `updateData` / `setUpdateData`.
  * Mengaktifkan tombol Push Biteship hanya ketika order memenuhi eligibility (dibandingkan di file ini: status `payment_confirmed`/`processing` dan `!selectedOrder?.biteship_order_id`).

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * Props dari halaman `AdminOrders`/hook `useOrders`:
    - `selectedOrder`, `updateData`, `setUpdateData`
    - callback: `onUpdate`, `onWhatsApp`, `onPrintInvoice`, `onPrintAWB`, `onPushBiteship`, `onClose`
  * `STATUS_ORDER` & `formatPrice`
  * Komponen UI: `Dialog`, `Select`, `Input`, `Button`, `Label`
- **Diagram Alur Makro:**
```text
AdminOrders sets selectedOrder + updateData
  |
  v
<OrderDetailDialog open=!!selectedOrder>
  |
  +--> render order_items list
  +--> render customer/shipping info
  +--> controlled Select(status) & Input(notes)
  |
  +--> user klik aksi:
        - WhatsApp -> onWhatsApp(selectedOrder)
        - Print Invoice -> onPrintInvoice(selectedOrder)
        - Print AWB -> onPrintAWB(selectedOrder, updateData.trackingNumber)
        - Push Biteship -> onPushBiteship(selectedOrder.id)
        - Simpan Update -> onUpdate()
  |
  v
Parent handles state reset + invalidateQueries
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:**
  * Tidak ada state global di file ini.
  * Data berasal dari props.
- **Local State:** tidak ada.
- **Skema / Contoh Struktur Data:**
  * `selectedOrder` (minimum yang dipakai UI):

```ts
type OrderDetailDialogOrder = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  awb_number?: string | null;
  courier?: string | null;
  courier_service?: string | null;
  order_items?: Array<{
    product_name: string;
    sku_variant?: string | null;
    sku?: string | null;
    color?: string | null;
    size?: string | null;
    qty: number;
    subtotal: number;
    variant_images?: string[];
  }>;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  payment_method: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  tracking_number?: string | null;
  biteship_order_id?: string | null;
};
```

  * `updateData`:
```ts
type UpdateData = {
  status: string;
  trackingNumber: string;
  notes: string;
};
```

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * *Client-side gating* tombol Push Biteship:
    - hanya render tombol bila `selectedOrder?.status` termasuk `payment_confirmed` atau `processing`.
    - disabled bila `pushingBiteship` true atau `selectedOrder?.biteship_order_id` sudah ada.
  * Menggunakan controlled input untuk status dan notes.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * File ini tidak menangkap exception; error ditangani di handler pada parent/hook.
- **Retry Strategy:** tidak ada.
- **Timeout & Fallback Strategy:**
  * Fallback: ketika `selectedOrder.order_items` kosong, ditampilkan pesan “Tidak ada item.”

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Dialog open
  |
  +--> render header + order_items + customer/shipping + summary

User interaction
  |
  +--> Select status -> setUpdateData({ ...updateData, status: v })
  +--> Input notes   -> setUpdateData({ ...updateData, notes: e.target.value })

Action click
  |
  +--> Push Biteship -> onPushBiteship(selectedOrder.id)
  +--> Simpan Update -> onUpdate()
  +--> Close dialog   -> onClose() (parent sets selectedOrder=null)
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Komponen yang Diekspor:**
  * `OrderDetailDialog(props) -> JSX.Element`

- **Props / Callback Interface:**
  * `selectedOrder: OrderDetailDialogOrder | null`
  * `onClose: () -> void`
  * `updateData: UpdateData`
  * `setUpdateData: (next: UpdateData) -> void`
  * `onUpdate: () -> Promise<void> | void`
  * `onWhatsApp: (order: OrderDetailDialogOrder) -> void`
  * `onPrintInvoice: (order: OrderDetailDialogOrder) -> void`
  * `onPrintAWB: (order: OrderDetailDialogOrder, trackingNumber: string) -> Promise<void> | void`
  * `onPushBiteship: (orderId: string) -> Promise<void> | void`
  * `pushingBiteship: boolean`

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Controlled Inputs** untuk `status` dan `notes`.
- **Defensive Enablement**: tombol push bersyarat (conditional rendering + disabled).
- **Separation of Concerns**: dialog hanya UI; side effects dieksekusi pada callback.


---

# 📄 src/app/hooks/orderActions.js

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Kumpulan utilitas tindakan non-data-fetching untuk admin order: WhatsApp customer, print invoice, print AWB, batch print, dan export CSV.
- **Tanggung Jawab Utama:**
  * Memproduksi side-effects UI browser (window.open, document.write, print).
  * Menghasilkan CSV download link.
  * Mengambil data tambahan untuk print (mis. shipping_tracking untuk AWB).

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/lib/supabaseAdmin.js` untuk fetch tracking awb.
  * `src/lib/utils.js` untuk `formatPrice` (import), walaupun file ini menggunakannya terbatas.
  * `sonner` toast.
- **Diagram Alur Makro:**
```text
Admin click action
  |
  +--> handleWhatsApp(order)
        -> encode msg -> window.open(wa.me)

  +--> handlePrintInvoice(order)
        -> build HTML invoice -> window.open -> print

  +--> handlePrintAWB(order, trackingNumber)
        -> supabase shipping_tracking select awb_number
        -> build AWB HTML -> print

  +--> handleBatchPrintInvoice(orders, selectedOrders)
        -> aggregate HTML for each order -> print

  +--> handleBatchPrintAWB(orders, selectedOrders)
        -> supabase shipping_tracking select in(orderIds)
        -> map awbNumber -> print labels

  +--> handleExportCSV(filtered, getStatusInfo)
        -> build CSV string -> blob -> anchor download
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:** supabase admin fetch for shipping tracking.
- **Local State:** none (fungsi murni).
- **Skema / Contoh Struktur Data:**
  * `selectedOrders: Set<string>`
  * `filtered: Array<Order>`

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * Tidak ada sanitization eksplisit saat menyusun HTML invoice/AWB; raw string dari order dipakai dalam template HTML.
  * Risiko XSS *bergantung* pada sumber data (seharusnya data aman dari DB). Untuk enterprise-grade, seharusnya sanitize/escape.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * `handlePrintAWB`: jika tidak ada AWB -> toast.error dan return.
  * fungsi lain umumnya asumsi data ada.
- **Retry Strategy:** none.
- **Timeout & Fallback Strategy:** none.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Each action function called on user click
  |
  +--> derive necessary data
  +--> open new window
  +--> write HTML
  +--> print
  +--> toast success
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Fungsi yang Diekspor:**
  * `handleWhatsApp(order) -> void`
  * `handlePrintInvoice(order) -> void`
  * `handlePrintAWB(order, trackingNumber?) -> Promise<void>`
  * `handleBatchPrintInvoice(orders, selectedOrders) -> void`
  * `handleBatchPrintAWB(orders, selectedOrders) -> Promise<void>`
  * `handleExportCSV(filtered, getStatusInfo) -> void`

- **Contoh Penggunaan:**
```js
<button onClick={() => handlePrintInvoice(order)}>Print</button>
```

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Utility Functions:** pure-ish functions untuk side-effect.
- **Defensive gating:** AWB missing check.

---

# 📄 src/app/pages/admin/AdminDashboard.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** (Sudah didokumentasikan di atas)

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- (Sudah didokumentasikan)

## 💾 3. State Management & Data Structure
- (Sudah didokumentasikan)

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- (Sudah didokumentasikan)

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- (Sudah didokumentasikan)

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
- (Sudah didokumentasikan)

## 🔌 7. Public API & Ekspor (Interface Specification)
- (Sudah didokumentasikan)

## 📐 8. Prinsip Desain (Design Principles Adhered)
- (Sudah didokumentasikan)

---

# 📄 src/app/pages/admin/AdminOrders.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Halaman administrasi untuk manajemen order. Halaman ini berfungsi sebagai *operational console* yang memungkinkan admin:
  1) melihat daftar order beserta status,
  2) memfilter data order (search, status, date range),
  3) memilih satu atau banyak order untuk aksi batch,
  4) melakukan aksi pada order tunggal (detail/update status, WhatsApp customer, print invoice, print AWB, push Biteship),
  5) melakukan aksi batch (update status massal, push Biteship massal) yang hasilnya ditampilkan dalam dialog progress.
- **Tanggung Jawab Utama:**
  * Mengorkestrasi *render* UI kompleks berdasarkan state yang disuplai oleh `useOrders()`.
  * Menyediakan tombol-tombol action dan menghubungkan action tersebut ke handler yang berasal dari hook dan utilitas `orderActions`.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `src/app/hooks/useOrders.js` (state + handlers)
  * `src/app/hooks/orderActions.js` (fungsi WhatsApp/print/export)
  * `src/app/components/admin/OrderDetailDialog.jsx`
  * `src/app/components/admin/BatchDialogs.jsx`
  * `src/app/components/admin/DateRangePicker.jsx`
  * UI primitives: `Card`, `Button`, `Input`, `Select`, `Badge`, `Dialog` (melalui komponen UI lokal)
- **Diagram Alur Makro:**
```text
AdminOrders Mount
  |
  +--> useOrders()
        |
        +--> useQuery('admin-orders') -> supabase orders + order_items
        +--> local state: filters/search/date, selectedOrder, selectedOrders(Set)
        +--> derived: filtered, stats
        +--> expose handlers:
              - handleOpenUpdateDialog
              - handleUpdateOrder
              - handlePushBiteship
              - handleBatchPushBiteship
              - handleBatchUpdateStatus
        +--> expose dialog state:
              - showBatchUpdateDialog, showBatchBiteshipDialog
              - batchStatus, batchBiteshipProgress

Render
  |
  +--> jika loading: skeleton UI
  +--> jika filtered kosong: empty state
  +--> else: table list order

User actions
  |
  +--> checkbox -> toggleSelectOrder/toggleSelectAll
  +--> Detail -> OrderDetailDialog (setSelectedOrder/updateData)
  +--> selectedOrders>0 -> tampilkan batch action buttons

Batch dialogs
  +--> BatchStatusDialog
  +--> BatchBiteshipDialog(progress loop & error list)
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:**
  * React Query cache dari `useOrders` dengan query key `admin-orders`.
- **Local State (di level halaman ini):**
  * Halaman ini tidak menyimpan state sendiri; seluruh state UI berasal dari destructuring output `useOrders()`.
- **Skema / Contoh Struktur Data:**
  * `selectedOrders: Set<string>` untuk multi-select.
  * `batchBiteshipProgress`:

```ts
type OrderId = string;

type BatchBiteshipProgress = {
  done: number;
  total: number;
  errors: Array<{ orderNumber: string; error: string }>;
}
```

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * Secara arsitektural, halaman berada di subtree `/admin` dan diharapkan terlindungi oleh guard/context (`AdminAuthProvider` dan layout redirect).
  * Eligibility guard untuk push Biteship massal tidak diimplementasikan di halaman, melainkan di `useOrders()`.
  * Aksi batch hanya ditampilkan ketika `selectedOrders.size > 0` untuk mengurangi risiko operasi tanpa target.

## 🛑 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * Per halaman ini, error ditangani melalui:
    - `toast` yang dipanggil oleh hook `useOrders` dan action handlers.
    - dialog `BatchBiteshipDialog` yang menampilkan `progress.errors`.
  * Halaman tidak punya try/catch.
- **Retry Strategy:**
  * Retry untuk data fetching mengikuti konfigurasi React Query admin (retry default `1`).
  * Untuk edge function push Biteship massal, retry bukan mekanisme otomatis; implementasi menggunakan loop sequential dan mengakumulasi error.
- **Timeout & Fallback Strategy:**
  * Fallback UI: skeleton saat `loading`.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
1) Mount AdminOrders
   |
   +--> useOrders() -> fetch orders via React Query

2) Render fase awal
   |
   +--> if loading => skeleton

3) Render fase normal
   |
   +--> user melihat filters -> memodifikasi filtered

4) Multi-select
   |
   +--> toggleSelectOrder/setSelectedOrders

5) Single order operation
   |
   +--> click Detail
        |
        +--> handleOpenUpdateDialog(order)
             |
             +--> fetch order_items
             +--> setSelectedOrder({ ...order, order_items })
             +--> setUpdateData({ status, trackingNumber, notes })
        +--> OrderDetailDialog open

6) Batch operations
   |
   +--> click Update {N}
        |
        +--> setShowBatchUpdateDialog(true)
        +--> BatchStatusDialog confirm -> handleBatchUpdateStatus

   +--> click Push Biteship {N}
        |
        +--> setShowBatchBiteshipDialog(true)
        +--> handleBatchPushBiteship
             |
             +--> eligibility filter
             +--> sequential fetch edge function
             +--> update progress (done/total/errors)

7) After action completion
   |
   +--> invalidateQueries('admin-orders')
   +--> reset selection/dialog state
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Komponen yang Diekspor:**
  * `AdminOrders() -> JSX.Element`

- **Tidak ada fungsi yang diekspor dari file ini** selain komponen.

## 📐 8. Prinsip Desain (Design Principles Adhered)
- **Separation of Concerns:** halaman sebagai *container/presenter*; semua state dan business handlers didelegasikan ke `useOrders`.
- **Declarative UI:** daftar order dirender secara map dari `filtered` dan selection state.
- **User Experience gating:** batch action terlihat hanya saat selection tersedia.


---


