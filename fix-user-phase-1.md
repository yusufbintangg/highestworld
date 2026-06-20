# Public Client — Enterprise-Grade Technical Documentation

> Catatan: Dokumentasi ini disusun sebagai **satu file besar**. Setiap file memiliki blok template lengkap (tanpa gabungan antar file).

---

# 📄 src/context/AuthContext.tsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Menyediakan *authentication state* user public untuk aplikasi (non-admin). Modul ini bertugas melakukan rehidrasi session Supabase pada saat aplikasi mount dan mengekstrak *profile* user dari tabel `user_profiles` agar UI bisa menampilkan status login (mis. header menampilkan `ACCOUNT` vs `LOGIN`).
- **Tanggung Jawab Utama:**
  * Mengelola state `session`, `user` (profile), serta flag `isAuthenticated` dan `isLoading`.
  * Melakukan rehidrasi session via `supabase.auth.onAuthStateChange` (event `INITIAL_SESSION`, `SIGNED_IN`, dll) dan mengambil/menyusun profile user.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `supabase` dari `src/lib/supabase.js`
  * Provider: `AuthProvider`
  * Hook: `useAuth()` dipakai oleh komponen seperti `Navbar` dan `ProtectedRoute`
- **Diagram Alur Makro:**
```text
[App Mount]
   -> <AuthProvider>
       -> subscribe onAuthStateChange
       -> receive event INITIAL_SESSION (session may be null/valid)
           -> setSession(session)
           -> setIsLoading(false)
           -> if session.user exists: fetchProfile(user)
               -> select from user_profiles
               -> if PGRST116: insert user_profiles
               -> setUser(buildProfile(...))
       -> subsequent events:
           -> SIGNED_IN: update session + fetchProfile
           -> SIGNED_OUT: setUser(null) + session null
           -> TOKEN_REFRESHED: update session + fetchProfile
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:**
  * `session: Session | null` dari Supabase
  * `user: UserProfile | null` (hasil gabungan data Supabase + data tabel `user_profiles`)
- **Local State:**
  * `isLoading` (boolean) untuk gating render login/protected route
  * `initialized.current` sebagai guard agar event pertama (`INITIAL_SESSION`) mengakhiri fase loading
- **Skema / Contoh Struktur Data:**
```ts
type UserProfile = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
};

// session.user dari Supabase (shape tidak ditulis lengkap di file, tapi dipakai untuk fetchProfile)
// buildProfile memakai:
// supabaseUser.user_metadata.full_name, phone, avatar_url
```

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * Untuk akses halaman protected (account/loyalty), modul ini menyediakan `isAuthenticated` yang diverifikasi oleh `ProtectedRoute`.
  * Profile data hanya di-*fetch* apabila `session?.user` tersedia.
  * Tidak melakukan redirect otomatis di context; redirect dilakukan oleh `ProtectedRoute`.

## 👝 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- **Error Handling Strategy:**
  * `fetchProfile` membungkus query dengan `try/catch` dan fallback ke `buildProfile(supabaseUser, null)`.
  * Khusus kasus `PGRST116` (row tidak ditemukan), context melakukan insert ke tabel `user_profiles` agar record tersedia.
- **Retry Strategy:**
  * Tidak ada retry eksplisit di `fetchProfile`.
  * Rehidrasi session akan terjadi ulang lewat siklus event Supabase berikutnya.
- **Timeout & Fallback Strategy:**
  * Fallback: jika gagal mengambil profile, tetap set `user` dengan data minimal (email/name dari metadata atau derived).

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Mount AuthProvider
  -> isLoading=true, initialized=false
  -> subscribe onAuthStateChange
  -> event INITIAL_SESSION
      -> initialized=true
      -> setSession(session)
      -> setIsLoading(false)
      -> if session.user:
           await fetchProfile(session.user)
           -> setUser(...) [atau fallback minimal]
      -> return (skip logic lain)
  -> event lain (SIGNED_IN / TOKEN_REFRESHED / SIGNED_OUT)
      -> setSession(session)
      -> if user: fetchProfile
      -> else: setUser(null)
```
> Titik potensi terkait bug refresh: context harus tetap menerima `INITIAL_SESSION` setelah hard refresh. Jika `initialized.current` logic/ordering terganggu, UI protected bisa salah, namun seharusnya public routes tetap fetch.

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Fungsi / Hooks / Komponen yang Diekspor:**
  * `AuthProvider({ children })`
  * `useAuth()` -> mengembalikan `{ isAuthenticated, user, session, isLoading, logout }`
