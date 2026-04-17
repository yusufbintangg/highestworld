# ✅ FIX PRODUCT DETAIL SIZE SORTING (Pure Supabase Data)

**Goal:** Size options di ProductDetailPage urut ascending (XS,S,M,L,XL,2XL,3XL...)
**Data Source:** 100% dari Supabase product_variants (NO local hardcoded)

## Plan Breakdown:
```
1. [x] Create this TODO.md 
2. [ ] Add SIZE_ORDER constant di ProductDetailPage.jsx
3. [ ] Create sortSizes() function 
4. [ ] Update sizesForSelectedColor = sortSizes(filteredVariants)
5. [ ] Update fallback sizes (no color selected) = sortSizes(allVariants)
6. [ ] Test: sizes urut + stock info tetep work
7. [ ] attempt_completion
```

## Logika Utama:
```
SIZE_ORDER = {'XS':1, 'S':2, 'M':3, 'L':4, 'XL':5, '2XL':6, '3XL':7...}
sortSizes(arr) = arr.sort((a,b) => SIZE_ORDER[a.size] - SIZE_ORDER[b.size])
```

**ETA:** 2-3 tool calls
**File Target:** src/app/pages/ProductDetailPage.jsx

