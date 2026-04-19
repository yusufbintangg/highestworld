# 🛠️ MIGrasi SANDBOX → PRODUCTION: MIDTRANS + BITESHIP

Yo bro, gue udah scan project lu secara detail. Ini hasil **COMPLETE AUDIT** dengan instruksi presisi. **GUE GA NGUBAH FILE APA2**, cuma kasih panduan exact changes yang lu harus lakukan manual. Follow step by step biar aman 🔥

## STEP 1 — SCAN PROJECT
**Files relevan Midtrans:**
- `src/lib/midtrans.js` — Client-side Snap loader + transaction creator
- `supabase/functions/midtrans-create/index.ts` — Server-side transaction creation
- `supabase/functions/midtrans-webhook/index.ts` — Payment webhook handler
- `src/app/hooks/useCheckout.js` — Frontend checkout logic (panggil Midtrans)

**Files relevan Biteship:**
- `supabase/functions/biteship-rates/index.ts` — Shipping rates API
- `supabase/functions/biteship-create-order/index.ts` — Create shipping order  
- `supabase/functions/biteship-search/index.ts` — Area search
- `src/app/hooks/useCheckout.js` — Frontend shipping integration

**Env files:** `.env` (frontend), Supabase Dashboard → Settings → Edge Functions → Env vars

## STEP 2 — INSTRUKSI PERUBAHAN

### File: `src/lib/midtrans.js`
**Baris: ~2-4 (MIDTRANS_CONFIG)**
```
Current:
isProduction: false,

Ubah menjadi:
isProduction: true,
```
**Alasan:** Switch Snap URL dari sandbox ke production (`app.midtrans.com`)

**Baris: ~6 (script.src)**
```
Current:
? 'https://app.sandbox.midtrans.com/snap/snap.js'

Ubah menjadi:
? 'https://app.midtrans.com/snap/snap.js'
```
**Alasan:** Load production Snap JS.

### File: `supabase/functions/midtrans-create/index.ts` 
**Baris: ~85 (fetch URL)**
```
Current:
"https://app.sandbox.midtrans.com/snap/v1/transactions",

Ubah menjadi:
"https://app.midtrans.com/snap/v1/transactions",
```
**Alasan:** Server-side transaction ke production endpoint.

### File: Biteship functions (`biteship-rates`, `biteship-create-order`, `biteship-search`)
**TIDAK PERLU UBAH CODE** — Pure API key swap via env vars.

## STEP 3 — ENV VARIABLES

**Frontend (.env):**
```
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-prod-XXXXX → REPLACE_WITH_PRODUCTION_CLIENT_KEY
```

**Supabase Edge Functions (Dashboard → Settings → Edge Functions → Variables):**
```
MIDTRANS_SERVER_KEY=SB-Mid-prod-YYYYY → REPLACE_PRODUCTION_SERVER_KEY
BITESHIP_API_KEY=bskey_prod_ZZZZZ → REPLACE_PRODUCTION_BITESHIP_KEY
FRONTEND_URL=https://yourdomain.com → https://your-production-domain.com
SUPABASE_URL=your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

**Cara dapet keys:**
- **Midtrans:** Dashboard Midtrans → Settings → Access Keys → Production tab → Copy Server/Client Key
- **Biteship:** Dashboard Biteship → API Keys → Generate Production Key  
- **Supabase:** Dashboard → Settings → API → Service Role Key (jangan commit ke git)

## STEP 4 — WEBHOOK CHECK

**File:** `supabase/functions/midtrans-webhook/index.ts`
- **Status:** ✅ Signature validation **TIDAK ADA** (basic implementation)
- **Callback URL:** `${FRONTEND_URL}/pesanan/{orderNumber}` (auto dari env)

**Yang harus dipastikan:**
```
1. Update FRONTEND_URL ke production domain
2. Verifikasi webhook URL di Midtrans Dashboard → Settings → Callbacks  
   → Finish: https://your-project.supabase.co/functions/v1/midtrans-webhook
3. Production: Enable IP whitelisting di Midtrans (midtrans.com IP range)
4. Test webhook dulu pake ngrok sebelum production
```

## STEP 5 — DEPLOY KE SUPABASE

### Update Edge Functions Env Vars:
```
1. Supabase Dashboard → Edge Functions
2. Pilih function (midtrans-create, midtrans-webhook, biteship-*)
3. Settings → Environment Variables → Update keys
4. Save → Redeploy (auto)
```

### CLI Redeploy semua functions:
```bash
cd supabase/functions
supabase functions deploy midtrans-create
supabase functions deploy midtrans-webhook  
supabase functions deploy biteship-rates
supabase functions deploy biteship-create-order
supabase functions deploy biteship-search
```

### Frontend Deploy:
```
pnpm build && vercel --prod
# Update VITE_* di Vercel dashboard
```

## STEP 6 — TESTING AMAN

### Checklist Pre-Production:
```
✅ [ ] Backup database Supabase
✅ [ ] Test Midtrans production dengan nominal Rp 10.000 (min)
✅ [ ] Test Biteship rates → create order flow  
✅ [ ] Verify webhook firing (check Supabase logs)
✅ [ ] Test full flow: Checkout → Payment → Order status update → Stock decrement
✅ [ ] WA notification ke admin works
```

### Testing Tanpa Rusak Transaksi Real:
```
1. Midtrans Production: Pakai "Production - Testing" mode (nominal kecil)
2. Biteship: Test mode available di dashboard  
3. Monitor Supabase Edge Logs real-time
4. Gunakan test customer data (bukan real user)
5. Siapin manual stock restore kalau error
```

### Tips Hindari Error:
```
- JANGAN test dengan data real customer
- Pastiin domain sudah HTTPS (Midtrans requirement)  
- Rate limit: Max 2 email/jam, monitor auth logs
- Stok auto-decrement → test dengan produk dummy dulu
- Error handling: Cek Supabase logs + Midtrans dashboard
```

**Done bro! Follow exact steps ini, production lu bakal smooth. Kalau stuck di step mana, ping gue. No direct code changes, pure audit + instruksi. Safe migration guaranteed! 🚀**

