# ONGKIR FIX - Biteship Weight Consistency

**Status:** [IN PROGRESS]

## Information Gathered:
- **CheckoutPage.jsx**: `item.product?.weight || 500` → `totalWeight = 500g × qty` → Biteship rates **1 item total weight** = 210k ✅
- **biteship-rates**: `items[0].weight = totalWeight` (1 item, total berat semua cart) ✅
- **biteship-create-order**: `weight: 500` **HARDCODE** per item → 10 items = 5kg → 1.4jt ❌
- **products.js**: `weight: "300g"` string → `parseFloat(null)` → default 500
- **DB**: `products.weight` & `order_items.product_weight` ada tapi string format

## Plan:
1. **biteship-create-order**: `weight: parseInt(item.product_weight || '500')` (per item)
2. **CheckoutPage**: Pass `product_weight: parseInt(item.product?.weight || 500)` ke order_items
3. Deploy: `supabase functions deploy biteship-create-order biteship-rates`

## Dependent Files:
- `/Users/macbook/Documents/E-Commerce Bigsize Fashion/src/app/pages/CheckoutPage.jsx`
- `/Users/macbook/Documents/E-Commerce Bigsize Fashion/supabase/functions/biteship-create-order/index.ts`

## Followup:
- `pnpm dev` → Test Fakfak 10pcs → ongkir konsisten 210k
- Push ke Biteship → verify weight per item di Biteship dashboard

