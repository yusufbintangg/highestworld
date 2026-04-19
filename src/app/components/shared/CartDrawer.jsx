// CART PAGES

import React from 'react';
import { Minus, Plus, ShoppingCart as CartIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { formatPrice, generateCartWAMessage } from '../../../lib/utils';

export const CartDrawer = ({ children }) => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [open, setOpen] = React.useState(false);

  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    setOpen(false);
    navigate('/checkout');
  };

  const handleWhatsAppCheckout = () => {
    const waUrl = generateCartWAMessage(cartItems, getCartTotal());
    window.open(waUrl, '_blank');
  };

  const handleDecrease = (item) => {
    if (item.quantity <= 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = (item) => {
    const maxStock = item.maxStock ?? 99;
    if (item.quantity >= maxStock) {
      return; // sudah mencapai batas stock
    }
    updateQuantity(item.id, item.quantity + 1);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl tracking-wider flex items-center gap-2">
            <CartIcon className="w-6 h-6 text-accent-gold" />
            KERANJANG BELANJA
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full mt-6">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <CartIcon className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Keranjang Anda kosong</p>
              <p className="text-sm text-muted-foreground">
                Mulai belanja dan tambahkan produk ke keranjang
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto m-3 pr-2 pb-40 space-y-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 py-3 border-b last:border-b-0">
                    <div className="relative shrink-0">
                      <img
                        src={item.variantImages?.length > 0 ? item.variantImages[0] : item.product.images?.[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded border border-gray-100"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.sku || 'N/A'} {item.color !== 'default' && `• ${item.color}`} • {item.size}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{formatPrice(item.product.price * item.quantity)}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleDecrease(item)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-all"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleIncrease(item)}
                          disabled={item.quantity >= (item.maxStock ?? 99)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-white disabled:hover:text-black"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        {item.quantity >= (item.maxStock ?? 99) && (
                          <span className="text-[10px] text-red-500">Maks. stok</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-600 self-start pt-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-4 py-4 space-y-4 bg-background sticky bottom-0">
                <div className="flex justify-between items-center">
                  <span className="font-subheading p-5 uppercase tracking-wider">Total</span>
                  <span className="font-mono p-5 text-2xl font-bold text-accent-gold">
                    {formatPrice(getCartTotal())}
                  </span>
                </div>
                <div className="space-y-2 border-t border-border"> 
                <Button
                  onClick={handleCheckout}
                  className="w-full font-subheading uppercase h-10"
                >
                  LANJUT CHECKOUT 
                </Button>
                <Button
                  onClick={handleWhatsAppCheckout}
                  variant="outline"
                  className="w-full font-subheading uppercase h-10"
                  >
                  CHECKOUT VIA WHATSAPP
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Dengan checkout, Anda akan diarahkan ke WhatsApp untuk menyelesaikan pesanan
                </p>
                  </div>
              </div>      
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};