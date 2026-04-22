# CHECKOUT VS CART SYSTEM FIX - PHASE 1 (Quick Fix)
Status: 🚀 READY TO IMPLEMENT

## ✅ TODO STEPS (Phase 1 - Hide Cart in Checkout)

### 1. ✅ Edit Navbar.jsx
- Hide CartDrawer button saat location.pathname === '/checkout'

### 2. ✅ Edit CartDrawer.jsx  
- Add `disabled` prop → return children only (no drawer)

### 3. ✅ Test Flow
```
ProductDetail → Buy Now (1 item) → Checkout 
✅ CartDrawer hidden
✅ Navbar simplified
✅ Ongkir fixed
```

### 3. [ ] Test Flow
```
ProductDetail → Buy Now (1 item) → Checkout 
✅ CartDrawer hidden
✅ Ongkir fixed (ga berubah)
✅ Navbar simplified
```

### 4. [ ] Verify Biteship
```
console.log(totalWeight) → pastiin sum semua items qty*weight
```

## 🔧 NEW ISSUE: REFRESH CHECKOUT → WRONG REDIRECT

### 4. ✅ Fix Checkout Refresh Flow (FINAL)
- Problem: Refresh `/checkout` → redirect ke /produk 
- Fix: `document.referrer.includes('/products') || '/product'` + `navigate('/products')`

## ⏳ AFTER PHASE 1 SUCCESS → Optional Phase 2
```
[ ] Cart snapshot in useCheckout.js  
[ ] Decouple checkout from live cart
```

**Current: PHASE 1 - QUICK WIN (15 mins)**
**Test Command: `pnpm dev`**

