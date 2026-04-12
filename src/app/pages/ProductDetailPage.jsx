import { useParams, Navigate, useNavigate } from 'react-router';
import { useIsMobile } from '../components/ui/use-mobile';

import React, { useState, useEffect } from 'react';
import { Share2, ShoppingCart, MessageCircle, Package, Truck, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '../components/ui/carousel';
import { toast } from 'sonner';
import { ProductGrid } from '../components/product/ProductGrid';
import { supabase } from '../../lib/supabase';
import { formatPrice, calculateDiscount, generateProductWAMessage } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { SHIPPING_INFO } from '../../lib/config';

const Label = ({ children, className = '' }) => (
  <label className={`text-xs font-medium tracking-widest uppercase ${className}`}>{children}</label>
);

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [carouselApi, setCarouselApi] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () => {
      setSelectedImage(carouselApi.selectedScrollSnap());
    };

    carouselApi.on('select', handleSelect);
    return () => carouselApi.off('select', handleSelect);
  }, [carouselApi]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      // Get product by slug
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .eq('slug', slug)
        .single();

      if (productError || !productData) {
        setNotFound(true);
        return;
      }

      setProduct(productData);

      // Get variants
      const { data: variantsData } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productData.id)
        .order('color', { ascending: true });

      setVariants(variantsData || []);

      // Get related products (same category)
      const { data: relatedData } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('category_id', productData.category_id)
        .neq('id', productData.id)
        .limit(4);

      setRelatedProducts(relatedData || []);
      
    } catch (error) {
      console.error('Error fetching product:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16">
          <div className="grid grid-cols-3 gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
            ))}
          </div>
          <div className="space-y-4 pt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound) return <Navigate to="/404" replace />;

  const uniqueColors = [...new Map(variants.map(v => [v.color, { name: v.color, hex: v.color_hex }])).values()];
  const sizesForSelectedColor = variants
    .filter(v => v.color === selectedColor)
    .map(v => ({ size: v.size, stock: v.stock }));

  const selectedVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize);
  const currentStock = selectedVariant?.stock ?? 0;

  const badges = product.badges || [];

  const colorImages = variants
    .filter(v => v.color === selectedColor && v.images?.length > 0)
    ?.[0]?.images || [];
  const images = colorImages.length > 0 ? colorImages : (product.images || []);

  const activePrice = selectedVariant?.price || product.price;
  const activeOriginalPrice = selectedVariant?.original_price || product.original_price;
  const discount = calculateDiscount(activeOriginalPrice, activePrice);

  const handleColorSelect = (colorName) => {
    setSelectedColor(colorName);
    const firstAvailable = variants.find(v => v.color === colorName && v.stock > 0);
    setSelectedSize(firstAvailable?.size || '');
  };

  const handleAddToCart = () => {
    const needsColorSelection = variants.length > 0 && uniqueColors.length > 1;
    if (needsColorSelection && !selectedColor) { toast.error('Pilih warna terlebih dahulu'); return; }
    if (!selectedSize) { toast.error('Pilih ukuran terlebih dahulu'); return; }
    if (currentStock === 0) { toast.error('Stok habis untuk pilihan ini'); return; }

    // Hitung berat total
    const itemWeight = product.weight || 500;

    addToCart(
      {
        ...product,
        price: activePrice,
        weight: itemWeight,
        variantId: selectedVariant?.id || null,
        variantImages: selectedVariant?.images || [],
        maxStock: currentStock,
      }, 
      selectedColor, 
      selectedSize, 
      1,
      selectedVariant?.id,      // ← TAMBAH variant ID
      selectedVariant?.sku || product.sku,  // ← TAMBAH SKU
      selectedVariant?.images || []  // ← TAMBAH images
    );
    toast.success('Produk ditambahkan ke keranjang!');
  };

  const handleWhatsAppOrder = () => {
    if (!selectedColor) { toast.error('Pilih warna terlebih dahulu'); return; }
    if (!selectedSize) { toast.error('Pilih ukuran terlebih dahulu'); return; }
    const waUrl = generateProductWAMessage(product, selectedColor, selectedSize);
    window.open(waUrl, '_blank');
  };

  const handleDirectCheckout = () => {
    const needsColorSelection = variants.length > 0 && uniqueColors.length > 1;
    if (needsColorSelection && !selectedColor) { toast.error('Pilih warna terlebih dahulu'); return; }
    if (!selectedSize) { toast.error('Pilih ukuran terlebih dahulu'); return; }
    if (currentStock === 0) { toast.error('Stok habis untuk pilihan ini'); return; }

    const itemWeight = product.weight || 500;

    addToCart(
      {
        ...product,
        price: activePrice,
        weight: itemWeight,
        variantId: selectedVariant?.id || null,
        variantImages: selectedVariant?.images || [],
        maxStock: currentStock,
      }, 
      selectedColor, 
      selectedSize, 
      1,
      selectedVariant?.id,      // ← TAMBAH variant ID
      selectedVariant?.sku || product.sku,
      selectedVariant?.images || []
    );

    toast.success('Redirecting ke checkout...');
    setTimeout(() => { navigate('/checkout'); }, 500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link produk disalin!');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black pt-0 pb-24">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">

        {/* Breadcrumb - hide on mobile */}
        {!isMobile && (
          <div className="text-[10px] tracking-widest uppercase text-gray-400 mb-6 flex gap-2">
            <span className="hover:text-black cursor-pointer" onClick={() => navigate('/')}>TOP</span>
            <span>/</span>
            <span className="hover:text-black cursor-pointer" onClick={() => navigate('/produk')}>
              {product.categories?.name || 'PRODUCTS'}
            </span>
            <span>/</span>
            <span className="text-black">{product.name}</span>
          </div>
        )}

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* LEFT: Image Grid */}
          {isMobile ? (
            /* Mobile: Full width carousel */
            <div className="w-screen relative left-[calc(-50vw+50%)] space-y-2">
              <div className="relative aspect-square overflow-hidden">
                <Carousel 
                  className="w-full h-full" 
                  opts={{ 
                    loop: false, 
                    dragFree: false,
                    align: "center"
                  }} 
                  setApi={setCarouselApi}
                >
                  <CarouselContent className="h-full">
                    {images.map((img, i) => (
                      <CarouselItem key={i} className="basis-full">
                        <div className="relative w-full aspect-square">
                          <img
                            src={img}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                            {badges.includes('New') && (
                              <span className="bg-black text-white text-[9px] tracking-widest px-1.5 py-0.5 uppercase">New</span>
                            )}
                            {badges.includes('Best Seller') && (
                              <span className="bg-red-600 text-white text-[9px] tracking-widest px-1.5 py-0.5 uppercase">Best</span>
                            )}
                            {badges.includes('Sale') && discount > 0 && (
                              <span className="bg-gray-800 text-white text-[9px] tracking-widest px-1.5 py-0.5 uppercase">-{discount}%</span>
                            )}
                          </div>
                          <button
                            onClick={handleShare}
                            className="absolute top-3 right-3 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white z-10"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full opacity-80 hover:opacity-100 z-20" />
                  <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full opacity-80 hover:opacity-100 z-20" />
                </Carousel>
              </div>
              {/* Counter - dalam container normal */}
              <div className="px-4 flex gap-1 pb-1 justify-center">
                <span className="text-[11px] font-mono text-gray-500">
                  {selectedImage + 1} / {images.length}
                </span>
              </div>
            </div>
          ) : (
            /* Desktop: masonry-style grid, all images stacked */
            <div className="flex-1 grid grid-cols-3 gap-[2px]">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden bg-gray-50 cursor-pointer ${
                    i === 0 ? 'col-span-3' : ''
                  }`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full object-cover hover:scale-[1.02] transition-transform duration-500"
                  />
                  {/* Badges only on first image */}
                  {i === 0 && (
                    <div className="absolute top-4 left-4 flex flex-col gap-1">
                      {badges.includes('New') && (
                        <span className="bg-black text-white text-[9px] tracking-widest px-2 py-1 uppercase">New</span>
                      )}
                      {badges.includes('Best Seller') && (
                        <span className="bg-red-600 text-white text-[9px] tracking-widest px-2 py-1 uppercase">Best Seller</span>
                      )}
                      {badges.includes('Sale') && discount > 0 && (
                        <span className="bg-gray-700 text-white text-[9px] tracking-widest px-2 py-1 uppercase">Sale -{discount}%</span>
                      )}
                    </div>
                  )}
                  {i === 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(); }}
                      className="absolute top-4 right-4 w-8 h-8 bg-white/90 flex items-center justify-center hover:bg-white transition"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* RIGHT: Product Info — sticky */}
          <div className="w-full lg:w-[340px] xl:w-[380px] lg:sticky lg:top-20 lg:self-start space-y-5">

            {/* Brand & Name */}
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-1">
                {product.categories?.name || 'HIGHEST WORLD'}
              </p>
              <h1 className="text-base font-semibold tracking-wide uppercase leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-base font-medium">{formatPrice(activePrice)}</span>
              {activeOriginalPrice && activeOriginalPrice !== activePrice && (
                <span className="text-sm text-gray-400 line-through">{formatPrice(activeOriginalPrice)}</span>
              )}
              {discount > 0 && (
                <span className="text-xs text-red-600 font-medium">-{discount}%</span>
              )}
            </div>

            <div className="border-t border-gray-200" />

            {/* Color */}
            {uniqueColors.some(c => c.name) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-gray-500">Color:</Label>
                  {selectedColor && (
                    <span className="text-[11px] tracking-wider uppercase font-medium">{selectedColor}</span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {uniqueColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorSelect(color.name)}
                      title={color.name}
                      className={`w-7 h-7 border transition-all duration-150 ${
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

            {/* Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-gray-500">Size:</Label>
                  {selectedSize && (
                    <span className="text-[11px] tracking-wider uppercase font-medium">{selectedSize}</span>
                  )}
                </div>
                <button className="text-[10px] tracking-widest uppercase underline underline-offset-2 text-gray-500 hover:text-black">
                  Size Guide
                </button>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {sizesForSelectedColor.map(({ size, stock }) => (
                  <button
                    key={size}
                    onClick={() => stock > 0 && setSelectedSize(size)}
                    disabled={stock === 0}
                    className={`min-w-[44px] h-9 px-2 border text-xs tracking-widest uppercase transition-all ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : stock === 0
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                        : 'border-gray-300 text-black hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div className="text-[11px] tracking-wide">
              <span className="text-gray-500">Stock: </span>
              <span className={currentStock > 0 ? 'text-black font-medium' : 'text-red-500 font-medium'}>
                {currentStock > 0 ? `${currentStock} pcs` : 'Habis'}
              </span>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={currentStock === 0}
              className={`w-full h-12 border text-xs tracking-[0.2em] uppercase font-medium transition-all ${
                currentStock === 0
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-black text-black hover:bg-black hover:text-white'
              }`}
            >
              {currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {/* Checkout */}
            <button
              onClick={handleDirectCheckout}
              disabled={currentStock === 0}
              className={`w-full h-12 text-xs tracking-[0.2em] uppercase font-medium transition-all ${
                currentStock === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              Checkout Langsung
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppOrder}
              className="w-full h-10 border border-green-600 text-green-700 text-xs tracking-[0.15em] uppercase font-medium hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Beli via WhatsApp
            </button>

            <div className="border-t border-gray-200" />

            {/* Accordion */}
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="description" className="border-b border-gray-200">
                <AccordionTrigger className="text-[11px] tracking-[0.2em] uppercase py-3 hover:no-underline font-medium">
                  Deskripsi Produk
                </AccordionTrigger>
                <AccordionContent className="text-xs text-gray-600 leading-relaxed pb-4 whitespace-pre-line">
                  {product.description}
                  <p className="mt-3 text-gray-500">Berat: {product.weight}g</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping" className="border-b border-gray-200">
                <AccordionTrigger className="text-[11px] tracking-[0.2em] uppercase py-3 hover:no-underline font-medium">
                  Pengiriman
                </AccordionTrigger>
                <AccordionContent className="text-xs text-gray-600 leading-relaxed pb-4 space-y-1">
                  <p>Estimasi: {SHIPPING_INFO.estimatedDays}</p>
                  <p>Kurir: {SHIPPING_INFO.couriers.join(', ')}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-[11px] tracking-[0.3em] uppercase font-medium mb-8 text-gray-800">Related Items</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}

      </div>
    </div>
  );
};