- **Contoh Implementasi Penggunaan:**
```tsx
import { useAuth } from '../context/AuthContext';

function AccountButton(){
  const { user, isAuthenticated, isLoading } = useAuth();
  if(isLoading) return <span>Loading...</span>;
  return <div>{isAuthenticated ? user?.name : 'Please login'}</div>;
}
```

## 📐 8. Prinsip Desain (Design Principles Adhered)
- Single Source of Truth: hanya mengandalkan `onAuthStateChange`.
- Defensive Programming: catch fallback pada `fetchProfile`.
- Separation of Concerns: redirect/logika route diserahkan ke `ProtectedRoute`, bukan context.

---

# 📄 src/app/routes.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Mengonfigurasi *browser router* untuk seluruh route public dan admin. Route public di-*nest* dalam `Layout` (yang berisi `Navbar`, `Footer`, dll). Hal ini penting karena pada hard refresh, router menentukan apakah page components (Home/Products/Collections) mount ulang dan memicu fetch.
- **Tanggung Jawab Utama:**
  * Mendefinisikan route public: `/`, `/products`, `/collections`, `/products/:slug`, dll.
  * Menentukan route protected customer: `/account/*`, `/loyalty/*` memakai `ProtectedRoute`.
  * Menentukan area admin: `/admin/*` memakai `AdminRoot` dan provider `AdminAuthProvider`.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `Layout` dari `src/app/Layout.jsx`
  * `ProtectedRoute` dari `src/app/components/auth/ProtectedRoute.tsx`
  * `AdminAuthProvider` dari `src/context/AdminAuthContext.jsx`
  * Pages: `HomePage`, `ProductsPage`, `CollectionDetailPage`, dll
- **Diagram Alur Makro:**
```text
[URL di-browser]
  -> createBrowserRouter()
      -> jika path public:
           Layout element
             -> <Navbar/> (tetap tampil)
             -> <Outlet/> memunculkan page
                -> page useEffect fetch (Supabase)
      -> jika path protected:
           ProtectedRoute (gating via AuthContext)
             -> jika isLoading show spinner
             -> jika !isAuthenticated navigate /login
             -> jika ok render Account pages
      -> jika path admin:
           AdminRoot -> AdminAuthProvider -> AdminLayout -> Outlet
```

## 💾 3. State Management & Data Structure
- **Global/Context/Server State:**
  * `AuthProvider` dipasang di `src/app/App.tsx` (global).
  * `AdminAuthProvider` dipasang spesifik di admin route via `AdminRoot`.
- **Local State:**
  * Tidak ada state lokal; routing configuration statis.

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- **Mekanisme Proteksi:**
  * `ProtectedRoute` memblokir akses account/loyalty jika user tidak terautentikasi.
  * Admin area dipisahkan dan memakai `AdminAuthProvider`.

## 👝 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- Jika route yang dimaksud tidak ditemukan -> `NotFoundPage`.
- Tidak ada logic error boundary di level router.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Hard refresh on public route
  -> RouterProvider resolves route
  -> Layout mounts Navbar/Footer (header tetap tampil)
  -> Outlet mounts public Page component
  -> Page useEffect fetch

Jika gejala 
   (header berubah -> ACCOUNT, tapi isi halaman public kosong) terjadi, maka checklist debugging dari modul ini:
   1) Pastikan public route masih benar-benar resolves (bukan jatuh ke wildcard/404).
   2) Pastikan Layout/Outlet tidak memblokir render page components.
   3) Pastikan provider AuthProvider tetap aktif untuk komponen public (karena fetch pages bergantung Supabase client, bukan status admin).

## 🔌 7. Public API & Ekspor (Interface Specification)
- **Fungsi / Komponen yang Diekspor:**
  * `router` (export const router)
