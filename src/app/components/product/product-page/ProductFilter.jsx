import { X, ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const FilterDropdown = ({
  categories,
  filters,
  hideSoldOut,
  badgeOptions,
  onCategoryFilter,
  onBadgeFilter,
  onHideSoldOut,
  onReset,
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-gray-500 hover:text-black transition-colors group"
      >
        {currentLabel}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform group-hover:-rotate-180 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-200 min-w-[200px] shadow-sm rounded-md overflow-hidden">
            
            {/* Categories */}
            <div>
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <p className="text-[10px] tracking-widest uppercase text-gray-500 mb-1">Categories</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    onCategoryFilter('all');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-[11px] tracking-widest uppercase transition-colors flex items-center gap-2 hover:bg-gray-50"
                >
                  {filters.category === 'all' && <Check className="w-4 h-4 text-black" />}
                  <span className={filters.category === 'all' ? 'font-bold text-black' : 'text-gray-500'}>
                    All Categories
                  </span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onCategoryFilter(cat.slug);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-[11px] tracking-widest uppercase transition-colors flex items-center gap-2 hover:bg-gray-50"
                  >
                    {filters.category === cat.slug && <Check className="w-4 h-4 text-black" />}
                    <span className={filters.category === cat.slug ? 'font-bold text-black' : 'text-gray-500'}>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div>
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <p className="text-[10px] tracking-widest uppercase text-gray-500 mb-1">Tags</p>
              </div>
              <div className="py-1">
                {badgeOptions.map((badge) => (
                  <button
                    key={badge.value}
                    onClick={() => onBadgeFilter(badge.value, !filters.badges.includes(badge.value))}
                    className="w-full text-left px-4 py-3 text-[11px] tracking-widest uppercase transition-colors flex items-center gap-2 hover:bg-gray-50"
                  >
                    {filters.badges.includes(badge.value) && <Check className="w-4 h-4 text-black" />}
                    <span className={filters.badges.includes(badge.value) ? 'font-bold text-black' : 'text-gray-500'}>
                      {badge.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hide Sold Out & Clear */}
            <div className="border-t border-gray-200">
              <div className="px-4 py-3 hover:bg-gray-50">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[11px] tracking-widest uppercase text-gray-500">
                    Hide Sold Out
                  </span>
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-black cursor-pointer"
                    checked={hideSoldOut}
                    onChange={(e) => {
                      onHideSoldOut(e.target.checked);
                    }}
                  />
                </label>
              </div>
              <button
                onClick={() => {
                  onReset();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-[11px] tracking-widest uppercase text-gray-400 hover:text-black hover:bg-gray-50 border-t border-gray-200 font-semibold transition-colors"
              >
                Clear ({activeCount})
              </button>
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
        />
      </div>
    );
  }

  // Original sidebar/mobile modal (unchanged)
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
                onClick={() => {
                  onCategoryFilter(cat.slug);
                  onClose?.();
                }}
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
          onClick={() => {
            onReset();
            onClose?.();
          }}
          className="w-full text-[11px] tracking-widest uppercase text-center text-gray-400 hover:text-black transition-colors border border-gray-200 py-3 hover:border-black"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

