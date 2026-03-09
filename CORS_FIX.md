# 🚀 FIX CORS ERROR - DEPLOY EDGE FUNCTION

**Issue:** CORS error when calling Supabase edge function  
**Status Code:** preflight request failing (not 200)

---

## **SOLUTION:**

### **Step 1: Deploy/Update the Edge Function**

The function needs to be deployed to Supabase. Run this command:

```bash
cd /Users/macbook/Documents/E-Commerce\ Bigsize\ Fashion

# Deploy the function
supabase functions deploy midtrans-create
```

If you don't have Supabase CLI installed:
```bash
npm install -g supabase
supabase login
supabase functions deploy midtrans-create
```

---

### **Step 2: Set Environment Variables**

The function needs these env vars set in Supabase:

1. Go to **Supabase Dashboard** → Project → **Settings** → **Edge Functions** 
2. Click **midtrans-create**
3. Set these variables:
   ```
   MIDTRANS_SERVER_KEY = "Mid-server-Bpy5vHW4-qwb__05qrbSaYFA"
   SUPABASE_URL = "https://kswqsurvzbwnlsseihrk.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY = "[your service role key from Settings → API]"
   ```

---

### **Step 3: Enable CORS in Supabase**

Supabase should auto-handle CORS for functions, but make sure:

1. Project is public (not restricted)
2. Function is deployed and active

---

### **Step 4: Test Again**

After deploying:
```bash
npm run dev
```

Then test checkout → Midtrans should work!

---

## **WHAT I FIXED:**

Updated CORS headers in the edge function:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",  // ✅ Added
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",  // ✅ Added
};
```

---

## **STATUS:**

- ✅ CORS headers fixed
- ⏳ Need to deploy function to Supabase

**Do Step 1 & 2 above, then test again!**

---

## **QUICK COMMAND:**

If Supabase CLI is installed:

```bash
cd /Users/macbook/Documents/E-Commerce\ Bigsize\ Fashion
supabase functions deploy midtrans-create
```

Done! 🚀
