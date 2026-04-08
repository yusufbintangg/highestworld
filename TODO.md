# Fix Order Items Not Showing in OrderDetailPage

## Plan Summary
- Issue: Produk pesanan ga keliatan di halaman /pesanan/[orderNumber] setelah bayar.
- Root cause: Kemungkinan order_items table kosong atau query join gagal.
- Status: Analyzing [IN PROGRESS]

## Steps:
- [ ] 1. Check Supabase data (user: cek table orders & order_items)
- [x] 2. Add console.log & error handling in OrderDetailPage fetchOrder() ✅
- [x] 7. Fix ProductCard.jsx import path to '../../../lib/utils' ✅

- [ ] 3. Test full flow: add cart → checkout → midtrans → OrderDetailPage
- [ ] 4. Fix midtrans edge function if insert order_items fail
- [ ] 5. Update Supabase RLS policy if needed
- [ ] 6. Test & deploy

**Current HEAD: 5f6a852 (25 maret)**
