# HIGHEST WORLD

> B2C E-Commerce platform for big-size fashion (2XL–8XL) — Production Ready

<!-- Tech Stack -->
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production-brightgreen?style=flat)

<!-- Payment (ganti URL logo sesuai Cloudinary lo) -->
<img src="https://res.cloudinary.com/dopr9tvnv/image/upload/v1777005438/midtrans-3107x512_cw4s05.png" height="20" alt="Midtrans" /> &nbsp; <img src="https://res.cloudinary.com/dopr9tvnv/image/upload/v1777005461/ru7gxauuol6z65snajo6.png" height="20" alt="Biteship" /> &nbsp; <img src="https://res.cloudinary.com/dopr9tvnv/image/upload/v1776880345/New_Logo_JNE_pdsxka.png" height="20" alt="JNE" /> &nbsp; <img src="https://res.cloudinary.com/dopr9tvnv/image/upload/v1776860046/Logo_J_T_Merah_Square_pldeu4.jpg" height="20" alt="J&T" /> &nbsp; <img src="https://res.cloudinary.com/dopr9tvnv/image/upload/v1776880838/copy_of_logo-sicepat-1536x1152_pw8nkw_c72b18.png" height="20" alt="SiCepat" /> &nbsp; <img src="https://res.cloudinary.com/dopr9tvnv/image/upload/v1776859990/695e3a709eccbe055c311aac6b25729d_canx9h.jpg" height="20" alt="QRIS" /> &nbsp; <img src="https://res.cloudinary.com/dopr9tvnv/image/upload/v1776860057/GKL14_OVO_-_Koleksilogo.com_oun8yg.jpg" height="20" alt="OVO" /> &nbsp; <img src="https://res.cloudinary.com/dopr9tvnv/image/upload/v1776859979/ALFAMART_LOGO_BARU_sx4wj1.png" height="20" alt="Alfamart" /> &nbsp; <img src="https://res.cloudinary.com/dopr9tvnv/image/upload/v1776877359/_bjGT4LXUDvlKg6ySYU_Q_image_nlwqlk.webp" height="20" alt="Akulaku" />

---

**Stack:** React 18 · Vite · Tailwind CSS · shadcn/ui · Supabase · Midtrans · Biteship · Resend · Vercel

