# 🚨 Fixing Unauthorized Dashboard Access (React + Supabase)

## 🕵️ Problem Summary
User biasa (customer) bisa akses `/admin/dashboard` setelah login/register. Dashboard seharusnya **admin only**.

## 📂 Key Files Analyzed
| File | Issue |
|------|-------|
| `src/app/routes.jsx` | Admin routes unprotected |
| `src/context/AdminAuthContext.jsx` | No role check |
| `src/app/components/auth/AdminProtectedRoute.tsx` | Exists tapi unused |
| `src/app/pages/admin/AdminDashboard.jsx` | Direct DB queries |

## 🔍 Root Cause Analysis

### Authentication Flow (OK)
```
User login → Supabase session → AuthContext.isAuthenticated = true
```

### Authorization Flow (BROKEN)
```
User → /admin → AdminLayout → AdminAuthContext → session exists → Dashboard renders
❌ NO ROLE CHECK!
```

**Specific bugs:**
1. `routes.jsx`: `{ path: '/admin', element: <AdminLayout /> }` **missing wrapper**
2. `AdminAuthContext.jsx`: `setAdmin(session?.user)` **all users = admin**
3. Dashboard: `supabase.from('products')` **no authz**

## ✅ Step-by-Step Fix Instructions

### 1. Protect Admin Routes (Priority #1)
**File:** `src/app/routes.jsx` (~line 70)
```jsx
// ❌ BEFORE
{ path: '/admin', element: <AdminLayout /> }

// ✅ AFTER  
{ path: '/admin', element: <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute> }
```

### 2. Add Role-Based Admin Check
**File:** `src/context/AdminAuthContext.jsx` (~line 15-30)
```jsx
// Tambah setelah setAdmin(session?.user):
if (session?.user) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    await supabase.auth.signOut();
    setAdmin(null);
    return;
  }
}
```

### 3. Secure Supabase Queries
**File:** `src/app/pages/admin/AdminDashboard.jsx` (all queries)
```jsx
// Tambah filter atau pakai RLS
const { count } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
  .eq('created_by', admin.id); // Atau RLS policy
```

### 4. Supabase RLS Policies (CRITICAL)
```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Admin policy
CREATE POLICY \"Admin read\" ON products FOR SELECT 
USING (auth.role() = 'admin' OR 
       exists(SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY \"Admin write\" ON products FOR ALL 
USING (exists(SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
```

### 5. Add Role Column (if missing)
```sql
ALTER TABLE user_profiles ADD COLUMN role text DEFAULT 'customer' 
CHECK (role IN ('customer', 'admin'));
```

## 🧪 Test Checklist
```
[ ] Customer login → /admin → redirect home
[ ] Admin login → /admin → dashboard OK  
[ ] Customer → direct DB query → blocked by RLS
[ ] Admin → see all data → OK
```

## 🔐 Security Best Practices
1. **NEVER** client-side authz only
2. **Always** RLS + role column  
3. Separate customer/admin contexts
4. Add audit logs: `created_by = auth.uid()`
5. Environment vars: Different anon keys?

## 🚨 Risks if Unfixed
- Customer leak revenue data
- Stock manipulation  
- Order data exposure
- Zero barriers to admin features

## 📱 Production Checklist
- RLS enabled everywhere
- Role column populated
- Test all admin endpoints
- Monitor Supabase logs

**Audit completed: 2024. All fixes preserve existing UX. Apply step-by-step!**
