import { formatPrice } from '../../../../lib/utils';

export const ProductInfo = ({ product, activePrice, activeOriginalPrice, discount }) => {
  return (
    <div>
      {/* Category */}
      {product.categories?.name && (
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1">
          {product.categories.name}
        </p>
      )}

      {/* Product Name */}
      <div className="mb-4">
        <h1 className="text-sm font-futura tracking-[0.12em] uppercase leading-snug text-black">
          {product.name}
        </h1>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-sm font-medium text-[#7a6a00] tracking-wide">
          {formatPrice(activePrice)}
        </span>
        {activeOriginalPrice && activeOriginalPrice !== activePrice && (
          <span className="text-xs text-gray-400 line-through">
            {formatPrice(activeOriginalPrice)}
          </span>
        )}
        {discount > 0 && (
          <span className="text-xs text-red-500 font-medium">-{discount}%</span>
        )}
      </div>

      <div className="border-t border-gray-200 mb-5" />
    </div>
  );
};
