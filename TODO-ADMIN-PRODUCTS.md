# TODO: Admin Products - Active First 📊

## Status: [ ] 0% Complete

### Step 1: Update useAdminProducts.js Sort [✅]
- File: `src/app/hooks/useAdminProducts.js`
- Edit `fetchProducts()`: `.order('is_active', { ascending: false }).order('created_at', { ascending: false })`
- Result: [🟢 AKTIF newest→old] + [🔴 INACTIVE newest→old]

### Step 2: Test AdminProducts Page [ ]
- [ ] Buka /admin/products
- [ ] Active products (is_active=true) di atas semua
- [ ] Search still works 
- [ ] Toggle active → auto re-sort

### Step 3: Visual Polish (Optional) [ ]
- Add sort icon/indicator
- Sticky header table

**Next: Step 1 → 1 line change! Ready?**
