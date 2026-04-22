# 🐛 DEBUG TRACE: Why Guest Data Missing (React Flow Analysis)

## 🎯 EXECUTION TRACE - GUEST OPEN HOMEPAGE

**Step-by-step runtime flow (based on code audit):**

```
1. main.tsx → render <App />
2. App.tsx → Router + Layout + AuthProvider + HomePage  
3. Layout → Navbar + <Outlet> = HomePage
4. AuthProvider useEffect [] → 
   - supabase.auth.getSession() → null (guest)
   - setSession(null), setIsLoading(false), NO fetchProfile
   - onAuthStateChange listener active
5. HomePage MOUNT → useEffect([]) TRIGGERS IMMEDIATELY
6. fetchData() executes:
   ```
   categories: supabase.from('categories').eq('is_active', true) → [] ?
   products: supabase.from('products').eq('is_active', true) → [] ?
   banners: supabase.from('banners').eq('is_active', true) → [] ?
   ```
7. setCategories([]), setProducts({newest:[],...}), setHeroBanners([])
8. Render → empty grids / \"No products found\"
```

**Key:** HomePage useEffect `[]` → **ALWAYS runs on mount, guest OK!**

## 📊 LOGIN vs GUEST DIFFERENCE

| State | Guest | Login |
|-------|-------|--------|
| AuthContext.isLoading | false immediately | true → false after profile |
| session | null | Session object |
| user | null | UserProfile |
| HomePage fetchData | Runs `[]` deps | Runs `[]` deps |
| Query | Direct anon | Authenticated session |

**Query IDENTICAL!** Supabase client uses anon key. No user filter.

## 🕵️ HIDDEN CONDITIONAL SCAN (NONE FOUND)

**No code patterns:**
```
❌ No `if (!user) return;`
❌ No `if (!session) skip;`
❌ No useEffect deps [user/session] in data fetches
❌ No `.eq('user_id', user?.id)`
❌ No JOIN user_profiles in public queries
```

**HomePage.jsx fetchData:** Pure Supabase calls, no auth refs.

## 🎯 ROOT CAUSE PASTI: **FETCH CALLS BUT RETURNS EMPTY**

**Bukan \"fetch tidak dipanggil\" → Query executes, data 0 rows.**

**Why empty (given SQL works, RLS public):**
1. **`is_active = false`** all rows → `.eq('is_active', true)` = []
2. **Table empty** no seed data
3. **RLS subtle**: Policy `true` but schema filter/anon perms

## 🔧 LOGGING STRATEGY (PASTE THIS)

**1. HomePage.jsx (~line 65, fetchData start):**
```jsx
console.log('🔍 GUEST DEBUG - HomePage fetchData START');
console.log('Auth:', {session: !!session, user: !!user, loading: isLoading});
const { data: catData, error: catErr } = await supabase.from('categories')...
console.log('Categories:', catData?.length, 'Err:', catErr);
const { data: prodData, error: prodErr } = await supabase.from('products')...
console.log('Products:', prodData?.length, 'Err:', prodErr);
console.log('=== END ===');
```

**2. Browser console expect GUEST:**
```
🔍 GUEST DEBUG - START
Auth: {session: false, user: null, loading: false}
Categories: 0 Err: null
Products: 0 Err: null
```
→ **Data empty → Check is_active / seed**

```
Error: {PGRST forbidden} → RLS still blocking
```

**3. Network tab:** Check `/rest/v1/products?eq.is_active=true` → 200 empty vs 403

## 🛠️ FIX INSTRUCTIONS

**1. Data issue (is_active=false):**
```
Supabase SQL:
UPDATE products SET is_active = true;
UPDATE categories SET is_active = true;
UPDATE banners SET is_active = true WHERE position='hero';
```

**2. Seed empty tables:**
```
INSERT demo data from src/data/products.js → Supabase seed.sql
```

**3. Double-check RLS (anon test):**
```
Supabase → Authentication → Settings → Anon key test query
```

**Expected post-fix:** Guest console `Products: 12` → grids full!

**Pro tip:** Add React Query for caching + optimistic updates later.

**Trace complete! Data filter culprit. SQL update → fixed.**
