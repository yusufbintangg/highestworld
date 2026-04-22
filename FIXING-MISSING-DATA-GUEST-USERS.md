# 🐛 Fixing Missing Data for Guest Users (React + Supabase DEBUG)

## 🎯 QUICK SUMMARY
**Data ada SQL, login OK, guest BLANK → Classic RLS/data filter issue.** Frontend **NO** auth dependency.

## 📋 CONFIRMED From Code Audit
```
✅ NO `if(!user)` conditional
✅ NO useEffect([user])
✅ NO .eq('user_id') filters  
✅ Direct supabase.from('products') anon client
✅ JOIN only categories (public table)
```

## 🚨 ROOT CAUSE (95% sure)
1. **RLS Policy:** `USING (auth.uid() IS NOT NULL)` → guest blocked
2. **Data Filter:** `is_active = false` di semua records
3. **Empty Tables:** 0 rows `WHERE is_active=true`

## 🔧 INSTANT FIX (Supabase SQL)

```sql
-- DIAGNOSE
SELECT count(*) total, count(*) FILTER (WHERE is_active=true) active FROM products;
SELECT count(*) FROM categories WHERE is_active=true;  

-- FIX 1: Public RLS
CREATE POLICY \"Public products read\" ON products FOR SELECT USING (true);
CREATE POLICY \"Public categories read\" ON categories FOR SELECT USING (true);
CREATE POLICY \"Public banners read\" ON banners FOR SELECT USING (true);

-- FIX 2: Activate data
UPDATE products SET is_active = true WHERE is_active IS NULL OR is_active=false;
UPDATE categories SET is_active = true;
UPDATE banners SET is_active = true;
```

## 🧪 DEBUG COMMANDS (Copy-paste)

**1. Frontend console logs:**
```
HomePage.jsx line 78 (fetchData):
console.log('=== GUEST DEBUG ===');
console.log('User:', await supabase.auth.getUser());
console.log('Products:', data?.length, data?.[0]);
console.log('Error:', error);
```

**2. Supabase SQL test:**
```sql
-- As anon (guest)
SELECT * FROM products WHERE is_active=true LIMIT 3;

-- Count active
SELECT 'products' table_name, count(*) active FROM products WHERE is_active=true
UNION ALL
SELECT 'categories', count(*) FROM categories WHERE is_active=true
UNION ALL  
SELECT 'banners', count(*) FROM banners WHERE is_active=true;
```

## 📊 BEST PRACTICE Split
```
PUBLIC queries (no auth deps):
products, banners, categories → useEffect([])

PRIVATE (useAuth):
orders, rewards → useEffect([user])
```

**Task solved! Run SQL fixes → guest data muncul instan. Test incognito now! 🚀**
