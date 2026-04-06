import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ProductGrid } from '../components/product/ProductGrid';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    category: 'all',
    badges: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: catsData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      const { data: prodsData } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('is_active', true);

      if (catsData) setCategories(catsData);
      if (prodsData) setProducts(prodsData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (filters.category !== 'all') {
      result = result.filter(p => p.categories?.slug === filters.category);
    }

    if (filters.badges.length > 0) {
      result = result.filter(p =>
        filters.badges.every(badge => p.badges?.includes(badge))
      );
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }

    return result;
  }, [products, filters, sortBy]);

  const handleCategoryFilter = (categorySlug) => {
    setFilters(prev => ({ ...prev, category: categorySlug }));
  };

  const handleBadgeFilter = (badge, checked) => {
    setFilters(prev => ({
      ...prev,
      badges: checked
        ? [...prev.badges, badge]
        : prev.badges.filter(b => b !== badge)
    }));
  };

  const resetFilters = () => {
    setFilters({ category: 'all', badges: [] });
  };

  const badgeOptions = [
    { value: 'New', label: 'New Arrivals' },
    { value: 'Best Seller', label: 'Best Seller' },
    { value: 'Sale', label: 'On Sale' },
  ];

  return (
    <div className="min-h-screen bg-white text-black pt-16 pb-24">

      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-2 text-[10px] tracking-widest uppercase text-gray-400 flex gap-2">
          <span>Top</span>
          <span>/</span>
          <span className="text-black font-semibold">Online Store</span>
        </div>
      </div>

      {/* Filter Bar — 3 kolom bordered, persis Neighborhood */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-gray-200">

          {/* Kolom 1: Categories */}
          <div className="px-6 py-5 flex flex-col gap-2">
            <button
              onClick={() => handleCategoryFilter('all')}
              className={`text-left text-[11px] tracking-widest uppercase transition-colors ${
                filters.category === 'all' ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryFilter(cat.slug)}
                className={`text-left text-[11px] tracking-widest uppercase transition-colors ${
                  filters.category === cat.slug ? 'text-black font-boldtext-gray-400 hover:text-black' : 'text-gray-400 hover:text-black'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Kolom 2: Sort */}
          <div className="px-6 py-5 flex flex-col gap-2">
            {[
              { value: 'newest', label: 'New Arrivals' },
              { value: 'price-low', label: 'Low - Price' },
              { value: 'price-high', label: 'High - Price' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`text-left text-[11px] tracking-widest uppercase transition-colors ${
                  sortBy === opt.value ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Kolom 3: Badges + Hide Sold Out + Clear */}
          <div className="px-6 py-5 flex flex-col gap-2 relative">
            {badgeOptions.map((badge) => (
              <button
                key={badge.value}
                onClick={() => handleBadgeFilter(badge.value, !filters.badges.includes(badge.value))}
                className={`text-left text-[11px] tracking-widest uppercase transition-colors ${
                  filters.badges.includes(badge.value) ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
                }`}
              >
                {badge.label}
              </button>
            ))}

            {/* Separator kecil */}
            <div className="border-t border-gray-200 my-1" />

            {/* Hide Sold Out toggle */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <span className="text-[11px] tracking-widest uppercase text-gray-400 group-hover:text-black transition-colors">
                Hide Sold Out
              </span>
              <input
                type="checkbox"
                className="w-3 h-3 border border-gray-300 accent-black cursor-pointer"
                onChange={(e) => handleBadgeFilter('InStock', e.target.checked)}
                checked={filters.badges.includes('InStock')}
              />
            </label>

            {/* Clear — pojok kanan bawah */}
            <button
              onClick={resetFilters}
              className="absolute bottom-5 right-6 text-[11px] tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
            >
              Clear
            </button>
          </div>

        </div>
      </div>

      {/* Product Count */}
      <div className="max-w-[1400px] mx-auto px-6 pt-4 pb-3">
        <p className="text-[10px] tracking-widest uppercase text-gray-400">
          {loading ? 'Loading...' : `${filteredAndSortedProducts.length} Products`}
        </p>
      </div>

      {/* Product Grid */}
      <div className="max-w-[1400px] mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[2px]">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <ProductGrid products={filteredAndSortedProducts} />
        )}
      </div>

    </div>
  );
};