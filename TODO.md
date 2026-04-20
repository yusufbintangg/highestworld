# TODO: Navbar Direct Product Search 🚀

## Status: [ ] 0% Complete

### Step 1: Create useProductSearch Hook [✅]
- File baru: `src/app/hooks/useProductSearch.js`
- Logic: search single product by name (Supabase ILIKE '%query%' LIMIT 1)
- Return: { product, loading, error }
- Edge case: no result → null

### Step 2: Update Navbar.jsx Search Handler [✅]
- Import useProductSearch + useNavigate (path fixed ../../hooks)
- Add searchTrigger state + auto-redirect useEffect
- Update desktop + mobile input handlers
- Logic: Enter → trigger → product? detail : list

### Step 3: Test Cases [ ]
- [ ] Exact match → direct detail
- [ ] No result → products list  
- [ ] Multiple possible → products list
- [ ] Mobile burger search
- [ ] URL sync

### Step 4: Polish & Edge Cases [ ]
- Debounce search (300ms)
- Case insensitive (ILIKE handle)
- Empty query → homepage
- Loading spinner on search

**Next: Step 1 → create hook. Ready?**
