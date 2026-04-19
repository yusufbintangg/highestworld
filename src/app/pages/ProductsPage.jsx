import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilter } from '../components/product/product-page/ProductFilter';
import { ProductSort } from '../components/product/product-page/ProductSort';
import { Pagination } from '../components/product/product-page/Pagination';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'New Arrivals' },
  { value: 'price-low',  label: 'Low - Price' },
  { value: 'price-high', label: 'High - Price' },
];

const BADGE_OPTIONS = [
  { value: 'New',         label: 'New Arrivals' },
  { value: 'Best Seller', label: 'Best Seller' },
  { value: 'Sale',        label: 'On Sale' },
];

export const ProductsPage = () => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const {
    products, categories, loading,
    totalCount, totalPages, currentPage, PRODUCTS_PER_PAGE,
    sortBy, hideSoldOut, filters, hasActiveFilters,
    handleCategoryFilter, handleBadgeFilter,
    handleSortChange, handleHideSoldOut,
    handlePageChange, resetFilters,
  } = useProducts();

  const filterProps = {
    categories,
    filters,
    hideSoldOut,
    badgeOptions: BADGE_OPTIONS,
    onCategoryFilter: handleCategoryFilter,
    onBadgeFilter: handleBadgeFilter,
    onHideSoldOut: handleHideSoldOut,
    onReset: resetFilters,
  };

  return (
    <div className="min-h-screen bg-white text-black pb-24">

      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-2 text-[10px] tracking-widest uppercase text-gray-400 flex gap-2">
          <span>Top</span><span>/</span>
          <span className="text-black font-semibold">Online Store</span>
        </div>
      </div>

      {/* ── MOBILE: Filter + Sort bar ── */}
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

      {/* Mobile Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 lg:hidden bg-white flex flex-col">
          <ProductFilter {...filterProps} onClose={() => setShowFilterModal(false)} />
        </div>
      )}

      {/* Mobile Sort Modal */}
      {showSortModal && (
        <ProductSort
          isMobile
          sortBy={sortBy}
          sortOptions={SORT_OPTIONS}
          onSortChange={handleSortChange}
          onClose={() => setShowSortModal(false)}
        />
      )}

      {/* ── DESKTOP: Sidebar + Main ── */}
      <div className="hidden lg:flex max-w-[1400px] mx-auto">

        {/* Sidebar filter — sticky */}
        <aside className="w-56 flex-shrink-0 border-r border-gray-200 sticky top-16 self-start h-[calc(100vh-64px)] overflow-y-auto">
          <ProductFilter {...filterProps} onClose={null} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Top bar: count + sort */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <p className="text-[10px] tracking-widest uppercase text-gray-400">
              {loading
                ? 'Loading...'
                : `${totalCount} Products`
              }
            </p>
            <ProductSort
              sortBy={sortBy}
              sortOptions={SORT_OPTIONS}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Product Grid */}
          <div className="px-4">
            {loading ? (
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-[2px] pt-[2px]">
                {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <ProductGrid products={products} />
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* ── MOBILE: Product Grid ── */}
      <div className="lg:hidden px-4 pt-4">
        <div className="text-[10px] tracking-widest uppercase text-gray-400 mb-3">
          {loading ? 'Loading...' : `${totalCount} Products`}
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-[2px]">
            {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

    </div>
  );
};
