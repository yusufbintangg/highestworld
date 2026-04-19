const Label = ({ children, className = '' }) => (
  <label className={`text-xs font-medium tracking-widest uppercase ${className}`}>{children}</label>
);

const SIZE_ORDER = {
  'XS': 0,
  'S': 1,
  'M': 2,
  'L': 3,
  'XL': 4,
  '2XL': 5,
  '3XL': 6,
  '4XL': 7,
  '5XL': 8,
  '6XL': 9,
  '7XL': 10,
  '8XL': 11,
  '9XL': 12,
  '10XL': 13,
};

export const sortSizes = (sizesArray) => {
  return [...sizesArray].sort((a, b) => {
    return (SIZE_ORDER[a.size] ?? 999) - (SIZE_ORDER[b.size] ?? 999);
  });
};

export const ProductVariants = ({
  variants,
  uniqueColors,
  sizesForSelectedColor,
  selectedColor,
  selectedSize,
  currentStock,
  onColorSelect,
  onSizeSelect,
}) => {
  return (
    <div>
      {/* Size Selector */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-gray-500 text-[10px]">Size</Label>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {sizesForSelectedColor.length > 0
            ? sizesForSelectedColor.map(({ size, stock }) => (
              <button
                key={size}
                onClick={() => stock > 0 && onSizeSelect(size)}
                disabled={stock === 0}
                className={`min-w-[38px] h-8 px-2 border text-[11px] tracking-widest uppercase transition-all ${
                  selectedSize === size
                    ? 'border-black bg-black text-white'
                    : stock === 0
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                    : 'border-gray-300 text-black hover:border-black'
                }`}
              >
                {size}
              </button>
            ))
            : sortSizes(
                [...new Set(variants.map(v => v.size))].map(size => ({ size, stock: 99 }))
              ).map(({ size }) => (
                <button
                  key={size}
                  className="min-w-[38px] h-8 px-2 border border-gray-300 text-[11px] tracking-widest uppercase text-black hover:border-black transition-all"
                  onClick={() => onSizeSelect(size)}
                >
                  {size}
                </button>
              ))
          }
        </div>
      </div>

      {/* Color Selector */}
      {uniqueColors.some(c => c.name) && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-gray-500 text-[10px]">Color:</Label>
            {selectedColor && (
              <span className="text-[11px] tracking-wider uppercase font-medium">{selectedColor}</span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {uniqueColors.map((color) => (
              <button
                key={color.name}
                onClick={() => onColorSelect(color.name)}
                title={color.name}
                className={`w-6 h-6 border transition-all duration-150 ${
                  selectedColor === color.name
                    ? 'border-black ring-1 ring-black ring-offset-1'
                    : 'border-gray-300 hover:border-gray-600'
                }`}
                style={{ backgroundColor: color.hex || '#ccc' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stock info */}
      {selectedSize && (
        <div className="text-[11px] tracking-wide mb-4">
          <span className="text-gray-400">Stock: </span>
          <span className={currentStock > 0 ? 'text-black font-medium' : 'text-red-500 font-medium'}>
            {currentStock > 0 ? `${currentStock} pcs` : 'Habis'}
          </span>
        </div>
      )}
    </div>
  );
};
