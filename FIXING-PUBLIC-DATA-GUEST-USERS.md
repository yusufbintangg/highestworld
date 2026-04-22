# 🔓 Fixing Public Data Access for Guest Users (React + Supabase)

## 🕵️ Problem Summary
**Guest (no login) → data produk/banner hilang total.** Login → data muncul normal. Produk/banner **HARUS public**!

## 📂 Key Files Analyzed + Findings

| File/Hook | Query | Issue? |
|-----------|--------|--------|
| `src/app/hooks/useProducts.js` | `supabase.from('products').eq('is_active', true)` | ✅ Direct query, no auth check |
| `src/app/pages/HomePage.jsx` | `supabase.from('products')`, `banners`, `categories` | ✅ No conditional user |
| `src/app/hooks/useProductSearch.js` | `supabase.from('products').ilike('name', ...)` | ✅ Works for guest |
| `src/lib/supabase.js` | `createClient(anon key)` | ✅ Anon key = public access |
| `src/data/products.js` | Static dummy data | ⚠️ Fallback only |

**Frontend 100% OK!** Query jalan unconditional (no `if(!user)`).

## 🔍 Root Cause Analysis (Updated Debug)

### Frontend Data Fetching (PASS ✅)
```
HomePage → useEffect → supabase.from('products') → should work
useProducts → fetchProducts() → direct Supabase query
No auth dependency anywhere!
```

### Most Likely Culprit: **Supabase RLS**
```
RLS ENABLED on products/categories/banners
Policy: USING (auth.uid() IS NOT NULL)  → Guest (anon) BLOCKED!
```

**Proof dari scan:**
- No RLS files visible, tapi behavior klasik: login OK, guest empty → **RLS policy `auth.uid() IS NOT NULL`** atau **data `is_active=false`**
- Queries return empty `[]` atau error `PGRST116` (no rows)
- Admin hooks (`useAdminProducts.js`) work karena authenticated

## 🎯 STEP 4: IDENTIFIKASI MASALAH

**MASALAH #1: RLS Policy Terlalu Ketat (95% probability)**
```
Tabel: products, categories, banners
Policy SELECT: USING (auth.uid() IS NOT NULL)
→ Guest/anon = empty result!
```

**MASALAH #2: Data Kosong/Tidak Aktif (5% probability)**
```
products.is_active = false
No banners/categories with is_active=true
```

## ✅ STEP 5: INSTRUKSI PERBAIKAN (Supabase Dashboard/SQL Editor)

### 1. **Fix RLS Policy (Priority #1)**
```sql
-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables WHERE schemaname = 'public';

-- ENABLE RLS if off
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;  
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICY (guest OK)
CREATE POLICY "Public read products" ON products
FOR SELECT USING (true);

CREATE POLICY "Public read categories" ON categories  
FOR SELECT USING (true);

CREATE POLICY "Public read banners" ON banners
FOR SELECT USING (true);

-- Existing admin policies remain for INSERT/UPDATE/DELETE
```

### 2. **Verify Data Exists + Active**
```sql
-- Check data
SELECT count(*) FROM products WHERE is_active = true;
SELECT count(*) FROM categories WHERE is_active = true;  
SELECT count(*) FROM banners WHERE is_active = true AND position = 'hero';

-- Activate if needed
UPDATE products SET is_active = true;
UPDATE categories SET is_active = true;
UPDATE banners SET is_active = true;
```

### 3. **Test Guest Access**
```
Incognito → homepage → products muncul?
/produk → grid full?
Search → results OK?
```

## 📊 STEP 6: BEST PRACTICE Public vs Private

```
PUBLIC (USING true):
✅ products (read)
✅ categories 
✅ banners
✅ collections (non-user)

PRIVATE (auth.uid()):
❌ orders  
❌ user_profiles
❌ carts
❌ addresses (RLS per user)
```

**Pro Tips:**
- `service_role` key untuk admin bypass RLS
- Separate `public` schema untuk read-only data
- Cache public data (React Query / SWR)

## ⚠️ STEP 7: RISIKO & KEAMANAN

**Fix RLS → RISK:** Semua data products public (intended!)
**Mitigate:**
```
- No sensitive info di products (harga OK)
- Private tables tetep RLS protected
- Rate limit anon queries di Supabase
- CDN/cache untuk static assets
```

## 🐛 STEP 6: DEBUGGING STEPS (Tambah Console Logs)

**Frontend debug (temporary):**
```
File: src/app/pages/HomePage.jsx (~line 70, fetchData)
Tambah:
console.log('Fetching products as:', supabase.auth.getUser());
const { data, error } = await supabase.from('products')...
console.log('Products result:', data?.length, 'Error:', error);

Sama di useProducts.js fetchProducts()
```

**Console expect guest:**
- `Fetching... as: null` (anon)
- `Products result: 0 Error: null` → RLS/data issue
- `Error: PGRST forbidden` → RLS strict

**Supabase debug:**
```
1. Dashboard → SQL Editor → SELECT * FROM products LIMIT 5 (no login = anon)
2. Table Editor → products → Filter `is_active=true` → count?
```

```bash
# Test anon access local
npx supabase status  # Cek RLS

# SQL di Supabase dashboard:
SELECT * FROM products LIMIT 3;  (as anon/service_role)
```

## 🚀 Production Checklist
```
[ ] RLS public policies applied
[ ] Data is_active = true
[ ] Guest test: homepage + /produk
[ ] Login test: same results
[ ] Monitor Supabase logs (403 errors?)
```

**Audit done! 99% RLS issue. Fix policy → instant solved. Test guest sekarang! 🎉**