| Property | Value |
|---|---|
| Category | B2C E-Commerce — Big Size Fashion (2XL–8XL) |
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL + Edge Functions/Deno) |
| Payments | Core API (QRIS/VA/e-wallet) + WhatsApp Transfer |
| Shipping | Biteship Real-time API |
| Email | Resend (Transactional) + Supabase Auth Emails |
| WA Notif | Fonnte API |
| Hosting | Vercel (Frontend) + Supabase Cloud (Backend) |
| Domain | highestworld.id |
| Status | ✅ Production Ready |

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [System Architecture](#2-system-architecture)
3. [Database Schema](#3-database-schema)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Checkout & Payment System](#5-checkout--payment-system)
6. [Edge Functions Reference](#6-edge-functions-reference)
7. [Loyalty, Rewards & Voucher System](#7-loyalty-rewards--voucher-system)
8. [Email System](#8-email-system)
9. [Admin System](#9-admin-system)
10. [Known Issues & Roadmap](#10-known-issues--roadmap)
11. [Deployment Guide](#11-deployment-guide)

---

## 1. System Overview

Highest World is a production-grade B2C e-commerce platform specializing in big-size fashion (2XL–8XL) for men in Indonesia. Built to solve three core market problems:

- **Market gap** — Limited online presence for big-size clothing with accurate sizing and variant management
- **Checkout friction** — Mandatory registration reduces conversion 30–50%; solved via full guest checkout support
- **Operational overhead** — Manual stock tracking, shipping calculation, and order notifications fully automated

### 1.1 Core Feature Matrix

| Module | Description | Status |
|---|---|---|
| Product Catalog | Filter by category/size/badge, sort, pagination | ✅ Production |
| Guest Checkout | Full checkout without account — user_id nullable | ✅ Production |
| Midtrans Payment | Snap popup with method filtering (QRIS/VA/OVO/CC/Alfamart/Akulaku) | ✅ Production |
| Midtrans Core API | Direct charge for QRIS/VA/Gopay via Edge Function | ✅ Production |
| Payment Detail | Query Midtrans status & rebuild payment details | ✅ Production |
| WhatsApp Transfer | Manual bank transfer via WA message | ✅ Production |
| Real-time Shipping | Biteship — JNE, J&T, SiCepat, AnterAja rate calculation | ✅ Production |
| Loyalty Points | Earn per purchase, 1-year expiry, ledger-based | ✅ Production |
| Loyalty Dashboard | Points balance, history, referral page (frontend live) | 🟡 Partial |
| Rewards Redemption | Redeem points for rewards (user_rewards table ready, UI Coming Soon) | 🔧 Schema Ready |
| Voucher System | Percentage/fixed discount codes | 🔧 Schema Ready |
| Referral System | Referral code + referral_uses tracking (UI Coming Soon) | 🔧 Schema Ready |
| Email Notifications | Order confirmation + payment success via Resend | ✅ Production |
| Google OAuth | Sign in with Google for customers | ✅ Production |
| Admin Dashboard | Orders, products, stock, AWB management + batch ops | ✅ Production |
| Banners CMS | Hero/promotional banner management | ✅ Production |
| Shipping Tracking | AWB number upload + Biteship push + tracking | ✅ Production |
| Order Re-payment | Re-open Snap from Order Detail page if unpaid | ✅ Production |

---

## 2. System Architecture

### 2.1 Folder Structure

```
src/
├── app/
│   ├── pages/                  # Route-level page components
│   │   ├── account/            # Customer account pages
│   │   │   ├── loyalty/        # Loyalty sub-pages
│   │   │   │   ├── LoyaltyDashboardPage.tsx
│   │   │   │   ├── LoyaltyHistoryPage.tsx
│   │   │   │   ├── LoyaltyReferralPage.tsx
│   │   │   │   └── LoyaltyRewardsPage.tsx
│   │   │   ├── AccountAddressesPage.tsx
│   │   │   ├── AccountDashboardPage.tsx
│   │   │   ├── AccountOrdersPage.tsx
│   │   │   ├── AccountSecurityPage.tsx
│   │   │   └── AccountSettingsPage.tsx
│   │   ├── admin/              # Admin panel
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminOrders.jsx
│   │   │   ├── AdminProducts.jsx
│   │   │   └── AdminStock.jsx
│   │   ├── auth/               # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   ├── collections/        # Collection pages
│   │   │   ├── CollectionDetailPage.jsx
│   │   │   └── CollectionsPage.jsx
│   │   ├── products/           # Product catalog pages
│   │   │   ├── ProductDetailPage.jsx
│   │   │   └── ProductsPage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── OrderDetailPage.jsx
│   │   └── PaymentConfirmationPage.jsx
│   ├── components/
│   │   ├── admin/              # BatchDialogs, DateRangePicker, EditVariantModal, OrderDetailDialog, ProductFormModal
│   │   ├── auth/               # AdminProtectedRoute.tsx, ProtectedRoute.tsx
│   │   ├── checkout/           # CheckoutForm, CourierCard, OrderSummary, PaymentMethodModal
│   │   ├── figma/              # ImageWithFallback.tsx
│   │   ├── layout/             # Footer.jsx, Navbar.jsx
│   │   ├── product/            # ColorSelector, ProductCard, ProductGrid, SizeSelector
│   │   │   ├── detail/         # ProductActions, ProductImages, ProductInfo, ProductMeta, ProductVariants
│   │   │   └── product-page/   # Pagination, ProductFilter, ProductSort
│   │   ├── shared/             # BackToTop, CartDrawer, UserMenu.tsx, WhatsAppFloat
│   │   └── ui/                 # shadcn/ui base components (40+ components)
│   ├── hooks/                  # orderActions.js, useAdminProducts.js, useCheckout.js, useOrders.js, useProducts.js, useProductSearch.js
│   ├── routes.jsx              # React Router v7 config
│   ├── App.tsx / App.jsx       # Root component with providers
│   └── Layout.jsx              # Main layout (Navbar, Footer, Outlet)
├── context/
│   ├── AuthContext.tsx         # Customer auth state (global)
│   ├── AdminAuthContext.jsx    # Admin auth + role check (scoped)
│   └── CartContext.jsx         # Cart state via localStorage
├── data/
│   ├── categories.js
│   └── products.js             # Static product seed data
├── lib/
│   ├── supabase.js             # Supabase anon client
│   ├── midtrans.js             # Snap popup integration + createTransaction
│   ├── config.js               # WHATSAPP_NUMBER, BANK_INFO, SITE_CONFIG, SHIPPING_INFO
│   └── utils.js                # formatPrice, generateCartWAMessage, cn
├── styles/
│   ├── fonts.css
│   ├── index.css
│   ├── tailwind.css
│   └── theme.css
└── supabase/functions/
    ├── _shared/
    │   └── email-templates.ts  # Shared email HTML builders
    ├── midtrans-create/        # Order creation + Midtrans Snap init
    ├── midtrans-webhook/       # Payment status sync + points + stock decrement
    ├── charge-payment/         # Midtrans Core API charge (QRIS/VA/Gopay)
    ├── get-payment-detail/     # Query Midtrans status + rebuild payment details
    ├── biteship-rates/         # Shipping rate proxy
    ├── biteship-search/        # Area/city search proxy
    └── biteship-create-order/  # Submit order to Biteship for pickup
```

### 2.2 Provider Hierarchy

`AdminAuthProvider` is intentionally scoped to `/admin/*` routes only to prevent session conflicts between customer (Google OAuth) and admin (email/password) auth flows.

```
App.tsx
└── AuthProvider            ← customer auth, global
    └── CartProvider        ← localStorage cart, global
        └── RouterProvider
            ├── /admin/login → AdminLoginWrapper
            │                  └── AdminAuthProvider
            │                      └── AdminLogin
            ├── /admin/*    → AdminWrapper
            │                  └── AdminAuthProvider
            │                      └── AdminLayout → children
            └── /*          → Layout → Page components
```

---

## 3. Database Schema

### 3.1 Entity Overview

| Table | Description | Key Relations |
|---|---|---|
| auth.users | Supabase built-in identity | Root for all user tables |
| user_profiles | Extended customer data + points | → auth.users |
| user_addresses | Saved shipping addresses | → user_profiles |
| admin_users | Admin accounts with role | → auth.users |
| products | Product master data | → categories |
| product_variants | Size/color/stock per product | → products |
| categories | Hierarchical categories | Self-ref parent_id |
| banners | Hero & promo banners | Standalone |
| orders | Customer order records | → user_profiles (nullable) |
| order_items | Line items per order | → orders, products, variants |
| payments | Midtrans payment records | → orders |
| order_status_history | Status change audit log | → orders |
| shipping_tracking | AWB + courier tracking | → orders |
| points_ledger | Points earn/redeem history | → user_profiles |
| rewards | Redeemable reward items | Standalone |
| user_rewards | Claimed rewards per user | → user_profiles, rewards |
| vouchers | Discount codes | → user_profiles (optional) |
| referral_uses | Referral tracking | → user_profiles (x2) |

### 3.2 user_profiles

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | — (matches auth.users.id) |
| full_name | text | YES | null |
| phone | text | YES | null |
| avatar_url | text | YES | null |
| referral_code | text | YES | null (auto-generated) |
| referred_by | uuid | YES | null → user_profiles.id |
| points_balance | integer | NO | 0 |
| total_points | integer | NO | 0 |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |

### 3.3 orders

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| order_number | varchar | NO | HW-{timestamp} |
| user_id | uuid | YES | null (guest orders allowed) |
| customer_name | varchar | NO | null |
| customer_email | varchar | YES | null |
| customer_phone | varchar | YES | null |
| shipping_address | text | NO | null |
| shipping_city | varchar | YES | null |
| shipping_city_id | integer | YES | null |
| shipping_province | varchar | YES | null |
| shipping_postal_code | varchar | YES | null |
| courier | varchar | NO | null e.g. 'jne' |
| courier_service | varchar | NO | null e.g. 'REG' |
| shipping_cost | integer | NO | 0 |
| shipping_etd | varchar | YES | null (estimated delivery) |
| subtotal | integer | NO | null |
| discount_amount | integer | YES | 0 |
| points_used | integer | YES | 0 |
| total | integer | NO | null |
| payment_method | varchar | NO | 'qris', 'bank_transfer', 'ovo', 'va', 'gopay', 'credit_card', 'alfamart', 'akulaku' |
| status | varchar | NO | 'waiting_payment' |
| snap_token | varchar | YES | null |
| payment_expired_at | timestamptz | YES | null (+24h from creation) |
| points_earned | integer | YES | 0 |
| notes | text | YES | null |
| awb_number | varchar | YES | null |
| biteship_order_id | varchar | YES | null |
| tracking_number | varchar | YES | null |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |

### 3.4 Order Status Lifecycle

```
waiting_payment → payment_confirmed → processing → shipped → completed
               ↘ expired (terminal)
               ↘ payment_failed (terminal)
               ↘ cancelled (terminal)
```

| Status | Trigger | Next States |
|---|---|---|
| waiting_payment | Order creation (midtrans-create) | payment_confirmed, expired, payment_failed, cancelled |
| payment_confirmed | Midtrans webhook (settlement/capture) | processing |
| processing | Admin manual update | shipped |
| shipped | Admin inputs AWB / Biteship push | completed |
| completed | Admin or auto-complete | — terminal |
| expired | Midtrans webhook (expire) or 24h timeout | — terminal |
| payment_failed | Midtrans webhook (deny/cancel) | — terminal |
| cancelled | Admin manual cancellation | — terminal |

> For full schema of all 18+ tables (products, variants, categories, payments, points_ledger, rewards, vouchers, etc.) see the internal technical documentation v1.0.

---

## 4. Authentication & Authorization

### 4.1 Dual Auth Architecture

| Aspect | Customer (AuthContext) | Admin (AdminAuthContext) |
|---|---|---|
| Scope | Global — all routes | Scoped — /admin/* only |
| Login methods | Email/password + Google OAuth | Email/password only |
| Role check | None (any authenticated user) | admin_users table lookup |
| Guest support | Yes — checkout without login | No |

### 4.2 Admin Authentication Flow

```
1. POST email + password → /admin/login
2. supabase.auth.signInWithPassword({ email, password })
3. SELECT * FROM admin_users WHERE id = user.id AND is_active = true
4. Not found → signOut() + throw 'Akses ditolak'
5. Found → setAdmin({ ...authUser, ...adminUser })
6. AdminLayout: if (!admin && !loading) → navigate('/admin/login')
```

### 4.3 Protected Routes

| Route | Guard | Redirect if Unauthorized |
|---|---|---|
| /checkout | None — guest allowed | — |
| /account/* | ProtectedRoute (isAuthenticated) | /login |
| /loyalty/* | ProtectedRoute (isAuthenticated) | /login |
| /admin/* | AdminAuthProvider + AdminLayout check | /admin/login |

---

## 5. Checkout & Payment System

### 5.1 Guest vs Member Checkout

| Feature | Guest | Logged-in Member |
|---|---|---|
| Form data | Manual input all fields | Auto-fill from user_profiles + saved address |
| user_id in orders | NULL | auth.users UUID |
| Loyalty points | Not earned | Earned post-payment |
| Order history | Via order number only | Account dashboard |

### 5.2 Payment Method Selection

Checkout supports **8 payment methods** via Midtrans Snap filtering:

| Method | ID | Snap Filter |
|---|---|---|
| QRIS | qris | `['other_qris']` |
| OVO | ovo | `['ovo']` |
| Virtual Account | va | `['bca_va','bni_va','bri_va','permata_va','other_va']` |
| Alfamart | alfamart | `['alfamart','indomaret']` |
| Akulaku | akulaku | `['akulaku']` |
| Credit Card | cc | `['credit_card']` |
| GoPay | gopay | `['gopay']` (via Core API) |
| Bank Transfer Manual | bank_transfer | WhatsApp redirect (manual) |

### 5.3 Midtrans Snap Payment Lifecycle

```
FRONTEND (useCheckout.js)
1. User fills form + selects courier + selects payment method
2. validateForm()
3. POST /functions/v1/midtrans-create

EDGE FUNCTION: midtrans-create
4.  orderNumber = 'HW-' + Date.now()
5.  INSERT orders (status='waiting_payment')
6.  INSERT order_items
7.  POST Midtrans /snap/v1/transactions → snap_token
8.  INSERT payments (status='pending')
9.  UPDATE orders SET snap_token, payment_expired_at (+24h)
10. Send 'waiting_payment' email via Resend
11. Return { snap_token, order_number, order_id }

FRONTEND
12. window.snap.pay(snap_token, { callbacks, enabledPayments })
13. onSuccess/onPending → navigate to /orders/:orderNumber

MIDTRANS WEBHOOK
14. Receive: { order_id, transaction_status, payment_type }
15. UPDATE payments + orders SET status
16. INSERT order_status_history
17. IF settlement/capture:
    - RPC decrement_stock(variant_id, qty) — atomic
    - INSERT points_ledger + UPDATE user_profiles.points_balance
    - POST Fonnte API → WA notification to admin
    - Send 'payment_confirmed' email via Resend
```

### 5.4 Midtrans Core API (Alternative Flow)

For direct charge without Snap popup:

```
EDGE FUNCTION: charge-payment
1. Receive { order_number, payment_type, bank?, phone_number? }
2. GET order from DB
3. POST Midtrans /v2/charge with payment-specific payload
4. Extract payment detail (QR URL / VA number / deeplink)
5. UPDATE payments SET payment_detail, midtrans_order_id
6. Return { success, detail }

EDGE FUNCTION: get-payment-detail
1. Receive { order_number }
2. GET midtrans_order_id from payments table
3. GET Midtrans /v2/{order_id}/status
4. Build detail object per payment_type (qris, bank_transfer, cstore, echannel, gopay, credit_card)
5. Return { success, detail }
```

### 5.5 WhatsApp Transfer Flow

> ⚠️ **Note:** WhatsApp transfer orders are NOT saved to the database. This is a manual process.

```
1. generateOrderId() → HW-{timestamp}
2. Build WA message string with all order details
3. window.open('https://wa.me/{WHATSAPP_NUMBER}?text=...')
4. clearCart() → navigate('/konfirmasi-pembayaran')
```

**Recommendation:** Add database order creation before WA redirect to enable order tracking for manual transfer customers.

### 5.6 Order Re-payment

From `OrderDetailPage.jsx`, unpaid orders can be re-paid:

```
1. Check if order.status === 'waiting_payment' && !expired
2. Load Midtrans Snap script
3. snap.pay(order.snap_token, { callbacks })
4. On success/pending → refresh order data
```

---

## 6. Edge Functions Reference

| Function | Method | Description |
|---|---|---|
| midtrans-create | POST | Create order in DB + initialize Midtrans Snap transaction |
| midtrans-webhook | POST | Handle Midtrans payment status callbacks |
| charge-payment | POST | Direct charge via Midtrans Core API (QRIS/VA/Gopay) |
| get-payment-detail | POST | Query Midtrans status & rebuild payment details |
| biteship-rates | POST | Proxy: get shipping rates for origin → destination |
| biteship-search | POST | Proxy: search city/district areas by keyword |
| biteship-create-order | POST | Submit confirmed order to Biteship for pickup |

### 6.1 Environment Secrets

| Secret Key | Used In | Description |
|---|---|---|
| MIDTRANS_SERVER_KEY | midtrans-create, midtrans-webhook, charge-payment, get-payment-detail | Production server key |
| SUPABASE_URL | All functions | Project URL |
| SUPABASE_SERVICE_ROLE_KEY | All functions | Full DB access (server-side only) |
| RESEND_API_KEY | midtrans-create, midtrans-webhook | Resend email API key |
| FONNTE_TOKEN | midtrans-webhook | WhatsApp notification token |
| ADMIN_WA_NUMBER | midtrans-webhook | Admin phone for order alerts |
| FRONTEND_URL | midtrans-create | Production URL |
| BITESHIP_API_KEY | biteship-* | Biteship API key |

### 6.2 Biteship Configuration

| Config | Value | Notes |
|---|---|---|
| Origin postal code | 50265 | Hardcoded — Warehouse location (Semarang) |
| Weight unit | grams | Default product weight: 500g |
| Supported couriers | JNE, J&T, SiCepat, AnterAja + others | Based on Biteship availability |

---

## 7. Loyalty, Rewards & Voucher System

### 7.1 Points Earn Logic

```js
// After payment_confirmed in midtrans-webhook:
const points = Math.floor(order.total / 100000) * 10;
// Rp 100,000 = 10 pts | Rp 250,000 = 20 pts | Rp 1,000,000 = 100 pts
```

| Rule | Detail |
|---|---|
| Earn rate | 10 points per Rp 100,000 spent |
| Minimum order | Rp 100,000 (below = 0 points) |
| Expiry | 1 year from transaction date |
| Eligibility | Logged-in users only |
| Double-earn guard | Check orders.points_earned = 0 before inserting |

### 7.2 Voucher Types

| Type | How it works |
|---|---|
| percentage | Discount = subtotal × (value / 100), capped by max_discount |
| fixed | Discount = value (flat IDR amount) |

- `user_id = null` → Public voucher, anyone can use
- `user_id = uuid` → User-specific (e.g. referral reward)
- `is_used = true` → Single-use, locked after use

### 7.3 Referral System

Each `user_profiles` row has a unique `referral_code`. A `referral_uses` record is created when a new user registers with a referral code.

| Field | Meaning |
|---|---|
| voucher_given | Whether referrer received their reward voucher |
| first_purchase | Whether referred user completed their first purchase |

### 7.4 Frontend Loyalty Pages

| Page | Path | Status |
|---|---|---|
| Loyalty Dashboard | /loyalty | ✅ Live — points balance, recent activity, earn rules |
| History | /loyalty/history | ✅ Live — full points ledger |
| Rewards | /loyalty/rewards | 🟡 UI Live — redeem button disabled (Coming Soon) |
| Referral | /loyalty/referral | 🟡 UI Live — referral code display, share disabled (Coming Soon) |

---

## 8. Email System

### 8.1 Email Inventory

| Email Type | Trigger | Provider | Template |
|---|---|---|---|
| Confirm Signup | User registers | Resend via Supabase Auth | Supabase template editor |
| Reset Password | Forgot password | Resend via Supabase Auth | Supabase template editor |
| Order Received | POST midtrans-create | Resend (direct API) | buildWaitingPaymentEmail() |
| Payment Confirmed | Midtrans webhook settlement | Resend (direct API) | buildPaymentConfirmedEmail() |

### 8.2 Domain DNS (highestworld.id)

| Type | Name | Purpose | Status |
|---|---|---|---|
| TXT | resend._domainkey | DKIM signature key | ✅ Verified |
| TXT | send | SPF record | ✅ Verified |
| MX | send | Bounce handling | ✅ Verified |
| TXT | _dmarc | DMARC policy | ✅ Configured |

---

## 9. Admin System

### 9.1 Creating an Admin Account

```sql
-- Step 1: Supabase Dashboard → Authentication → Users → Add User
--         Set email + password. Copy the generated UUID.

-- Step 2: SQL Editor
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  'paste-uuid-here',
  'admin@highestworld.id',
  'Admin Name',
  'admin',
  true
);

-- To revoke access without deleting:
UPDATE admin_users SET is_active = false WHERE id = 'uuid';
```

### 9.2 Admin Features

| Page | File | Capabilities |
|---|---|---|
| Dashboard | AdminDashboard.jsx | Stats overview, recent orders, low-stock alerts (<5 units) |
| Orders | AdminOrders.jsx | Filter by status, date range, search; update status; input AWB; batch status update; batch Biteship push; export CSV |
| Products | AdminProducts.jsx | CRUD products + variants, image management, toggle active, shopee/tokopedia URL |
| Stock | AdminStock.jsx | Bulk stock updates per variant |

### 9.3 Admin Batch Operations

| Operation | Description | File |
|---|---|---|
| Batch Status Update | Multi-select orders → update status + audit log | AdminOrders.jsx + BatchDialogs.jsx |
| Batch Biteship Push | Multi-select eligible orders → push to Biteship | AdminOrders.jsx + BatchDialogs.jsx |
| Batch Print Invoice | Multi-select → print multiple invoices at once | orderActions.js |
| Batch Print AWB | Multi-select → print multiple AWB labels at once | orderActions.js |
| Export CSV | Export filtered orders to CSV | orderActions.js |

### 9.4 Admin Dialogs & Modals

| Component | Purpose |
|---|---|
| OrderDetailDialog.jsx | Full order detail view, push Biteship, print invoice/AWB |
| ProductFormModal.jsx | Add/edit product with variant management |
| EditVariantModal.jsx | Inline edit existing variant (stock, price, SKU, images) |
| BatchDialogs.jsx | Batch status update & Biteship push confirmation dialogs |
| DateRangePicker.jsx | Filter orders by date range |

---

## 10. Known Issues & Roadmap

### 10.1 Current Limitations

| Issue | Impact | Fix |
|---|---|---|
| WA transfer not saved to DB | No order record for manual transfers | Add order insert before WA redirect |
| New domain email to spam | Customers may miss emails | Domain warmup over 2–4 weeks |
| No stock reservation during checkout | Race condition on last item | Implement soft-lock RPC |
| ~Snap token expires 24h~ | ~User cannot re-pay~ | ✅ **RESOLVED** — OrderDetailPage has re-payment CTA |
| shipping_city_id hardcoded as 1 | May break Biteship integration | Pass actual city_id from Biteship search |

### 10.2 Development Roadmap

| Priority | Feature | Schema Status | Effort |
|---|---|---|---|
| 🔴 High | Shipping resi email notification | shipping_tracking ready | Low |
| 🔴 High | ~Order re-payment (expired orders)~ | ✅ **DONE** — snap_token re-use in OrderDetailPage |
| 🔴 High | Promo/voucher frontend integration | vouchers table ready | Medium |
| 🟡 Medium | ~Points redemption frontend~ | 🟡 **PARTIAL** — UI live, redeem logic pending |
| 🟡 Medium | ~Referral program frontend~ | 🟡 **PARTIAL** — UI live, share logic pending |
| 🟡 Medium | WA transfer → DB order creation | orders schema ready | Low |
| 🟢 Low | Analytics dashboard | — | High |
| 🟢 Low | SMS via Fonnte | — | Low |
| 🟢 Low | Mobile app (Capacitor) | — | High |

---

## 11. Deployment Guide

### 11.1 Frontend — Vercel

```bash
# Environment variables (Vercel Dashboard → Settings → Env Vars)
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
VITE_MIDTRANS_CLIENT_KEY=[midtrans-client-key]

# Deploy
git push origin main  # auto-deploys via Vercel Git integration
```

> **SPA Routing:** `vercel.json` includes rewrite rule `{ "source": "/(.*)", "destination": "/index.html" }` for React Router v7 client-side routing.

### 11.2 Edge Functions — Supabase CLI

```bash
# Initial setup
supabase login
supabase link --project-ref kswqsurvzbwnlsseihrk

# Deploy all functions
supabase functions deploy

# Deploy single function
supabase functions deploy midtrans-create
```

### 11.3 Set Secrets

```bash
supabase secrets set MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set FONNTE_TOKEN=xxxxx
supabase secrets set ADMIN_WA_NUMBER=628xxxxxxxxx
supabase secrets set FRONTEND_URL=https://highestworld.id
supabase secrets set BITESHIP_API_KEY=biteship-xxxxx
```

### 11.4 Post-Deployment Checklist

- [ ] Midtrans webhook URL set to: `https://[project-id].supabase.co/functions/v1/midtrans-webhook`
- [ ] Midtrans environment confirmed as **PRODUCTION** (app.midtrans.com, not sandbox)
- [ ] Google OAuth redirect URI: `https://[project-id].supabase.co/auth/v1/callback`
- [ ] Resend domain DNS records all showing **Verified**
- [ ] `admin_users` table has at least one active admin record
- [ ] Test end-to-end checkout with real Midtrans payment
- [ ] Confirm Fonnte WA notification received on test order
- [ ] Verify email to inbox (not spam) after domain warmup
- [ ] Test order re-payment from Order Detail page
- [ ] Confirm Biteship batch push works for multiple orders

---

*Technical System Documentation v1.1 — May 2026 — Internal Use Only*
