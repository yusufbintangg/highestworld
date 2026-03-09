import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { WHATSAPP_NUMBER, SITE_CONFIG } from "./config";

// Tailwind merge utility
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format price to Indonesian Rupiah
export function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Calculate discount percentage
export function calculateDiscount(originalPrice, currentPrice) {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

// Generate WhatsApp product order message
export function generateProductWAMessage(product, selectedColor, selectedSize) {
  const message = `Halo Highest World! 🛍️

Saya ingin memesan:
• Produk: ${product.name}
• Warna: ${selectedColor}
• Ukuran: ${selectedSize}
• Harga: ${formatPrice(product.price)}

Link Produk: ${SITE_CONFIG.url}/produk/${product.slug}

Mohon konfirmasi ketersediaan dan info pembayaran. Terima kasih!`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Generate WhatsApp payment confirmation message
export function generatePaymentConfirmationWAMessage(formData) {
  const message = `✅ KONFIRMASI PEMBAYARAN

Nama: ${formData.name}
No. WhatsApp: ${formData.whatsapp}
No. Order: ${formData.orderNumber}
Bank: ${formData.bank}
Jumlah: ${formatPrice(formData.amount)}
Tanggal: ${formData.date}
${formData.notes ? `Catatan: ${formData.notes}` : ''}

Bukti transfer telah dilampirkan.`;

return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Generate WhatsApp cart checkout message
export function generateCartWAMessage(cartItems, total) {
  let message = `Halo Highest World! 🛍️\n\nSaya ingin memesan:\n\n`;
  
  cartItems.forEach((item, index) => {
    message += `${index + 1}. ${item.product.name}\n`;
    message += `   • Warna: ${item.color}\n`;
    message += `   • Ukuran: ${item.size}\n`;
    message += `   • Harga: ${formatPrice(item.product.price)}\n\n`;
  });
  
  message += `Total: ${formatPrice(total)}\n\n`;
  message += `Mohon konfirmasi ketersediaan dan info pembayaran. Terima kasih!`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Generate WhatsApp general inquiry message
export function generateGeneralWAMessage(message = "") {
  const defaultMessage = `Halo Highest World! Saya ingin bertanya tentang produk Anda.`;
  const text = message || defaultMessage;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

// Generate product share URL
export function generateShareURL(product) {
  return `${SITE_CONFIG.url}/produk/${product.slug}`;
}

// Filter products by criteria
export function filterProducts(products, filters) {
  let filtered = [...products];

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(p => p.category === filters.category);
  }

  if (filters.subcategory) {
    filtered = filtered.filter(p => p.subcategory === filters.subcategory);
  }

  if (filters.sizes && filters.sizes.length > 0) {
    filtered = filtered.filter(p => 
      p.availableSizes.some(size => filters.sizes.includes(size))
    );
  }

  if (filters.colors && filters.colors.length > 0) {
    filtered = filtered.filter(p => 
      p.colors.some(color => filters.colors.includes(color.name))
    );
  }

  if (filters.priceRange) {
    const { min, max } = filters.priceRange;
    filtered = filtered.filter(p => p.price >= min && p.price <= max);
  }

  if (filters.badges) {
    if (filters.badges.includes('new')) {
      filtered = filtered.filter(p => p.isNew);
    }
    if (filters.badges.includes('bestseller')) {
      filtered = filtered.filter(p => p.isBestSeller);
    }
    if (filters.badges.includes('sale')) {
      filtered = filtered.filter(p => p.isOnSale);
    }
  }

  return filtered;
}

// Sort products
export function sortProducts(products, sortBy) {
  const sorted = [...products];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'popular':
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    default:
      return sorted;
  }
}

// Get related products
export function getRelatedProducts(products, currentProduct, limit = 4) {
  return products
    .filter(p => 
      p.id !== currentProduct.id && 
      (p.category === currentProduct.category || 
       p.subcategory === currentProduct.subcategory)
    )
    .slice(0, limit);
}

// Validate email
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Format phone number to Indonesian format
export function formatPhoneNumber(phone) {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 62
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1);
  }
  
  // If starts with 62, keep as is
  if (cleaned.startsWith('62')) {
    return cleaned;
  }
  
  // Otherwise, add 62 prefix
  return '62' + cleaned;
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Scroll to top
export function scrollToTop(smooth = true) {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
}
