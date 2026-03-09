
// CART PAGES 

import React from 'react';
import { X, Minus, Plus, ShoppingCart as CartIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { useCart } from '../../../context/CartContext';
import { formatPrice, generateCartWAMessage } from '../../../lib/utils';

export const CartDrawer = ({ children }) => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [ open, setOpen ] = React.useState(false);

  const handleCheckout = () => {
    setOpen(false);
    navigate('/checkout');
  };
  
  const handleWhatsAppCheckout = () => {
    const waUrl = generateCartWAMessage(cartItems, getCartTotal());
    window.open(waUrl, '_blank');
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
                  <div key={item.id} className="flex gap-2 bg-secondary p-2 rounded-lg">
                    <img
                      src={item.variantImages?.length > 0 
                          ? item.variantImages[0] 
                          : item.product.images?.[0]
                      }
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">
                        {item.product.name}
                      </h3>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Warna: {item.color}</p>
                        <p>Ukuran: {item.size}</p>
                      </div>
                      <p className="font-mono text-accent-gold font-semibold mt-2">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-secondary transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 hover:bg-secondary transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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


//alert-dialog.tsx, aspect-ratio.tsx, avatar.tsx, breadcrumb.tsx,
//collapsible.tsx, command.tsx, context-menu.tsx, dropdown-menu.tsx,
//hover-card.tsx, input-otp.tsx, menubar.tsx, navigation-menu.tsx,
//pagination.tsx, progress.tsx, resizable.tsx, scroll-area.tsx,
//skeleton.tsx, slider.tsx, switch.tsx, table.tsx, tabs.tsx,
//toggle-group.tsx, toggle.tsx, tooltip.tsx, use-mobile.ts
//