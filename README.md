# HIGHEST WORLD — E-Commerce Fashion Bigsize Premium

Website e-commerce fashion premium untuk pakaian bigsize/jumbo pria dengan positioning brand yang eksklusif, prestisius, dan modern.

## 🎨 Design Aesthetic

**Luxury Streetwear Prestige** — Terinspirasi dari brand fashion eksklusif dengan sentuhan dark premium. Dark mode sebagai default dengan gold accent (#C9A84C) yang dominan.

### Palet Warna

**Dark Mode (Default)**
- Background: #080808 - #161616
- Text: #F0EDE8
- Gold Accent: #C9A84C
- Grain texture overlay untuk kesan premium

**Light Mode**
- Background: #F8F6F1 (Warm cream)
- Gold Accent: #B8922A

### Typography
- **Display/Heading**: Bebas Neue
- **Subheading/UI**: Barlow Condensed
- **Body/Content**: DM Sans
- **Price/Number**: Space Mono (monospace)

## 🛠️ Tech Stack

- **React** with React Router 7
- **Tailwind CSS** v4
- **shadcn/ui** components
- **Motion** (Framer Motion) untuk animasi
- **next-themes** untuk dark/light toggle
- **React Hook Form + Zod** untuk validasi form
- **Sonner** untuk toast notifications
- **Lucide React** untuk icons

## 📦 Fitur Utama

### 1. Product Management
- 22 produk dummy dengan data lengkap
- 5 kategori utama: Atasan, Bawahan, Jaket & Outer, Outfit Set, Aksesoris
- Color selector dengan swatch visual
- Size selector dengan availability indicator
- Image gallery dengan multiple photos

### 2. E-Commerce Features
- Filter & sort produk
- Shopping cart dengan local storage persistence
- WhatsApp integration untuk checkout
- Product detail TikTok Shop style layout
- Related products suggestion

### 3. User Experience
- Dark/Light theme toggle
- Responsive mobile-first design
- Smooth page transitions dengan Motion
- Back to top button
- WhatsApp floating button
- Toast notifications
- Custom scrollbar dengan gold accent
- Grain texture overlay

### 4. Pages
- **Homepage**: Hero, Categories, Featured Products, Testimonials
- **Products**: Filter sidebar, sort, grid layout
- **Product Detail**: TikTok Shop style dengan sticky info panel
- **Collections**: Category showcase
- **About**: Brand story & values
- **Contact**: Contact form dengan WhatsApp integration
- **Payment Confirmation**: Upload bukti transfer
- **404**: Custom not found page

## 🗂️ Struktur Folder

```
src/
├── app/
│   ├── components/
│   │   ├── layout/          # Navbar, Footer, ThemeToggle
│   │   ├── product/         # ProductCard, ColorSelector, SizeSelector
│   │   ├── shared/          # CartDrawer, BackToTop, WhatsAppFloat
│   │   └── ui/              # shadcn components
│   ├── pages/               # All route pages
│   ├── App.tsx              # Main app with providers
│   ├── Layout.jsx           # Layout wrapper
│   └── routes.jsx           # React Router config
├── context/
│   └── CartContext.jsx      # Shopping cart state
├── data/
│   ├── categories.js        # Category data
│   └── products.js          # 22 products data
├── lib/
│   ├── config.js            # WhatsApp, bank info, site config
│   └── utils.js             # Helper functions
└── styles/
    ├── fonts.css            # Google Fonts import
    ├── theme.css            # Dark/Light theme variables
    └── tailwind.css         # Tailwind imports
```

## 💬 WhatsApp Integration

Semua checkout dan inquiry diarahkan ke WhatsApp dengan format pesan terstruktur:
- Product order dengan detail produk
- Cart checkout dengan list produk
- Payment confirmation dengan detail transfer
- General inquiry untuk kontak

**Nomor WhatsApp**: Dapat diubah di `/src/lib/config.js`

## 🎯 Brand Philosophy

Highest World bukan sekadar toko pakaian bigsize. Ini adalah ekspresi bahwa pria berbadan besar berhak tampil stylish, percaya diri, dan eksklusif.

**Ukuran**: 2XL - 8XL untuk atasan dan jaket, 36-50 untuk bawahan

## 🚀 Cara Menggunakan

1. Semua konfigurasi WhatsApp dan bank ada di `/src/lib/config.js`
2. Product data di `/src/data/products.js` - tambahkan atau edit sesuai kebutuhan
3. Theme variables di `/src/styles/theme.css`
4. Default theme adalah **dark mode**

## 📱 Responsive

- Mobile-first approach
- Breakpoints: sm (640), md (768), lg (1024), xl (1280), 2xl (1536)
- Mobile: Hamburger menu, filter drawer, swipeable gallery
- Desktop: Mega menu, sidebar filter, sticky product info

## 🎨 Custom Features

- **Grain Texture**: SVG noise overlay untuk aesthetic film photography
- **Gold Shimmer**: Animated gradient text effect
- **Custom Scrollbar**: Gold thumb dengan dark track
- **Sticky Navbar**: Backdrop blur saat scroll
- **Product Badges**: NEW, BEST SELLER, SALE
- **Toast Notifications**: Success, error, info messages

---

© 2026 Highest World. All rights reserved.
