# 🚀 DEPLOYMENT GUIDE: Hostinger cPanel

## Build Complete!

Build berhasil! File sudah siap di folder `dist/`:
- `dist/index.html`
- `dist/assets/` (CSS & JS)

---

## 📋 LANGKAH-LANGKAH DEPLOY KE HOSTINGER

### Step 1: Siapkan File Build

File sudah ada di folder `dist/`. Structure-nya kayak gini:

```
dist/
├── index.html
└── assets/
    ├── index-CpM3PrdP.css   (106 kB)
    └── index-6g3l3cp3.js    (709 kB)
```

---

### Step 2: Login ke Hostinger cPanel

1. Login ke [Hostinger Member Area](https://www.hostinger.co.id)
2. Pilih hosting yang mau digunakan
3. Klik **"Masuk cPanel"**
4. Atau langsung akses `https://cpanel.hostinger-kamu.com`

---

### Step 3: Upload File via File Manager

1. Di cPanel, cari **"File Manager"**
2. Buka folder **`public_html`**
3. Kalau mau install di root domain (`domainkamu.com`):
   - Upload semua isi folder `dist/` ke `public_html/`
   - Pastikan `index.html` ada di `public_html/`
   
4. Kalau mau install di subfolder (`domainkamu.com/shop`):
   - Buat folder baru bernama `shop`
   - Upload semua isi folder `dist/` ke `public_html/shop/`

---

### Step 4: PENTING! Konfigurasi .htaccess

Karena ini SPA (Single Page Application), kamu perlu setup `.htaccess` biar routing-nya berfungsi!

Buat file `.htaccess` di `public_html/` (atau di subfolder):

```apache
# .htaccess untuk React/Vite SPA

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-shockwave-flash "access plus 1 month"
  ExpiresByType image/x-icon "access plus 1 year"
  ExpiresDefault "access plus 2 days"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

---

### Step 5: Konfigurasi Base Path (Kalau di Subfolder)

Kalau kamu upload ke subfolder (misal `/shop`), perlu update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/shop/',  // ← Ubah ini jadi '/shop/' atau '/' buat root
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
```

**Setelah ubah vite.config.ts, wajib rebuild:**

```bash
pnpm build
```

---

### Step 6: Verifikasi Deployment

1. Buka domain kamu di browser
2. Cek apakah:
   - ✅ Halaman home muncul
   - ✅ Klik menu navigasi berfungsi
   - ✅ Halaman produk bisa dibuka
   - ✅ Dark/Light mode toggle works

---

## 🔧 CARA UPDATE WEBSITE

Setiap kali ada perubahan di code:

1. **Edit data/config**:
   - Edit file yang needed:
     - `src/data/products.js`
     - `src/data/categories.js`
     - `src/lib/config.js`

2. **Rebuild**:
   ```bash
   pnpm build
   ```

3. **Upload ulang**:
   - Hapus semua isi `public_html/`
   - Upload ulang semua dari folder `dist/`

---

## 📊 UKURAN FILE

| File | Size | Status |
|------|------|--------|
| index.html | 0.44 kB | ✅ Small |
| CSS | 106.45 kB | ✅ OK |
| JS | 709.26 kB | ⚠️ Large (bisa di-optimize) |

**Warning:** Bundle JS 709 kB agak besar. Ini karena banyak library (shadcn/ui, motion, recharts, dll). Untuk production, bisa di-optimize dengan code splitting tapi untuk sekarang masih bisa diterima.

---

## 🆘 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| 404 saat klik link | Pastikan `.htaccess` sudah diupload dengan benar |
| Halaman blank | Cek console browser, kemungkinan ada error |
| Gambar tidak muncul | Cek path gambar di `products.js` - harus URL lengkap |
| Tidak responsive | Ini project sudah mobile-first, harusnya responsive |

---

## 📞 BUTUH BANTUAN?

Kalau ada masalah saat deployment, catat:
1. Error message yang muncul
2. URL yang dicoba akses
3. Screenshot (kalau ada)

---

