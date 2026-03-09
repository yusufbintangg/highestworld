# 📁 FOLDER STRUCTURE VISUALIZATION

```
E-Commerce Bigsize Fashion/
├── 📄 Root Files
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── postcss.config.mjs
│   ├── README.md
│   ├── ATTRIBUTIONS.md
│   └── DOCUMENTATION.md
│
├── 📁 guidelines/
│   └── Guidelines.md
│
└── 📁 src/
    ├── main.tsx
    │
    ├── 📁 app/
    │   ├── App.tsx
    │   ├── Layout.jsx
    │   ├── routes.jsx
    │   │
    │   ├── 📁 components/
    │   │   ├── 📁 figma/
    │   │   │   └── ImageWithFallback.tsx
    │   │   │
    │   │   ├── 📁 layout/
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── Footer.jsx
    │   │   │   └── ThemeToggle.jsx
    │   │   │
    │   │   ├── 📁 product/
    │   │   │   ├── ProductCard.jsx
    │   │   │   ├── ProductGrid.jsx
    │   │   │   ├── ColorSelector.jsx
    │   │   │   └── SizeSelector.jsx
    │   │   │
    │   │   ├── 📁 shared/
    │   │   │   ├── CartDrawer.jsx
    │   │   │   ├── BackToTop.jsx
    │   │   │   └── WhatsAppFloat.jsx
    │   │   │
    │   │   └── 📁 ui/  ⚡ 50+ shadcn/ui components
    │   │       ├── button.tsx
    │   │       ├── card.tsx
    │   │       ├── dialog.tsx
    │   │       ├── drawer.tsx
    │   │       ├── dropdown-menu.tsx
    │   │       ├── sheet.tsx
    │   │       ├── carousel.tsx
    │   │       ├── tabs.tsx
    │   │       ├── accordion.tsx
    │   │       ├── popover.tsx
    │   │       ├── tooltip.tsx
    │   │       ├── select.tsx
    │   │       ├── input.tsx
    │   │       ├── checkbox.tsx
    │   │       ├── radio-group.tsx
    │   │       ├── switch.tsx
    │   │       ├── slider.tsx
    │   │       ├── progress.tsx
    │   │       ├── badge.tsx
    │   │       ├── avatar.tsx
    │   │       ├── skeleton.tsx
    │   │       ├── table.tsx
    │   │       ├── separator.tsx
    │   │       ├── scroll-area.tsx
    │   │       ├── pagination.tsx
    │   │       ├── label.tsx
    │   │       ├── textarea.tsx
    │   │       ├── alert.tsx
    │   │       ├── alert-dialog.tsx
    │   │       ├── collapsible.tsx
    │   │       ├── context-menu.tsx
    │   │       ├── hover-card.tsx
    │   │       ├── menubar.tsx
    │   │       ├── navigation-menu.tsx
    │   │       ├── toggle.tsx
    │   │       ├── toggle-group.tsx
    │   │       ├── form.tsx
    │   │       ├── aspect-ratio.tsx
    │   │       ├── calendar.tsx
    │   │       ├── command.tsx
    │   │       ├── input-otp.tsx
    │   │       ├── resizable.tsx
    │   │       ├── sidebar.tsx
    │   │       ├── sonner.tsx
    │   │       ├── chart.tsx
    │   │       ├── utils.ts
    │   │       └── use-mobile.ts
    │   │
    │   └── 📁 pages/
    │       ├── HomePage.jsx
    │       ├── ProductsPage.jsx
    │       ├── ProductDetailPage.jsx
    │       ├── CollectionsPage.jsx
    │       ├── CollectionDetailPage.jsx
    │       ├── AboutPage.jsx
    │       ├── ContactPage.jsx
    │       ├── PaymentConfirmationPage.jsx
    │       └── NotFoundPage.jsx
    │
    ├── 📁 context/
    │   └── CartContext.jsx
    │
    ├── 📁 data/
    │   ├── categories.js
    │   └── products.js
    │
    ├── 📁 lib/
    │   ├── config.js
    │   └── utils.js
    │
    └── 📁 styles/
        ├── fonts.css
        ├── theme.css
        ├── tailwind.css
        └── index.css
```

---

