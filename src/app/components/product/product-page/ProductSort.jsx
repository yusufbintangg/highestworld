import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export const ProductSort = ({ sortBy, sortOptions, onSortChange, isMobile = false, onClose }) => {
  const [sortOpen, setSortOpen] = useState(false);
  const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label || 'Sort';

  // Mobile: full screen modal content
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 lg:hidden bg-white flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <span className="text-[13px] tracking-widest uppercase font-bold">Sort</span>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 px-6 py-5 flex flex-col gap-3">
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onSortChange(opt.value); onClose(); }}
              className={`text-left text-[11px] tracking-widest uppercase transition-colors ${
                sortBy === opt.value ? 'text-black font-bold' : 'text-gray-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Desktop: dropdown
  return (
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
          <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-200 min-w-[160px] shadow-sm">
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onSortChange(opt.value); setSortOpen(false); }}
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
  );
};