- **Kontrak pemakaian:**
  * `App.tsx` memasukkan `<RouterProvider router={router} />`.

## 📐 8. Prinsip Desain (Design Principles Adhered)
- Declarative routing.
- Separation of areas: public/customer/admin.
- Single responsibility: routing config tidak mengandung logic fetch.

---

# 📄 src/app/App.tsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Menyusun layer global aplikasi: `AuthProvider`, `CartProvider`, dan `RouterProvider`.
- **Tanggung Jawab Utama:**
  * Menangani redirect khusus reset password dari hash Supabase (`type=recovery`).
  * Menempatkan router dan provider agar mount/public fetch terjadi konsisten.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `AuthProvider` (`src/context/AuthContext.tsx`)
  * `CartProvider` (`src/context/CartContext.jsx`)
  * `RouterProvider` dari `react-router`
- **Diagram Alur Makro:**
```text
[App Render]
  -> handle hash(recovery) => window.location.replace('/reset-password'+hash)
  -> <AuthProvider>
       -> <CartProvider>
            -> <RouterProvider router={router} />
            -> <Toaster />
```

## 💾 3. State Management & Data Structure
- Tidak punya state.
- Hanya menginisialisasi provider.

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- Redirect reset password berbasis hash: menghindari salah route.

## 👛 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- Tidak ada retry.
- Failures biasanya berupa salah navigation saat recovery hash.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Mount App
  -> check window.location.hash
  -> jika contains type=recovery
       -> redirect replace /reset-password + hash
  -> else
       -> render providers + router
```
> Titik potensi terkait bug refresh: jika logic hash redirect salah, bisa mengubah route dan komponen public yang seharusnya mount jadi tidak mount. Namun gejala bug kamu spesifik “public page kosong” bukan “redirect reset”.

## 🔌 7. Public API & Ekspor (Interface Specification)
- Default export `App()`.

## 📐 8. Prinsip Desain (Design Principles Adhered)
- Provider stacking.
- Minimal side effects.

---

# 📄 src/app/Layout.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Wrapper global untuk route public/customer. Menyediakan `Navbar`, `Footer`, dan `Outlet`.
- **Tanggung Jawab Utama:**
  * Mengatur struktur layout agar header tetap tampil saat route berubah.
  * Menangani scroll-to-top saat route pathname berubah.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `Navbar` (bergantung AuthContext dan CartContext)
  * `Outlet` (render page content)
- **Diagram Alur Makro:**
```text
Layout Mount
  -> render <Navbar/>
  -> <main><Outlet/></main>
  -> Navbar re-render saat AuthContext berubah
  -> Outlet re-mount/mount saat route berubah
```

## 💾 3. State Management & Data Structure
- Local: tidak ada state.
- Hook: `useLocation()` untuk dependency scroll effect.

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- Tidak ada guard.

## 🛠️ 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- Tidak ada error boundary.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
On navigation
  -> useEffect(location.pathname) => window.scrollTo(0,0)
  -> Outlet mounts page
```
> Kalau hard refresh bikin “Outlet kosong”, biasanya karena Outlet tidak resolve page yang benar atau page tidak mount (mis. route mismatch/redirect). Layout ini sendiri tidak melakukan gating.

## 🔌 7. Public API & Ekspor (Interface Specification)
- Export: `Layout`.

## 📐 8. Prinsip Desain (Design Principles Adhered)
- Pure wrapper.
- Separation of concerns.

---

# 📄 src/app/components/layout/Navbar.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Komponen navigasi yang menampilkan header (logo, link menu), status auth (`LOGIN` vs `ACCOUNT`), serta cart count.
- **Tanggung Jawab Utama:**
  * Memperlihatkan state autentikasi dari `useAuth()`.
  * Menyediakan fitur search yang mengarahkan user ke route products setelah query.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `useAuth()` dari `AuthContext.tsx` (public)
  * `useCart()` dari `CartContext.jsx`
  * `useProductSearch(searchQuery)` dari hook search