## 📊 Visual Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJECT STRUCTURE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📁 Root (8 files)                                          │
│     │                                                        │
│     ├── 📁 guidelines/ (1 file)                             │
│     │                                                        │
│     └── 📁 src/ (6 subfolders)                              │
│          │                                                  │
│          ├── 📁 app/                                        │
│          │    ├── 🟢 components/ (5 folders)                │
│          │    │    ├── figma/                               │
│          │    │    ├── layout/ (3 files)                    │
│          │    │    ├── product/ (4 files)                    │
│          │    │    ├── shared/ (3 files)                    │
│          │    │    └── ui/ (50+ files) ⚡                   │
│          │    │                                             │
│          │    └── 📁 pages/ (9 files)                       │
│          │                                                  │
│          ├── 📁 context/ (1 file)                           │
│          ├── 📁 data/ (2 files)                             │
│          ├── 📁 lib/ (2 files)                             │
│          └── 📁 styles/ (4 files)                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Files Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        ENTRY POINT                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   index.html ──▶ main.tsx ──▶ App.tsx ──▶ Layout.jsx           │
│                           │              │                       │
│                           │              ├──▶ Navbar.jsx        │
│                           │              │                       │
│                           │              ├──▶ <Outlet />        │
│                           │              │   (Routes)            │
│                           │              │                       │
│                           │              └──▶ Footer.jsx         │
│                           │                                        │
│                           └──▶ CartContext (Provider)           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛣️ Routes Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ROUTES STRUCTURE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   /  ──────────▶  HomePage                                  │
│   │                                                      │
│   ├── produk ─────────▶ ProductsPage (all products)       │
│   │    │                                                    │
│   │    └── :slug ───▶ ProductDetailPage                    │
│   │                                                      │
│   ├── koleksi ───────▶ CollectionsPage                      │
│   │    │                                                    │
│   │    └── :slug ───▶ CollectionDetailPage                 │
│   │                                                      │
│   ├── tentang ───────▶ AboutPage                           │
│   │                                                      │
│   ├── kontak ────────▶ ContactPage                         │
│   │                                                      │
│   ├── konfirmasi-pembayaran ──▶ PaymentConfirmationPage    │
│   │                                                      │
│   └── * ────────────▶ NotFoundPage (404)                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Hierarchy

```
App
├── ThemeProvider (next-themes)
├── CartProvider
│   └── Layout
│       ├── Navbar
│       │   ├── Logo
│       │   ├── Menu Links
│       │   ├── ThemeToggle
│       │   └── CartIcon
│       │
│       ├── Routes (Outlet)
│       │   ├── HomePage
│       │   │   ├── HeroSection
│       │   │   ├── CategoryCards
│       │   │   └── FeaturedProducts
│       │   │
│       │   ├── ProductsPage
│       │   │   ├── FilterSidebar
│       │   │   └── ProductGrid
│       │   │       └── ProductCard
│       │   │
│       │   ├── ProductDetailPage
│       │   │   ├── ImageGallery
│       │   │   ├── ProductInfo
│       │   │   ├── ColorSelector
│       │   │   ├── SizeSelector
│       │   │   └── AddToCart
│       │   │
│       │   └── ... (other pages)
│       │
│       ├── Footer
│       ├── WhatsAppFloat
│       └── BackToTop
│
└── Sonner (Toast Notifications)
```

---

## 💾 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA STRUCTURE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  categories.js          products.js                         │
│  ┌─────────────┐        ┌─────────────────────────────┐    │
│  │ 5 Categories│        │ 22 Products                 │    │
│  │             │        │                             │    │
│  │ • Atasan    │        │ • id, name, slug           │    │
│  │ • Bawahan   │        │ • price, originalPrice     │    │
│  │ • Jaket     │        │ • images[]                 │    │
│  │ • Outfit Set│        │ • colors[]                 │    │
│  │ • Aksesoris │        │ • sizes[]                  │    │
│  └─────────────┘        │ • category                 │    │
│                        │ • badges                    │    │
│                        └─────────────────────────────┘    │
│                              │                              │
│                              ▼                              │
│  config.js                                                      │
│  ┌─────────────────────────────────────────┐               │
│  │ • WHATSAPP_NUMBER                       │               │
│  │ • BANK_INFO                             │               │
│  │ • SITE_CONFIG                           │               │
│  │ • SHIPPING_INFO                         │               │
│  └─────────────────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

*This visual representation shows the complete folder structure of the Highest World E-Commerce Project*

