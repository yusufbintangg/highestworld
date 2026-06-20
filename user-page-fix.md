# 🔍 Deep Repository Scan & Bug Forensic Report — Customer Storefront Blank-Content Bug

Dokumen ini menyimpan hasil **Deep Repository Scan & Root Cause Forensics** untuk alur **auth customer** dan **data-fetching halaman publik (storefront)**.

## 🔥 Temuan Awal (High-Confidence Suspect)

**Akar masalah paling mungkin (berdasarkan hasil scan saat ini):**
- `AuthProvider` punya `fetchProfile()` yang **silent failure** karena `catch {}` kosong.
- `fetchProfile()` memanggil `.single()` pada tabel `user_profiles`. Kalau query gagal (mis. koneksi/permission/struktur tabel mismatch), `catch {}` langsung set `user` ke bentuk “fallback” (pakai buildProfile dengan profileData null) **tanpa logging** dan tanpa membedakan error jenis apa.
- Lebih parah: `AuthProvider` memutuskan `isLoading` jadi `false` tepat saat event `INITIAL_SESSION` pertama datang (bahkan jika `fetchProfile` masih belum resolve / gagal diam-diam). Artinya komponen child bisa merender dengan state `user` yang tidak valid/parsial, atau transisi auth terjadi bersamaan dengan fetch data publik.
- Di layer public storefront, banyak fetch langsung pakai `useEffect` / `try-catch` yang **sering mengabaikan error** (mis. ada `catch { setNotFound(true) }` pada page detail). Untuk home/products/collections, fallback “blank” bisa terjadi kalau ada exception yang tidak memicu fallback UI.

## ℹ️ Status Dokumen
- Provider composition root: ✅ ter-scan (`src/app/App.tsx`, `src/app/Layout.jsx`, `src/app/routes.jsx`)
- Auth customer layer: ✅ ter-scan (`src/context/AuthContext.tsx`)
- Storefront pages & fetching: ✅ sebagian besar ter-scan (`HomePage.jsx`, `ProductsPage.jsx`, `ProductDetailPage.jsx`, `CollectionsPage.jsx`, `useProducts.js`, `useProductSearch.js`)
- Shared UI yang subscribe ke auth: ✅ ter-scan (`Navbar.jsx` dan `CartDrawer.jsx`, `UserMenu.tsx`)

Berikutnya: untuk memenuhi format wajib, saya akan buat **template per-file** pada setiap file relevan dengan bug loop ini.


