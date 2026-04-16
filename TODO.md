# CATEGORY FILTERING FIX - Home → ProductsPage

**Status:** [PLANNING] ⏳

## 🔍 Information Gathered:
- **HomePage.jsx**: Categories link ke `/produk?category=${cat.slug}` ✅
  ```
  <Link to={`/produk?category=${cat.slug}`}>
  ```
- **ProductsPage.jsx**: `useEffect` **TIDAK** read URL params → filter state `filters.category = 'all'` default ❌
- **Categories data**: `src/data/categories.js` + Supabase `categories.slug`
- **Filter logic**: `result.filter(p => p.categories?.slug === filters.category)`

## 🛠️ Plan:

### 1. **ProductsPage.jsx** - Read URL params on mount
```jsx
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const categorySlug = urlParams.get('category');
  if (categorySlug && categorySlug !== 'all') {
    setFilters(prev => ({ ...prev, category: categorySlug }));
  }
}, []);
```

### 2. **Update URL** saat user pilih category lain (desktop/mobile filter)
```jsx
const handleCategoryFilter = (slug) => {
  setFilters(prev => ({ ...prev, category: slug }));
  // Update URL tanpa reload
  const url = new URL(window.location);
  if (slug === 'all') {
    url.searchParams.delete('category');
  } else {
    url.searchParams.set('category', slug);
  }
  window.history.replaceState({}, '', url);
};
```

### 3. **Breadcrumb** show active category
```
Online Store > Atasan (kalo category=atasan)
```

### 4. **SEO**: `<title>` + meta description sesuai category

## 📁 Dependent Files:
```
✅ src/app/pages/HomePage.jsx (sudah pass category slug)
🔄 src/app/pages/ProductsPage.jsx (add URL params logic)
🔄 src/app/pages/CollectionsPage.jsx (kalau ada link dari situ)
```

## ✅ Followup Steps:
```
1. pnpm dev
2. Home → klik "Atasan" → ProductsPage filter Atasan only  
3. Test mobile + desktop
4. Clear filter → back to all products
```

**Approve plan ini bro? Siap edit files! 💪**

