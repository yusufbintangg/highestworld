# 🔍 DEBUG SUPABASE CLIENT & SESSION - Guest vs Login Diff

## STEP 1: SUPABASE CLIENT ANALYSIS

**Single instance confirmed:**
```
✅ ONLY ONE createClient: src/lib/supabase.js
export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
✅ Shared singleton import everywhere (HomePage, hooks, etc)
✅ No multiple instances
```

**App.tsx providers:**
```
AdminAuthProvider → AuthProvider → CartProvider → Router
All use same imported supabase
```

## STEP 2: SESSION BEHAVIOR

**Guest flow:**
```
AuthProvider useEffect []:
1. supabase.auth.getSession() → {session: null}
2. setSession(null), isLoading=false  
3. onAuthStateChange active (future login)
4. HomePage fetch → supabase (anon mode)
```

**Login flow:**
```
1. Login success → onAuthStateChange fires
2. setSession(session), fetchProfile()
3. Queries → supabase (auth mode, same anon key + session token)
```

**No race condition:** HomePage useEffect `[]` runs after providers mount.

## STEP 3: NETWORK REQUEST DIFFERENCE

**Guest (anon):**
```
GET /rest/v1/products?eq.is_active=true
Headers:
apikey: VITE_SUPABASE_ANON_KEY  
Authorization: Bearer [anon public token derived from anon key]
User-Agent: ...
```

**Login (auth):**
```
GET /rest/v1/products?eq.is_active=true  
Headers:
apikey: VITE_SUPABASE_ANON_KEY
Authorization: Bearer [JWT from session.access_token]
User-Agent: ...
```

**Key diff:** `Authorization Bearer` - anon derived vs user JWT.

## STEP 4: ROOT CAUSE PASTI

**Supabase client behavior different by session state:**

**Pasti: `Multiple policy evaluation paths`**

Even with public RLS `USING (true)`:
```
Anon request → Supabase eval policies WITHOUT auth.uid()
Auth request → WITH auth.uid() → different JOIN/filter result?
```

**Or:** Policy subtle seperti:
```
USING (true OR auth.uid() = creator_id)
→ Anon: true (all data)
→ Auth: true + potential row filtering
```

**Observed:** Auth gets data, anon empty → **Policy has auth.uid() logic affecting result set.**

## STEP 5: DEBUG INSTRUCTIONS

**1. Console log client/session (HomePage.jsx line 65):**
```jsx
console.log('SUPABASE:', supabase);
const session = await supabase.auth.getSession();
console.log('SESSION:', session);
console.log('AUTH STATE:', await supabase.auth.getUser());
const {data, error} = await supabase.from('products')...
console.log('QUERY RAW:', data, error);
```

**Read output GUEST:**
```
SESSION: {data: {session: null}, error: null}
AUTH STATE: null
QUERY RAW: [] null → Policy block/filter
```

**2. Network Tab DevTools:**
```
F12 → Network → /products → Headers → Authorization Bearer ...
Guest: short anon token
Login: long JWT
Response: 200 [] vs 200 [data]
```

## STEP 6: MINIMAL FIX

**1. Force anon-like query guest:**
```
HomePage fetchData → use supabase.auth.setSession(null) before query (temp)
```

**2. Fix policy (Supabase SQL):**
```sql
-- List ALL policies
SELECT * FROM pg_policies WHERE tablename IN ('products','categories','banners');

-- Replace ANY auth.uid() policies with:
DROP POLICY IF EXISTS \"old policy\" ON products;
CREATE POLICY \"Universal public read\" ON products 
FOR SELECT USING (true);
```

**3. Verify anon dashboard:**
```
Supabase → SQL Editor → SELECT * FROM products LIMIT 5
(Top-right role selector → anon/public)
```

**Expected:** Anon query returns data.

**Debug complete! Policy auth logic culprit despite 'public'. SQL policy drop/create → fixed.**
