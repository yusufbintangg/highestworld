import { X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const FilterDropdown = ({
  categories,
  filters,
  hideSoldOut,
  badgeOptions,
  onCategoryFilter,
  onBadgeFilter,
  onHideSoldOut,
  onReset,
  sortOptions,
  sortBy,
  onSortChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = filters.badges.length + (filters.category !== 'all' ? 1 : 0);
  const currentLabel = activeCount > 0 ? `Filter · ${activeCount}` : 'Filter';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-filter-dropdown]')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div data-filter-dropdown className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-gray-500 hover:text-black transition-colors"
      >
        {currentLabel}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Full-width panel — posisi fixed di bawah top bar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel — full width, attached ke bawah top bar */}
          <div
            className="fixed left-0 right-0 z-30 bg-white border-b border-gray-200"
            style={{ top: 'var(--filter-panel-top, 89px)' }}
          >
            <div className="grid grid-cols-3 divide-x divide-gray-200">

              {/* Col 1: Categories */}
              <div className="py-6 px-8">
                <button
                  onClick={() => { onCategoryFilter('all'); setIsOpen(false); }}
                  className={`block text-left w-full text-[11px] tracking-widest uppercase mb-3 transition-colors ${
                    filters.category === 'all' ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { onCategoryFilter(cat.slug); setIsOpen(false); }}
                    className={`block text-left w-full text-[11px] tracking-widest uppercase mb-3 transition-colors ${
                      filters.category === cat.slug ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Col 2: Sort */}
              <div className="py-6 px-8">
                {sortOptions?.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { onSortChange(opt.value); setIsOpen(false); }}
                    className={`block text-left w-full text-[11px] tracking-widest uppercase mb-3 transition-colors ${
                      sortBy === opt.value ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Col 3: Hide Sold Out + Clear */}
              <div className="py-6 px-8 flex flex-col justify-between">
                <div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <span className={`text-[11px] tracking-widest uppercase transition-colors ${
                      hideSoldOut ? 'text-black font-bold' : 'text-gray-400 group-hover:text-black'
                    }`}>
                      Hide Sold Out
                    </span>
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 accent-black cursor-pointer"
                      checked={hideSoldOut}
                      onChange={(e) => onHideSoldOut(e.target.checked)}
                    />
                  </label>
                </div>

                {/* Clear — pojok kanan bawah */}
                <div className="flex justify-end">
                  <button
                    onClick={() => { onReset(); setIsOpen(false); }}
                    className="text-[11px] tracking-widest uppercase text-gray-400 hover:text-black transition-colors font-semibold"
                  >
                    Clear
                  </button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const ProductFilter = ({
  isDropdown,
  className = "",
  categories,
  filters,
  hideSoldOut,
  badgeOptions,
  onCategoryFilter,
  onBadgeFilter,
  onHideSoldOut,
  onReset,
  onClose,
  // sort props — hanya dipakai di desktop dropdown
  sortOptions,
  sortBy,
  onSortChange,
}) => {
  if (isDropdown) {
    return (
      <div className={className}>
        <FilterDropdown
          categories={categories}
          filters={filters}
          hideSoldOut={hideSoldOut}
          badgeOptions={badgeOptions}
          onCategoryFilter={onCategoryFilter}
          onBadgeFilter={onBadgeFilter}
          onHideSoldOut={onHideSoldOut}
          onReset={onReset}
          sortOptions={sortOptions}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      </div>
    );
  }

  // Mobile modal — unchanged
  return (
    <div className="flex flex-col h-full">
      {onClose && (
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <span className="text-[13px] tracking-widest uppercase font-bold">Filter</span>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-200">
          <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-3 font-semibold">Categories</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onCategoryFilter('all')}
              className={`text-left text-[11px] tracking-widest uppercase transition-colors ${
                filters.category === 'all' ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { onCategoryFilter(cat.slug); onClose?.(); }}
                className={`text-left text-[11px] tracking-widest uppercase transition-colors ${
                  filters.category === cat.slug ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 border-b border-gray-200">
          <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-3 font-semibold">Filter</p>
          <div className="flex flex-col gap-2">
            {badgeOptions.map((badge) => (
              <button
                key={badge.value}
                onClick={() => onBadgeFilter(badge.value, !filters.badges.includes(badge.value))}
                className={`text-left text-[11px] tracking-widest uppercase transition-colors ${
                  filters.badges.includes(badge.value) ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
                }`}
              >
                {badge.label}
              </button>
            ))}
          </div>
        </div>

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
              onChange={(e) => onHideSoldOut(e.target.checked)}
            />
          </label>
        </div>
      </div>

      <div className="px-6 py-5">
        <button
          onClick={() => { onReset(); onClose?.(); }}
          className="w-full text-[11px] tracking-widest uppercase text-center text-gray-400 hover:text-black transition-colors border border-gray-200 py-3 hover:border-black"
        >
          Clear
        </button>
      </div>
    </div>
  );
};