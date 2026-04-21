import React from 'react';
import { Minus, Plus, X, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { formatPrice, generateCartWAMessage } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

export const CartDrawer = ({ children }) => {
  const navigate  = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = React.useState(false);

  const total     = getCartTotal();
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = () => {
    setOpen(false);
    navigate('/checkout');
  };

  const handleWhatsAppCheckout = () => {
    window.open(generateCartWAMessage(cartItems, total), '_blank');
  };

  const handleDecrease = (item) => {
    if (item.quantity <= 1) removeFromCart(item.id);
    else updateQuantity(item.id, item.quantity - 1);
  };

  const handleIncrease = (item) => {
    const max = item.maxStock ?? 99;
    if (item.quantity < max) updateQuantity(item.id, item.quantity + 1);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-white border-l border-black/10 flex flex-col"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/8">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-black" />
            <span className="text-[11px] tracking-[0.25em] uppercase font-bold text-black">
              Cart
            </span>
            {itemCount > 0 && (
              <span className="text-[10px] tracking-widest text-gray-400">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            )}
          </div>
        </div>

        {/* ── Empty State ── */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
            <div className="w-16 h-16 border border-black/10 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-black mb-1">
                Keranjang Kosong
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Belum ada produk yang ditambahkan
              </p>
            </div>
            <button
              onClick={() => { setOpen(false); navigate('/produk'); }}
              className="mt-2 flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-bold border border-black px-5 py-3 hover:bg-black hover:text-white transition-all duration-300 group"
            >
              Lihat Produk
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        ) : (
          <>
            {/* ── Cart Items ── */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.map((item, index) => {
                const img = item.variantImages?.length > 0
                  ? item.variantImages[0]
                  : item.product.images?.[0];
                const atMax = item.quantity >= (item.maxStock ?? 99);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex gap-4 px-6 py-5 transition-colors hover:bg-gray-50/60',
                      index !== cartItems.length - 1 && 'border-b border-black/5'
                    )}
                  >
                    {/* Image */}
                    <div className="shrink-0 w-[72px] h-[88px] bg-gray-50 overflow-hidden">
                      {img
                        ? <img src={img} alt={item.product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gray-100" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h3 className="text-[12px] font-semibold text-black uppercase tracking-wide leading-snug line-clamp-2 pr-4">
                          {item.product.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 tracking-wider mt-1 uppercase">
                          {[item.sku, item.color !== 'default' && item.color, item.size]
                            .filter(Boolean).join(' · ')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Qty controls */}
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleDecrease(item)}
                            className="w-6 h-6 border border-black/20 flex items-center justify-center hover:bg-black hover:border-black hover:text-white transition-all duration-150 text-gray-500"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-[12px] font-semibold w-4 text-center tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncrease(item)}
                            disabled={atMax}
                            className="w-6 h-6 border border-black/20 flex items-center justify-center hover:bg-black hover:border-black hover:text-white transition-all duration-150 text-gray-500 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                          {atMax && (
                            <span className="text-[9px] text-red-400 uppercase tracking-widest">Max</span>
                          )}
                        </div>

                        {/* Price */}
                        <span className="text-[13px] font-bold text-black tabular-nums">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-black transition-colors mt-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-black/8 bg-white">
              {/* Total */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
                <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-gray-400">
                  Total
                </span>
                <span className="text-xl font-black text-black tabular-nums tracking-tight">
                  {formatPrice(total)}
                </span>
              </div>

              {/* Actions */}
              <div className="px-6 py-5 space-y-2.5">
                <button
                  onClick={handleCheckout}
                  className="w-full h-12 bg-black text-white text-[11px] tracking-[0.25em] uppercase font-bold hover:bg-gray-900 active:bg-gray-800 transition-colors flex items-center justify-center gap-2 group"
                >
                  Checkout
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full h-11 border border-black/15 text-[11px] tracking-[0.2em] uppercase font-semibold text-gray-500 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Via WhatsApp
                </button>
                <p className="text-[9px] text-center text-gray-300 tracking-wide pt-1">
                  Ongkos kirim dihitung saat checkout
                </p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};