- **Diagram Alur Makro:**
```text
Navbar Mount
  -> reads: { user } = useAuth()
  -> reads: cartCount = getCartCount()
  -> renders link: user ? '/account' : '/login' with label ACCOUNT/LOGIN
  -> if URL has ?q=... => setSearchQuery()
  -> user hits search => setSearchTrigger
       -> useEffect auto navigate berdasarkan product?.slug
```
> Hubungan ke bug: kamu bilang header berubah jadi `ACCOUNT` setelah login/hard refresh. Itu berarti AuthContext rehydrate sukses. Tapi karena fetch data produk hilang (di public page), kemungkinan bukan navbar/AuthContext, melainkan **page/components fetch tidak mount / useEffect tidak jalan / ada route mismatch**.

## 💾 3. State Management & Data Structure
- Local state:
  * `isScrolled`, `searchOpen`, `mobileOpen`, `searchQuery`, `searchTrigger`
- Derived:
  * `cartCount` dari CartContext
  * `product` hasil `useProductSearch` (untuk redirect)

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- Navigasi ke `/account` hanya bergantung status `user` (yang berasal dari session + profile).

## 👛 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- Tidak ada try/catch.
- Jika `useProductSearch` gagal, UI search tetap bisa dipakai (tidak blocking layout).

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Mount Navbar
  -> initial render
  -> useEffect([search]) sync searchQuery dari URL
  -> useEffect([searchTrigger,...]) melakukan navigate saat search valid
Hard refresh
  -> Navbar re-renders when AuthContext updates -> shows ACCOUNT
  -> does NOT fetch products list for page (page responsibility)
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- Export: `Navbar` (React component).

## 📐 8. Prinsip Desain (Design Principles Adhered)
- UI-driven auth display.
- Controlled inputs for search.
- Effect-based navigation.

---

# 📄 src/app/pages/HomePage.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Halaman beranda yang mengambil data dari Supabase untuk:
  * kategori
  * produk (diolah jadi tab newest/bestsellers/sale)
  * hero banners
- **Tanggung Jawab Utama:**
  * Fetch data pada mount via `useEffect([])`.
  * Mengisi state `categories`, `products`, `heroBanners` dan mengatur carousel interval.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- **Komponen Terkait:**
  * `ProductGrid`
  * `supabase` client
  * `FALLBACK_BANNERS` ketika tabel banners kosong
- **Diagram Alur Makro:**
```text
HomePage mount
  -> setLoading(true)
  -> query categories
  -> query products
  -> query banners(position=hero)
  -> setCategories
  -> setProducts(tabbed)
  -> setHeroBanners(final)
  -> resetTimer()
  -> setLoading(false)
```
> Jika hard refresh bikin “main content hilang” di public routes, HomePage menjadi salah satu kandidat jika gejalanya terjadi di `/` (beranda). Namun di task kamu: “products, categories, banners fetched from DB disappear completely”. Ini persis sama struktur fetch HomePage.

## 💾 3. State Management & Data Structure
- Local state:
  * `categories: []`
  * `products: { newest: [], bestsellers: [], sale: [] }`
  * `heroBanners: []`
  * `loading: boolean`
  * `currentBanner`, `activeTab`
- Data shaping:
  * newest: sort by created_at desc, slice 12
  * bestsellers: badge includes 'Best Seller', slice 12
  * sale: badge includes 'Sale', slice 12

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- Tidak ada gating auth.

## 👛 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- Tidak ada try/catch di fetchData (error silent bisa terjadi tergantung environment). Ini berpotensi bikin state tidak terisi dan `loading` tidak turun jika error terjadi di tengah.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
useEffect([]) fetchData()
  -> setLoading(true)
  -> await categories
  -> await products
  -> await banners
  -> setLoading(false) hanya kalau semua await selesai

