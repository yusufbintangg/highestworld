import { X } from 'lucide-react';

export const ProductFilter = ({
  categories,
  filters,
  hideSoldOut,
  badgeOptions,
  onCategoryFilter,
  onBadgeFilter,
  onHideSoldOut,
  onReset,
  onClose, // null kalau desktop
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header — mobile only */}
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
              onClick={() => onCategoryFilter('all')}
              className={`text-left text-[11px] tracking-widest uppercase transition-colors ${
                filters.category === 'all' ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
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

        {/* Badges */}
        <div className="px-6 py-5 border-b border-gray-200">
          <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-3 font-semibold">Filter</p>
          <div className="flex flex-col gap-2">
            {badgeOptions.map(badge => (
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
              onChange={e => onHideSoldOut(e.target.checked)}
            />
          </label>
        </div>
      </div>

      {/* Clear */}
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
