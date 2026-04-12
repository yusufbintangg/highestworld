import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('highestworld_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {}
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('highestworld_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, color, size, quantity = 1, variantId = null, variantSku = null, variantImages = []) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => 
          item.product.id === product.id && 
          item.color === color && 
          item.size === size
      );

      const maxStock = product.maxStock ?? 99;

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = existing.quantity + quantity;

        // Cek apakah melebihi stock
        if (newQty > maxStock) {
          toast.error(`Stok tersedia hanya ${maxStock} pcs`);
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = { ...existing, quantity: newQty };
        toast.success('Jumlah produk di keranjang diperbarui');
        return updated;
      } else {
        // Cek stock saat pertama add
        if (quantity > maxStock) {
          toast.error(`Stok tersedia hanya ${maxStock} pcs`);
          return prev;
        }

        return [...prev, {
          id: `${product.id}-${color}-${size}`,
          product,
          color,
          size,
          quantity,
          variantId: variantId,
          variantSku: variantSku,
          variantImages: variantImages || [],
          maxStock,
          sku: variantSku || product.sku || null,
        }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Produk dihapus dari keranjang');
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const maxStock = item.maxStock ?? 99;
        if (newQuantity > maxStock) {
          toast.error(`Stok tersedia hanya ${maxStock} pcs`);
          return item; // tidak diupdate
        }
        return { ...item, quantity: newQuantity };
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success('Keranjang dikosongkan');
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};