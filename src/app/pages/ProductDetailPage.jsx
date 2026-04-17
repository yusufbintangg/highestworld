import { useParams, Navigate, useNavigate } from 'react-router';
import { useIsMobile } from '../components/ui/use-mobile';
import { useState, useEffect } from 'react';
import { Share2, MessageCircle } from 'lucide-react';
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
  const [zoomedIndex, setZoomedIndex] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 80, y: 80 });
const [showSizeChart, setShowSizeChart] = useState(false);

  // SIZE SORTING - Pure Supabase + No Duplicates + Bigsize focus
  const SIZE_ORDER = {
    '2XL': 1, 
    '3XL': 2, 
    '4XL': 3, 
    '5XL': 4, 
    '6XL': 5, 
    '7XL': 6, 
    '8XL': 7, 
    '9XL': 8, 
    '10XL': 9
  };

  const sortSizes = (sizesArray) => {
    return [...sizesArray].sort((a, b) => {
      return (SIZE_ORDER[a.size] || 999) - (SIZE_ORDER[b.size] || 999);
    });
  };

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
      
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*, categories(id, name), size_chart_image')
        .eq('slug', slug)
        .single();

      if (productError || !productData) {
        setNotFound(true);
        return;
      }

      setProduct(productData);

      const { data: variantsData } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productData.id)
        .order('color', { ascending: true });

      setVariants(variantsData || []);

      const { data: relatedData } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('category_id', productData.category_id)
        .neq('id', productData.id)
        .limit(4);

      setRelatedProducts(relatedData || []);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16">
          <div className="space-y-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse" />
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
  const sizesForSelectedColor = sortSizes(
    variants.filter(v => v.color === selectedColor).map(v => ({ size: v.size, stock: v.stock }))
  );


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
      selectedVariant?.id,
      selectedVariant?.sku || product.sku,
      selectedVariant?.images || []
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
      selectedVariant?.id,
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
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-6 pb-24">

        {/* Breadcrumb */}
        {!isMobile && (
          <div className="text-[10px] tracking-widest uppercase text-gray-400 mb-8 flex gap-2 items-center">
            <span
              className="hover:text-black cursor-pointer transition-colors"
              onClick={() => navigate('/')}
            >
              Home
            </span>
            <span className="text-gray-300">/</span>
            <span
              className="hover:text-black cursor-pointer transition-colors"
              onClick={() => navigate('/produk')}
            >
              {product.categories?.name || 'Products'}
            </span>
            <span className="text-gray-300">/</span>
            <span className="text-black">{product.name}</span>
          </div>
        )}

        {/* Main Layout: Left images | Right info */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start">

          {/* ── LEFT: Images ── */}
          {isMobile ? (
            /* Mobile Carousel */
            <div className="w-full">
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <Carousel
                  className="w-full h-full"
                  opts={{ loop: false, dragFree: false, align: 'center' }}
                  setApi={setCarouselApi}
                >
                  <CarouselContent className="h-full">
                    {images.map((img, i) => (
                      <CarouselItem key={i} className="basis-full">
                        <div className="relative w-full aspect-square bg-gray-50">
                          <img
                            src={img}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
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
                            className="absolute top-3 right-3 w-8 h-8 bg-white/90 flex items-center justify-center hover:bg-white z-10"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 rounded-none opacity-80 hover:opacity-100 z-20" />
                  <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 rounded-none opacity-80 hover:opacity-100 z-20" />
                </Carousel>
              </div>
              <div className="flex justify-center pt-2">
                <span className="text-[11px] font-mono text-gray-400">
                  {selectedImage + 1} / {images.length}
                </span>
              </div>
            </div>
          ) : (
            /* Desktop: vertical stack of full-width images — like the reference screenshot */
            <div className="flex-1 space-y-[3px]">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden bg-gray-50"
                  style={{ cursor: zoomedIndex === i ? 'zoom-out' : 'zoom-in' }}
                  onClick={() => setZoomedIndex(zoomedIndex === i ? null : i)}
                  onMouseMove={(e) => {
                    if (zoomedIndex !== i) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 150;
                    const y = ((e.clientY - rect.top) / rect.height) * 150;
                    setMousePos({ x, y });
                  }}
                  onMouseLeave={() => setMousePos({ x: 50, y: 50 })}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full object-cover transition-transform duration-200"
                    style={{
                      transform: zoomedIndex === i ? 'scale(2)' : 'scale(1)',
                      transformOrigin: zoomedIndex === i ? `${mousePos.x}% ${mousePos.y}%` : 'center center',
                    }}
                  />
                  {/* Badges on first image */}
                  {i === 0 && (
                    <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
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

          {/* ── RIGHT: Product Info — sticky sidebar ── */}
          <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 lg:sticky lg:top-20 lg:self-start">

            {/* Product Name */}
            <div className="mb-4">
              <h1 className="text-sm font-futura tracking-[0.12em] uppercase leading-snug text-black">
                {product.name}
              </h1>
            </div>

            {/* Size selector — styled like the screenshot: letter blocks */}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-sm font-medium text-[#7a6a00] tracking-wide">
                {formatPrice(activePrice)}
              </span>
              {activeOriginalPrice && activeOriginalPrice !== activePrice && (
                <span className="text-xs text-gray-400 line-through">{formatPrice(activeOriginalPrice)}</span>
              )}
              {discount > 0 && (
                <span className="text-xs text-red-500 font-medium">-{discount}%</span>
              )}
            </div>

            <div className="border-t border-gray-200 mb-5" />
            {/* Size selector — styled like the screenshot: letter blocks */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-gray-500 text-[10px]">Size</Label>
              </div>
              {/* Size selector — styled like the screenshot: letter blocks */}
              <div className="flex gap-1.5 flex-wrap">
                {sizesForSelectedColor.length > 0
                  ? sizesForSelectedColor.map(({ size, stock }) => (
                    <button
                      key={size}
                      onClick={() => stock > 0 && setSelectedSize(size)}
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
                  : (
                    /* Fallback: show all sizes from product before color is selected */
                    sortSizes([...new Set(variants.map(v => v.size))].map(size => ({size, stock: 99}))).map(({size}) => (
                      <button
                        key={size}
                        className="min-w-[38px] h-8 px-2 border border-gray-300 text-[11px] tracking-widest uppercase text-black hover:border-black transition-all"
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))

                  )
                }
              </div>
            </div>

            {/* Color selector */}
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
                      onClick={() => handleColorSelect(color.name)}
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

            {/* Action Buttons — styled like the screenshot */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={handleAddToCart}
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
                onClick={handleDirectCheckout}
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
              onClick={handleWhatsAppOrder}
              className="w-full h-10 border border-green-600 text-green-700 text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2 mb-5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Beli via WhatsApp
            </button>

            {/* Description text — visible directly like the screenshot */}
            {product.description && (
              <p className="text-[11px] text-gray-600 leading-relaxed mb-5 whitespace-pre-line">
                {product.description}
                <span className="block mt-2 text-gray-400">Berat: {product.weight}g</span>
              </p>
            )}
            {product.size_chart_image && (
            <img
              src={product.size_chart_image}
              alt="Size Chart"
              className="w-full object-contain mb-5"
            />
          )}
            <div className="border-t border-gray-200 mb-4" />

            {/* Shipping info accordion */}
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="shipping" className="border-b border-gray-200">
                <AccordionTrigger className="text-[10px] tracking-[0.2em] uppercase py-3 hover:no-underline font-medium text-gray-700">
                  Pengiriman
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-gray-500 leading-relaxed pb-4 space-y-1">
                  <p>Estimasi: {SHIPPING_INFO.estimatedDays}</p>
                  <p>Kurir: {SHIPPING_INFO.couriers.join(', ')}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex gap-6 border-b border-gray-200 mb-8">
              <span className="text-[11px] tracking-[0.25em] uppercase font-medium pb-2 border-b-2 border-black">
                Related Products
              </span>
              <span className="text-[11px] tracking-[0.25em] uppercase font-medium pb-2 text-gray-400">
                Recently Viewed
              </span>
            </div>
            <ProductGrid products={relatedProducts} />
          </div>
        )}

      </div>
    </div>
  );
};