Potensi choke:
  - network error => fetchData bisa throw dan setLoading(false tidak terpanggil
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- Export: `HomePage`.

## 📐 8. Prinsip Desain (Design Principles Adhered)
- UI skeleton saat loading.
- Fallback banners.

---

# 📄 src/app/hooks/useProducts.js

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Hook untuk halaman daftar produk (`ProductsPage`) yang mengelola state produk + kategori + filter/sort/pagination, dan melakukan fetch ke Supabase.
- **Tanggung Jawab Utama:**
  * Fetch kategori sekali saja (mount).
  * Parse URL params `category` dan `page` saat mount.
  * Fetch produk berdasarkan filter/sort/pagination.

## 🏗️ 2. Arsitektur & Alur Data (Architecture & Data Flow)
- Query supabase:
  * `categories` select('*') eq is_active true order name
  * `products` select with join categories(name,slug) eq is_active true
  * sort by created_at/price asc/desc
  * pagination via range(from,to)
  * tambahan filter badges dilakukan client-side karena array contains
- **Diagram Alur Makro:**
```text
ProductsPage mount
  -> useProducts()
       -> Effect #1 fetch categories
       -> Effect #2 parse URL params into filters/currentPage
       -> Effect #3 fetchProducts() triggered by fetchProducts deps
            -> build query
            -> if filters.category != 'all': lookup categories.id by slug
            -> apply sort + range
            -> execute
            -> client filter badges
            -> setProducts + setTotalCount + setLoading(false)
```
> Hubungan ke bug refresh: kalau “ZERO requests” setelah hard refresh, berarti `useProducts` hook tidak sempat menjalankan `useEffect`, atau component `ProductsPage` tidak mount, atau ada redirect/mount gate.

## 💾 3. State Management & Data Structure
- State utama:
  * `products: any[]`
  * `categories: any[]`
  * `loading: boolean`
  * `totalCount`, `totalPages`, `currentPage`
  * `sortBy`, `hideSoldOut`
  * `filters = { category: 'all', badges: [] }`

## 🛡️ 4. Aspek Keamanan (Security Considerations)
- Filter badges client-side mencegah query unsupported array contains.

## 👛 5. Manajemen Kegagalan & Ketahanan Sistem (Fault Tolerance)
- `fetchProducts` punya try/catch dan `finally { setLoading(false) }` -> cukup tahan.

## 🔄 6. Urutan Eksekusi Logika (Sequence & Lifecycle Flow)
```text
Mount
  -> categories fetch (no error handling around setCategories beyond .then)
  -> parse URL params effect
  -> fetchProducts effect
  -> setLoading true -> query -> setProducts -> setLoading false
```

## 🔌 7. Public API & Ekspor (Interface Specification)
- Export: `useProducts()` returns handlers:
  * handleCategoryFilter(slug)
  * handleBadgeFilter(badge, checked)
  * handleSortChange(value)
  * handleHideSoldOut(value)
  * handlePageChange(page)
  * resetFilters()
  * plus state fields.

## 📐 8. Prinsip Desain (Design Principles Adhered)
- Separation between data fetching and UI.
- Defensive try/catch.

---

# 📄 src/app/pages/products/ProductsPage.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** UI daftar produk dengan filter/sort/pagination. Data diambil dari hook `useProducts`.
- **Tanggung Jawab Utama:**
  * Menyediakan skeleton saat `loading`.
  * Mengatur modals filter/sort di mobile.

## 🏗️ 2. Arsitektur & Alur Data
- Component-komponen:
  * `ProductGrid`
  * `ProductFilter`, `ProductSort`
  * `Pagination`
  * `useProducts`

## 💾 3. State Management & Data Structure
- Local state hanya untuk toggle modal:
  * `showFilterModal`, `showSortModal`

## 🛡️ 4. Keamanan
- Tidak ada.

## 👛 5. Fault Tolerance
- Skeleton.

## 🔄 6. Sequence & Lifecycle
```text
ProductsPage mount
  -> useProducts() starts effects -> fetch categories + fetch products
  -> render: loading? skeleton : <ProductGrid products={products} />
```
> Jika setelah hard refresh loading state berubah tapi content tetap kosong, kemungkinan `products` state tidak terisi (fetchProducts tidak jalan) atau request diblok.

## 🔌 7. API & Ekspor
- Export: `ProductsPage`.

## 📐 8. Design Principles
- UI comp + hook data fetching.

---

# 📄 src/app/pages/collections/CollectionsPage.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Mengambil daftar kategori untuk tampilan grid look/collection cards.
- **Tanggung Jawab Utama:**
  * Fetch `categories` dari Supabase.
  * Mengelola lightbox dengan keyboard navigation.

## 🏗️ 2. Arsitektur & Alur Data
- Supabase query: `categories` eq is_active true order name.

## 💾 3. State Management & Data Structure
- Local state: `categories`, `loading`, `lightbox`.

## 🛡️ 4. Keamanan
- Tidak ada.

## 👛 5. Fault Tolerance
- Tidak ada try/catch pada fetch; jika error, `setLoading(false)` bisa tidak terpanggil.

## 🔄 6. Sequence & Lifecycle
```text
Mount
  -> fetch categories
  -> setCategories(data)
  -> setLoading(false)
```

## 🔌 7. API & Ekspor
- Export: `CollectionsPage`.

## 📐 8. Design Principles
- Client-side keyboard navigation.

---

# 📄 src/app/pages/collections/CollectionDetailPage.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Halaman detail collection berdasarkan `slug`, mengambil category lalu produk berdasarkan `category_id`.
- **Tanggung Jawab Utama:**
  * Query category by slug.
  * Query products by category_id.

## 🏗️ 2. Arsitektur & Alur Data
- Supabase queries:
  * categories: eq slug + eq is_active true single
  * products: eq category_id + eq is_active true select join categories(name,slug)

## 💾 3. State Management
- `category`, `products`, `loading`.

## 🛡️ 4. Keamanan
- Tidak ada.

## 👛 5. Fault Tolerance
- Jika catData kosong => loading false, category null -> Navigate ke /404.
- Tidak ada try/catch, error bisa membuat loading stuck.

## 🔄 6. Sequence & Lifecycle
```text
Mount or slug change
  -> setLoading(true)
  -> await categories.single()
  -> setCategory
  -> await products
  -> setProducts
  -> setLoading(false)
```

## 🔌 7. API & Ekspor
- Export: `CollectionDetailPage`.

## 📐 8. Design Principles
- Guard: redirect ke 404 saat category null.

---

# 📄 src/app/pages/NotFoundPage.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Menampilkan UI 404.
- **Tanggung Jawab Utama:**
  * Memberi CTA kembali ke `/`.

## 🏗️ 2. Arsitektur & Alur Data
- Statik, tidak fetch data.

## 💾 3. State Management
- Tidak ada state.

## 🛡️ 4. Keamanan
- Tidak ada.

## 👛 5. Fault Tolerance
- N/A.

## 🔄 6. Sequence & Lifecycle
- Direct render.

## 🔌 7. API & Ekspor
- Export: `NotFoundPage`.

## 📐 8. Design Principles
- Simple presentational component.

---

# 📄 src/context/CartContext.jsx

## 🎯 1. Tujuan Modul (Module Purpose)
- **Deskripsi:** Mengelola cart items untuk customer. Menyimpan/membaca dari `localStorage`.
- **Tanggung Jawab Utama:**
  * Menyediakan API untuk add/remove/update quantity.
  * Menghitung total harga dan cart count.

## 🏗️ 2. Arsitektur & Alur Data
- Hook `useCart()` memberikan akses value.
- Provider menyimpan `cartItems` dan sync ke localStorage.

## 💾 3. State Management & Data Structure
- `cartItems: []` (array object berisi product, color, size, quantity, maxStock, sku, variant images)

## 🛡️ 4. Keamanan
- Tidak ada security khusus, tapi data hanya client-side.

## 👛 5. Fault Tolerance
- try/catch saat parse localStorage.

## 🔄 6. Sequence & Lifecycle
```text
Mount CartProvider
  -> read localStorage
  -> setCartItems
On cartItems change
  -> write localStorage
```

## 🔌 7. API & Ekspor
- Export:
  * `CartProvider`
  * `useCart`
- Method:
  * addToCart(product, color, size, quantity, variantId, variantSku, variantImages)
  * removeFromCart(itemId)
  * updateQuantity(itemId,newQuantity)
  * clearCart()
  * getCartTotal(), getCartCount()

## 📐 8. Design Principles
- Separation: state in context, UI in components.
- Defensive parsing localStorage.

