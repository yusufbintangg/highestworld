import { MessageCircle } from 'lucide-react';

// Shopee icon SVG inline
const ShopeeIcon = () => (
  <img src="https://res.cloudinary.com/dopr9tvnv/image/upload/q_auto/f_auto/v1776507508/y9uzbfx3qr7t481c0i5z.png" className="w-4 h-4" />
);

// Tokopedia icon SVG inline
const TokopediaIcon = () => (
  <img src="https://res.cloudinary.com/dopr9tvnv/image/upload/q_auto/f_auto/v1776507491/vv6bl91p8oi4lersf7jt.png" className="w-4 h-4" />
);

export const ProductActions = ({
  product,
  currentStock,
  onAddToCart,
  onDirectCheckout,
  onWhatsAppOrder,
}) => {
  
  return (
    <div>
      {/* Add to Cart + Buy it now */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={onAddToCart}
          disabled={currentStock === 0}
          className={`flex-1 h-11 border text-[11px] tracking-[0.2em] uppercase font-medium transition-all ${
            currentStock === 0
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-black text-black hover:bg-black hover:text-white'
          }`}
        >
          {currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button
          onClick={onDirectCheckout}
          disabled={currentStock === 0}
          className={`flex-1 h-11 text-[11px] tracking-[0.2em] uppercase font-medium transition-all ${
            currentStock === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#6b6b3a] text-white hover:bg-[#57572e]'
          }`}
        >
          Buy it now
        </button>
      </div>

      {/* WhatsApp */}
      <button
        onClick={onWhatsAppOrder}
        className="w-full h-10 border border-green-600 text-green-700 text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2 mb-3"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        Beli via WhatsApp
      </button>

      {/* Marketplace Buttons — hanya muncul kalau URL ada */}
      {(product.shopee_url || product.tokopedia_url) && (
        <div className="flex gap-2 mb-5">
          {product.shopee_url && (
            <a
              href={product.shopee_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-10 flex items-center justify-center gap-1.5 border border-[#EE4D2D] text-[#EE4D2D] text-[11px] tracking-[0.1em] uppercase font-medium hover:bg-[#EE4D2D] hover:text-white transition-all"
            >
              <ShopeeIcon />
              Shopee
            </a>
          )}
          {product.tokopedia_url && (
            <a
              href={product.tokopedia_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-10 flex items-center justify-center gap-1.5 border border-[#42B549] text-[#42B549] text-[11px] tracking-[0.1em] uppercase font-medium hover:bg-[#42B549] hover:text-white transition-all"
            >
              <TokopediaIcon />
              Tokopedia
            </a>
          )}
        </div>
      )}
    </div>
  );
};
