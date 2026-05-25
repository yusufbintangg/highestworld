import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { ProductGrid } from '../../components/product/ProductGrid';
import { ProductFilter } from '../../components/product/product-page/ProductFilter';
import { ProductSort } from '../../components/product/product-page/ProductSort';
import { Pagination } from '../../components/product/product-page/Pagination';

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
    // sort — dipakai di desktop dropdown panel
    sortOptions: SORT_OPTIONS,
    sortBy,
    onSortChange: handleSortChange,
  };

  return (
    <div className="min-h-screen bg-white text-black pb-24">

      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="mx-auto px-6 py-2 text-[10px] tracking-widest uppercase text-gray-400 flex gap-2">
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

      {/* ── DESKTOP ── */}
      <div className="hidden lg:block">

        {/* Top bar: Filter dropdown + item count */}
        <div className="border-b border-gray-200">
          <div className="px-6 flex items-center gap-6 h-12">
            <ProductFilter
              {...filterProps}
              isDropdown={true}
            />
            <span className="text-[10px] tracking-widest uppercase border-gray-400 text-gray-400">
              {loading ? 'Loading...' : `${totalCount} Items`}
            </span>
          </div>
        </div>

        {/* Product Grid — full width */}
        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-6 divide-x divide-y divide-gray-200">
              {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-50 animate-pulse" />
              ))}
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* ── MOBILE: Product Grid ── */}
      <div className="lg:hidden pt-4">
        <div className="text-[10px] px-4 tracking-widest uppercase text-gray-400 mb-3">
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