### 📊 Ringkasan Arsitektur Dashboard Admin
Dashboard Admin di proyek ini dibangun sebagai SPA (React + React Router) yang memisahkan autentikasi **customer** vs **admin** lewat **dua Supabase client**.

Alur besar (gambaran konektivitas):
- **Admin Auth**: `AdminAuthProvider` mengelola session admin, melakukan pengecekan “user aktif admin” dari tabel `admin_users`, dan mempublikasikan state `{ admin, loading }` lewat context.
- **Routing Admin**: Subtree `/admin` diregister di `src/app/routes.jsx`. Semua halaman admin dirender melalui `AdminRoot` (wrap `QueryClientProvider`) lalu `AdminLayout` (sidebar + topbar + `<Outlet />`).
- **Proteksi akses**: Guard `AdminProtectedRoute` memakai `useAuth()` (customer auth) + `useAdminAuth()` (admin auth) untuk redirect.
- **Data fetching**: Halaman admin mengambil data via **TanStack React Query** (mis. dashboard stats, orders list, produk list) dan menyimpan state UI (filter/search/selection) di level komponen/hook.
- **Mutasi bisnis**:
  - Produk/varian diubah lewat tabel `products` dan `product_variants`.
  - Order di-update status/notes dan dicatat di `order_status_history`, termasuk AWB via `shipping_tracking`.
- **Integrasi eksternal**: Push ke Biteship dilakukan melalui Supabase Edge Function `biteship-create-order` (request pakai `fetch`).

Catatan arsitektural penting: admin memakai client Supabase khusus `src/lib/supabaseAdmin.js` dengan `auth.storageKey = 'hw-admin-session'` supaya session admin tidak bertabrakan dengan session customer.




