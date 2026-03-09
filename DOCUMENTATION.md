# 📘 DOCUMENTATION: Highest World E-Commerce Bigsize Fashion

**Version:** 1.0.0  
**Last Updated:** 2026  
**Project:** E-Commerce Fashion Bigsize Premium  
**Brand:** Highest World

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Core Components](#4-core-components)
5. [Pages & Routes](#5-pages--routes)
6. [State Management](#6-state-management)
7. [Configuration](#7-configuration)
8. [Data Structure](#8-data-structure)
9. [Styling & Theming](#9-styling--theming)
10. [Features](#10-features)

---

## 1. Project Overview

### Description

**Highest World** is a premium e-commerce website specializing in bigsize/jumbo men's fashion with a **Luxury Streetwear Prestige** aesthetic. The brand targets men who wear sizes 2XL-8XL for tops and jackets, and 36-50 for bottoms.

### Brand Philosophy

> "Highest World bukan sekadar toko pakaian bigsize. Ini adalah ekspresi bahwa pria berbadan besar berhak tampil stylish, percaya diri, dan eksklusif."

### Design Aesthetic

| Aspect | Dark Mode (Default) | Light Mode |
|--------|---------------------|------------|
| Background | `#080808` - `#161616` | `#F8F6F1` |
| Text | `#F0EDE8` | `#1A1A1A` |
| Gold Accent | `#C9A84C` | `#B8922A` |

### Typography

| Element | Font Family |
|---------|-------------|
| Display/Heading | Bebas Neue |
| Subheading/UI | Barlow Condensed |
| Body/Content | DM Sans |
| Price/Number | Space Mono |

---

## 2. Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | Core UI library |
| **React Router** | 7.13.0 | Client-side routing |
| **Vite** | 6.3.5 | Build tool & dev server |
| **Tailwind CSS** | 4.1.12 | Utility-first CSS |

### UI Components & Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| **@radix-ui/react-*** | 1.x | Accessible UI primitives |
| **shadcn/ui** | - | Pre-built components (50+) |
| **Lucide React** | 0.487.0 | Icon system |
| **Embla Carousel** | 8.6.0 | Carousel/slider |
| **Vaul** | 1.1.2 | Drawer component |
| **Sonner** | 2.0.3 | Toast notifications |
| **Motion** | 12.23.24 | Animations |
| **next-themes** | 0.4.6 | Dark/light mode |

### Form Handling

| Library | Version | Purpose |
|---------|---------|---------|
| **React Hook Form** | 7.55.0 | Form management |
| **Zod** | 4.3.6 | Schema validation |
| **@hookform/resolvers** | 5.2.2 | Zod integration |

### Additional Libraries

| Library | Purpose |
|---------|---------|
| **@mui/material** | Material UI components |
| **Recharts** | Data visualization |
| **date-fns** | Date utilities |
| **react-day-picker** | Date picker |
| **react-responsive-masonry** | Responsive grid |

---

## 3. Folder Structure

```
E-Commerce Bigsize Fashion/
├── index.html                    # Entry point
├── package.json                  # Dependencies & scripts
├── vite.config.ts               # Vite configuration
├── postcss.config.mjs           # PostCSS configuration
├── README.md                    # Project README
├── ATTRIBUTIONS.md              # Credits & attributions
│
├── guidelines/
│   └── Guidelines.md            # Brand & design guidelines
│
└── src/
    ├── main.tsx                 # React DOM entry point
    │
    ├── app/
    │   ├── App.tsx              # Root component with providers
    │   ├── Layout.jsx           # Main layout wrapper
    │   ├── routes.jsx           # React Router configuration
    │   │
    │   ├── components/
    │   │   ├── figma/
    │   │   │   └── ImageWithFallback.tsx    # Image with fallback support
    │   │   │
    │   │   ├── layout/                         # Layout components
    │   │   │   ├── Navbar.jsx                  # Main navigation
    │   │   │   ├── Footer.jsx                  # Site footer
    │   │   │   └── ThemeToggle.jsx             # Dark/light toggle
    │   │   │
    │   │   ├── product/                        # Product-related components
    │   │   │   ├── ProductCard.jsx             # Product display card
    │   │   │   ├── ProductGrid.jsx             # Grid layout for products
    │   │   │   ├── ColorSelector.jsx           # Color variant selector
    │   │   │   └── SizeSelector.jsx            # Size variant selector
    │   │   │
    │   │   ├── shared/                         # Shared/common components
    │   │   │   ├── CartDrawer.jsx              # Shopping cart drawer
    │   │   │   ├── BackToTop.jsx               # Scroll to top button
    │   │   │   └── WhatsAppFloat.jsx           # Floating WhatsApp button
    │   │   │
    │   │   └── ui/                             # shadcn/ui components (50+)
    │   │       ├── button.tsx
    │   │       ├── card.tsx
    │   │       ├── dialog.tsx
    │   │       ├── dropdown-menu.tsx
    │   │       ├── sheet.tsx
    │   │       ├── drawer.tsx
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
    │   │       ├── utils.ts                    # Utility functions
    │   │       └── use-mobile.ts               # Mobile detection hook
    │   │
    │   └── pages/                              # Page components (Routes)
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
    ├── context/
    │   └── CartContext.jsx          # Shopping cart state management
    │
    ├── data/
    │   ├── categories.js           # Category data (5 categories)
    │   └── products.js             # Product data (22 products)
    │
    ├── lib/
    │   ├── config.js               # Site configuration
    │   └── utils.js                # Helper functions
    │
    └── styles/
        ├── fonts.css               # Google Fonts imports
        ├── theme.css               # CSS variables (dark/light)
        ├── tailwind.css            # Tailwind imports
        └── index.css               # Main stylesheet
```

---

## 4. Core Components

### Layout Components

| Component | File | Description |
|-----------|------|-------------|
| Navbar | `src/app/components/layout/Navbar.jsx` | Main navigation with logo, menu, cart icon |
| Footer | `src/app/components/layout/Footer.jsx` | Site footer with links, social media, contact |
| ThemeToggle | `src/app/components/layout/ThemeToggle.jsx` | Dark/light mode switcher |

### Product Components

| Component | File | Description |
|-----------|------|-------------|
| ProductCard | `src/app/components/product/ProductCard.jsx` | Card displaying product image, name, price |
| ProductGrid | `src/app/components/product/ProductGrid.jsx` | Grid layout for multiple products |
| ColorSelector | `src/app/components/product/ColorSelector.jsx` | Visual color swatch selector |
| SizeSelector | `src/app/components/product/SizeSelector.jsx` | Size button selector with availability |

### Shared Components

| Component | File | Description |
|-----------|------|-------------|
| CartDrawer | `src/app/components/shared/CartDrawer.jsx` | Slide-out shopping cart |
| BackToTop | `src/app/components/shared/BackToTop.jsx` | Scroll to top button |
| WhatsAppFloat | `src/app/components/shared/WhatsAppFloat.jsx` | Floating WhatsApp button |

### UI Components (shadcn/ui)

The project includes 50+ pre-built UI components from shadcn/ui built on Radix UI primitives:

- **Navigation**: Tabs, Navigation Menu, Breadcrumb
- **Data Display**: Card, Table, Avatar, Badge, Skeleton
- **Forms**: Button, Input, Select, Checkbox, Radio Group, Switch, Slider, Textarea
- **Overlays**: Dialog, Drawer, Popover, Tooltip, Sheet, Alert Dialog
- **Feedback**: Alert, Toast (Sonner), Progress
- **Layout**: Accordion, Collapsible, Resizable Panels, Scroll Area
- **Media**: Carousel, Aspect Ratio

---

## 5. Pages & Routes

### Route Configuration

Routes are defined in `src/app/routes.jsx` using React Router's `createBrowserRouter`:

| Path | Component | Description |
|------|-----------|-------------|
| `/` | HomePage | Homepage with hero, categories, featured products |
| `/produk` | ProductsPage | Product listing with filters & sorting |
| `/produk/:slug` | ProductDetailPage | Product detail (TikTok Shop style) |
| `/koleksi` | CollectionsPage | Category showcase |
| `/koleksi/:slug` | CollectionDetailPage | Products by category |
| `/tentang` | AboutPage | Brand story & values |
| `/kontak` | ContactPage | Contact form + WhatsApp |
| `/konfirmasi-pembayaran` | PaymentConfirmationPage | Payment proof upload |
| `*` | NotFoundPage | 404 error page |

### Page Descriptions

| Page | Features |
|------|----------|
| **HomePage** | Hero section, category cards, featured products, testimonials |
| **ProductsPage** | Filter sidebar, sort options, grid layout, pagination |
| **ProductDetailPage** | Image gallery, color/size selector, add to cart, related products |
| **CollectionsPage** | Category grid with images and descriptions |
| **CollectionDetailPage** | Products filtered by category |
| **AboutPage** | Brand history, mission, values, team |
| **ContactPage** | Contact form, WhatsApp integration, social links |
| **PaymentConfirmationPage** | Order number input, bank transfer proof upload |
| **NotFoundPage** | Custom 404 with navigation back |

---

## 6. State Management

### Cart Context

**File:** `src/context/CartContext.jsx`

Uses React Context API for global cart state management:

```jsx
// CartContext provides:
- cartItems: Array of cart items
- addToCart(product, color, size, quantity): Add item to cart
- removeFromCart(itemId): Remove item from cart
- updateQuantity(itemId, quantity): Update item quantity
- clearCart(): Empty the cart
- getCartTotal(): Calculate total price
- getCartCount(): Get total item count
```

### Features:
- **LocalStorage Persistence**: Cart data persists across page refreshes
- **Toast Notifications**: Success messages via Sonner
- **Duplicate Handling**: Updates quantity if same product/color/size exists

---

## 7. Configuration

### Site Configuration

**File:** `src/lib/config.js`

Contains all configurable data:

| Config | Key | Description |
|--------|-----|-------------|
| WhatsApp | `WHATSAPP_NUMBER` | WhatsApp contact number |
| Bank Accounts | `BANK_INFO` | Payment bank details |
| Site Info | `SITE_CONFIG` | Name, URL, social media, contact |
| Shipping | `SHIPPING_INFO` | Free shipping threshold, couriers |

### Vite Configuration

**File:** `vite.config.ts`

Key configurations:
- React + Tailwind plugins
- Path alias: `@` → `./src`
- Asset handling for SVG, CSV

---

## 8. Data Structure

### Categories

**File:** `src/data/categories.js`

5 Main Categories:

| ID | Name | Subcategories |
|----|------|---------------|
| atasan | Atasan | Kaos Bigsize, Polo Shirt, Oversize T-Shirt, Kemeja, etc. |
| bawahan | Bawahan | Celana Panjang, Celana Pendek, Chinos, Cargo, etc. |
| jaket | Jaket & Outer | Jaket Jumbo, Windbreaker, Baseball, Varsity |
| outfit-set | Outfit Set | Formal, Olahraga, Spesial Ramadhan, Riding |
| aksesoris | Aksesoris | Topi Snapback |

### Products

**File:** `src/data/products.js`

22 dummy products with complete data:
- ID, name, slug, description
- Price, original price (for sale)
- Images array
- Colors with hex codes
- Sizes with availability
- Category association
- Badges (NEW, BEST SELLER, SALE)

---

## 9. Styling & Theming

### CSS Files

| File | Purpose |
|------|---------|
| `src/styles/fonts.css` | Google Fonts imports (Bebas Neue, Barlow Condensed, DM Sans, Space Mono) |
| `src/styles/theme.css` | CSS custom properties for dark/light themes |
| `src/styles/tailwind.css` | Tailwind CSS imports |
| `src/styles/index.css` | Main stylesheet with global styles |

### Theme Variables

```css
/* Dark Mode (Default) */
--background: #080808;
--foreground: #F0EDE8;
--accent: #C9A84C;

/* Light Mode */
--background: #F8F6F1;
--foreground: #1A1A1A;
--accent: #B8922A;
```

### Custom Features

- **Grain Texture**: SVG noise overlay for premium aesthetic
- **Gold Shimmer**: Animated gradient text effect
- **Custom Scrollbar**: Gold thumb with dark track
- **Sticky Navbar**: Backdrop blur on scroll

---

## 10. Features

### E-Commerce Features

- [x] Product catalog with 22 products
- [x] 5 main categories with subcategories
- [x] Product filtering and sorting
- [x] Color selector with visual swatches
- [x] Size selector with availability indicator
- [x] Multiple image gallery
- [x] Shopping cart with persistence
- [x] WhatsApp checkout integration
- [x] Payment confirmation page
- [x] Related products suggestions

### User Experience

- [x] Dark/Light theme toggle
- [x] Mobile-first responsive design
- [x] Smooth page transitions
- [x] Back to top button
- [x] Floating WhatsApp button
- [x] Toast notifications
- [x] Custom scrollbar styling
- [x] Grain texture overlay
- [x] Loading skeletons

### Available Sizes

| Category | Size Range |
|----------|------------|
| Tops & Jackets | 2XL, 3XL, 4XL, 5XL, 6XL, 7XL, 8XL |
| Bottoms | 36, 38, 40, 42, 44, 46, 48, 50 |

---

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Configuration Points

| File | Purpose |
|------|---------|
| `src/lib/config.js` | WhatsApp number, bank info, site config |
| `src/data/products.js` | Add/edit products |
| `src/data/categories.js` | Add/edit categories |
| `src/styles/theme.css` | Theme colors and variables |

---

## License

© 2026 Highest World. All rights reserved.

---

*This documentation was generated for the Highest World E-Commerce Project*

