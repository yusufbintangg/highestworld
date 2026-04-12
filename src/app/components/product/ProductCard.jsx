import { useState } from 'react';
import { useNavigate } from 'react-router';
import { formatPrice, calculateDiscount } from '../../../lib/utils';

/**
 * ProductCard — Neighborhood style
 * - Hover: swap ke gambar ke-2 (jika ada)
 * - Clean minimal typography di bawah card
 * - Sold out overlay jika stok 0
 */
export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const images = product.images || [];
  const firstImage = images[0] || null;
  const secondImage = images[1] || null; // gambar yang muncul saat hover

  const discount = calculateDiscount(product.original_price, product.price);
  const badges = product.badges || [];

  // Cek sold out: kalau ga ada field stock di products, skip
  // Bisa disesuaikan jika ada field is_sold_out atau total_stock
  const isSoldOut = product.total_stock === 0;

  return (
    <div
      className="group cursor-pointer"
onClick={() => navigate(`/produk/${product.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/4] overflow-hidden bg-gray-100">
        {/* Main Image */}
        {firstImage && (
          <img
            src={firstImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              hovered && secondImage ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        {/* Hover Image (gambar ke-2) */}
        {secondImage && (
          <img
            src={secondImage}
            alt={`${product.name} - 2`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              hovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-white/60 flex items-end justify-start p-2">
            <span className="text-[10px] tracking-widest uppercase text-gray-500 font-medium">
              Sold Out
            </span>
          </div>
        )}

        {/* Badge — pojok kiri atas */}
        {!isSoldOut && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {badges.includes('New') && (
              <span className="bg-black text-white text-[8px] tracking-widest px-1.5 py-0.5 uppercase">
                New
              </span>
            )}
            {badges.includes('Best Seller') && (
              <span className="bg-red-600 text-white text-[8px] tracking-widest px-1.5 py-0.5 uppercase">
                Best
              </span>
            )}
            {badges.includes('Sale') && discount > 0 && (
              <span className="bg-gray-700 text-white text-[8px] tracking-widest px-1.5 py-0.5 uppercase">
                Sale
              </span>
            )}
          </div>
        )}

        {/* Rotating label (opsional, kayak "INFINITE ARCHIVES" di Neighborhood) */}
        {badges.includes('New') && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div
              className="text-[7px] tracking-[0.25em] uppercase text-gray-400 font-medium"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
              }}
            >
              New Arrivals
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-2 pb-1 space-y-0.5">
        {/* Brand / Category */}
        <p className="text-[9px] tracking-widest uppercase text-gray-400">
          {product.categories?.name || 'HIGHEST WORLD'}
        </p>

        {/* Product Name */}
        <p className="text-[11px] tracking-wide uppercase leading-snug text-black line-clamp-2">
          {product.name}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-[11px] font-medium text-black">
            {formatPrice(product.price)}
          </span>
          {product.original_price && product.original_price !== product.price && (
            <span className="text-[10px] text-gray-400 line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        {/* Sold Out text */}
        {isSoldOut && (
          <p className="text-[10px] tracking-widest uppercase text-gray-400">Sold Out</p>
        )}
      </div>
    </div>
  );
};