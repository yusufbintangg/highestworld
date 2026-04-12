import { useState, useMemo, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ProductGrid } from '../components/product/ProductGrid';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [filters, setFilters] = useState({ category: 'all', badges: [] });

  // Mobile modals
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: catsData } = await supabase
        .from('categories').select('*').eq('is_active', true).order('name');
      const { data: prodsData } = await supabase
        .from('products').select('*, categories(name, slug)').eq('is_active', true);
      if (catsData) setCategories(catsData);
      if (prodsData) setProducts(prodsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    if (filters.category !== 'all')
      result = result.filter(p => p.categories?.slug === filters.category);
    if (filters.badges.length > 0)
      result = result.filter(p => filters.badges.every(b => p.badges?.includes(b)));
    if (hideSoldOut)
      result = result.filter(p => (p.total_stock ?? 1) > 0);
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
    }
    return result;
  }, [products, filters, sortBy, hideSoldOut]);

  const handleCategoryFilter = (slug) => {
    setFilters(prev => ({ ...prev, category: slug }));
    setShowFilterModal(false);
  };
  const handleBadgeFilter = (badge, checked) => setFilters(prev => ({
    ...prev,
    badges: checked ? [...prev.badges, badge] : prev.badges.filter(b => b !== badge)
  }));
  const resetFilters = () => { setFilters({ category: 'all', badges: [] }); setHideSoldOut(false); };

  const sortOptions = [
    { value: 'newest',     label: 'New Arrivals' },
    { value: 'price-low',  label: 'Low - Price' },
    { value: 'price-high', label: 'High - Price' },
  ];
  const badgeOptions = [
    { value: 'New',         label: 'New Arrivals' },
    { value: 'Best Seller', label: 'Best Seller' },
    { value: 'Sale',        label: 'On Sale' },
  ];
  const hasActiveFilters = filters.category !== 'all' || filters.badges.length > 0 || hideSoldOut;
  const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label || 'Sort';

  /* ─── Shared Filter Panel content ──────────────────────────────── */
  const FilterContent = ({ onClose }) => (
    <div className="flex flex-col h-full">
      {/* Header (mobile only — desktop ga pake ini) */}
      {onClose && (
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <span className="text-[13px] tracking-widest uppercase font-bold">Filter</span>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Categories */}
        <div className="px-6 py-5 border-b border-gray-200">
          <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-3 font-semibold">Categories</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleCategoryFilter('all')}
              className={`text-left text-[11px] tracking-widest uppercase transition-colors ${
                filters.category === 'all' ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryFilter(cat.slug)}
                className={`text-left text-[11px] tracking-widest uppercase transition-colors ${
                  filters.category === cat.slug ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="px-6 py-5 border-b border-gray-200">
          <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-3 font-semibold">Filter</p>
          <div className="flex flex-col gap-2">
            {badgeOptions.map(badge => (
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
          </div>
        </div>

        {/* Hide Sold Out */}
        <div className="px-6 py-5 border-b border-gray-200">
          <label className="flex items-center justify-between cursor-pointer">
            <span className={`text-[11px] tracking-widest uppercase transition-colors ${
              hideSoldOut ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
            }`}>
              Hide Sold Out
            </span>
            <input
              type="checkbox"
              className="w-3.5 h-3.5 accent-black cursor-pointer"
              checked={hideSoldOut}
              onChange={e => setHideSoldOut(e.target.checked)}
            />
          </label>
        </div>
      </div>

      {/* Clear */}
      <div className="px-6 py-5">
        <button
          onClick={() => { resetFilters(); onClose?.(); }}
          className="w-full text-[11px] tracking-widest uppercase text-center text-gray-400 hover:text-black transition-colors border border-gray-200 py-3 hover:border-black"
        >
          Clear
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black pb-24">

      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-2 text-[10px] tracking-widest uppercase text-gray-400 flex gap-2">
          <span>Top</span><span>/</span>
          <span className="text-black font-semibold">Online Store</span>
        </div>
      </div>

      {/* ─── MOBILE: FILTER + SORT bar ─────────────────────────────── */}
      <div className="lg:hidden border-b border-gray-200 grid grid-cols-2 divide-x divide-gray-200">
        <button
          onClick={() => setShowFilterModal(true)}
          className={`py-4 text-[11px] tracking-widest uppercase font-semibold text-center transition-colors ${
            hasActiveFilters ? 'text-black' : 'text-gray-500'
          }`}
        >
          Filter {hasActiveFilters && '·'}
        </button>
        <button
          onClick={() => setShowSortModal(true)}
          className="py-4 text-[11px] tracking-widest uppercase font-semibold text-center text-gray-500"
        >
          Sort
        </button>
      </div>

      {/* ─── MOBILE FILTER MODAL ───────────────────────────────────── */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 lg:hidden bg-white flex flex-col">
          <FilterContent onClose={() => setShowFilterModal(false)} />
        </div>
      )}

      {/* ─── MOBILE SORT MODAL ─────────────────────────────────────── */}
      {showSortModal && (
        <div className="fixed inset-0 z-50 lg:hidden bg-white flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <span className="text-[13px] tracking-widest uppercase font-bold">Sort</span>
            <button onClick={() => setShowSortModal(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 px-6 py-5 flex flex-col gap-3">
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setSortBy(opt.value); setShowSortModal(false); }}
                className={`text-left text-[11px] tracking-widest uppercase transition-colors ${
                  sortBy === opt.value ? 'text-black font-bold' : 'text-gray-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── DESKTOP: sidebar + main ───────────────────────────────── */}
      <div className="hidden lg:flex max-w-[1400px] mx-auto">

        {/* Sidebar filter — sticky */}
        <aside className="w-56 flex-shrink-0 border-r border-gray-200 sticky top-16 self-start h-[calc(100vh-64px)] overflow-y-auto">
          <FilterContent onClose={null} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Top bar: count + sort dropdown */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <p className="text-[10px] tracking-widest uppercase text-gray-400">
              {loading ? 'Loading...' : `${filteredAndSortedProducts.length} Products`}
            </p>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(prev => !prev)}
                className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-gray-500 hover:text-black transition-colors"
              >
                {currentSortLabel}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-200 min-w-[160px] shadow-sm">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-[11px] tracking-widest uppercase transition-colors ${
                          sortBy === opt.value
                            ? 'text-black font-bold bg-gray-50'
                            : 'text-gray-400 hover:text-black hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="px-4">
            {loading ? (
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-[2px] pt-[2px]">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <ProductGrid products={filteredAndSortedProducts} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Product Grid */}
      <div className="lg:hidden px-4 pt-4">
        <div className="text-[10px] tracking-widest uppercase text-gray-400 mb-3">
          {loading ? 'Loading...' : `${filteredAndSortedProducts.length} Products`}
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-[2px]">
            {[...Array(8)].map((_, i) => (
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