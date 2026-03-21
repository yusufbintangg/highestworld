import { useParams, Navigate, useNavigate } from 'react-router';
import { useIsMobile } from '../components/ui/use-mobile';

import React, { useState, useEffect } from 'react';
import { Share2, ShoppingCart, MessageCircle, Package, Truck, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import { toast } from 'sonner';
import { ProductGrid } from '../components/product/ProductGrid';
import { supabase } from '../../lib/supabase';
import { formatPrice, calculateDiscount, generateProductWAMessage } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { SHIPPING_INFO } from '../../lib/config';

const Label = ({ children, className = '' }) => (
  <label className={`text-sm font-medium ${className}`}>{children}</label>
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

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);

      // Fetch produk by slug
      const { data: prod } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (!prod) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProduct(prod);

      // Fetch variants produk ini
      const { data: vars } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', prod.id);

      if (vars) {
        setVariants(vars);
        // Set default color & size dari variant pertama
        const firstVariant = vars[0];
        if (firstVariant) {
          setSelectedColor(firstVariant.color);
          setSelectedSize(firstVariant.size);
        }
      }

      // Fetch related products (kategori sama, bukan produk ini)
      const { data: related } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('category_id', prod.category_id)
        .eq('is_active', true)
        .neq('id', prod.id)
        .limit(4);

      if (related) setRelatedProducts(related);
      setLoading(false);
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) return <Navigate to="/404" replace />;

  // Derive unique colors & sizes dari variants
  const uniqueColors = [...new Map(variants.map(v => [v.color, { name: v.color, hex: v.color_hex }])).values()];
  const sizesForSelectedColor = variants
    .filter(v => v.color === selectedColor)
    .map(v => ({ size: v.size, stock: v.stock }));

  const selectedVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize);
  const currentStock = selectedVariant?.stock ?? 0;

  const badges = product.badges || [];

  // Gambar: pakai gambar varian kalau ada, fallback ke gambar produk
  const colorImages = variants
    .filter(v => v.color === selectedColor && v.images?.length > 0)
    ?.[0]?.images || [];
  const images = colorImages.length > 0 ? colorImages : (product.images || []);

  // Harga: pakai harga varian kalau ada, fallback ke harga produk
  const activePrice = selectedVariant?.price || product.price;
  const activeOriginalPrice = selectedVariant?.original_price || product.original_price;
  const discount = calculateDiscount(activeOriginalPrice, activePrice);

  const handleColorSelect = (colorName) => {
    setSelectedColor(colorName);
    // Reset size ke yang pertama tersedia di warna ini
    const firstAvailable = variants.find(v => v.color === colorName && v.stock > 0);
    setSelectedSize(firstAvailable?.size || '');
  };

  const handleAddToCart = () => {
    if (!selectedColor) { toast.error('Pilih warna terlebih dahulu'); return; }
    if (!selectedSize) { toast.error('Pilih ukuran terlebih dahulu'); return; }
    if (currentStock === 0) { toast.error('Stok habis untuk pilihan ini'); return; }
    
    console.log('selectedVariant:', selectedVariant);
    console.log('selectedColor:', selectedColor);
    console.log('selectedSize:', selectedSize);
    console.log('variants:', variants);
    
    addToCart({
    ...product,
    price: activePrice,
    variantId: selectedVariant?.id || null,
    variantImages: selectedVariant?.images || [],
    maxStock: currentStock,
  }, selectedColor, selectedSize, 1);
      toast.success('Produk ditambahkan ke keranjang!');
  };

  const handleWhatsAppOrder = () => {
    if (!selectedColor) { toast.error('Pilih warna terlebih dahulu'); return; }
    if (!selectedSize) { toast.error('Pilih ukuran terlebih dahulu'); return; }
    const waUrl = generateProductWAMessage(product, selectedColor, selectedSize);
    window.open(waUrl, '_blank');
  };

  const handleDirectCheckout = () => {
    if (!selectedColor) { toast.error('Pilih warna terlebih dahulu'); return; }
    if (!selectedSize) { toast.error('Pilih ukuran terlebih dahulu'); return; }
    if (currentStock === 0) { toast.error('Stok habis untuk pilihan ini'); return; }
    
    addToCart({
      ...product,
      price: activePrice,
      variantId: selectedVariant?.id || null,
      variantImages: selectedVariant?.images || [],
      maxStock: currentStock,
    }, selectedColor, selectedSize, 1);
    
    toast.success('Redirecting ke checkout...');
    setTimeout(() => {
      navigate('/checkout');
    }, 500);
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
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Kiri: Gallery - Carousel Slider (Swipe/Drag) */}
          <div className="space-y-4">
            <Carousel className="w-full" opts={{ loop: true }}>
              <CarouselContent className="h-full">
                {images.map((image, index) => (
                  <CarouselItem key={index} className="h-full">
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted h-full">
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {badges.includes('New') && <Badge className="bg-accent-gold text-background">NEW</Badge>}
                        {badges.includes('Best Seller') && <Badge className="bg-destructive text-white">BEST SELLER</Badge>}
                        {badges.includes('Sale') && discount > 0 && <Badge className="bg-accent-red text-white">SALE -{discount}%</Badge>}
                      </div>
                      
                      {/* Share Button */}
                      <Button
                        variant="ghost" size="icon"
                        className="absolute top-4 right-4 bg-background/80 backdrop-blur"
                        onClick={handleShare}
                      >
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-accent-gold' : 'border-border hover:border-accent-gold/50'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Kanan: Info Produk */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div >
              {isMobile ? (
                /* Warna UNTUK MOBILE DEVICE */
                <div className="space-y-3 mb-6">
                  <div>
                    <Label className="font-subheading uppercase tracking-wider">
                      Pilih Warna
                    </Label>
                    {selectedColor && (
                      <span className="text-bold text-accent-gold ml-2">
                        — {selectedColor}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {uniqueColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => handleColorSelect(color.name)}
                        title={color.name}
                        className={`
                          w-8 h-8 rounded-full border-2
                          transition-all duration-200
                          ${selectedColor === color.name
                            ? "border-amber-400 ring-1px ring-amber-300 scale-110"
                            : "border-border hover:border-amber-300"
                          }
                        `}
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <p className="text-xs font-subheading uppercase tracking-wider text-accent-gold mb-2">
                {product.categories?.name || 'HIGHEST WORLD'}
              </p>
              <h1 className="font-display text-3xl md:text-4xl tracking-wide mb-3">
                {product.name}
              </h1>
            </div>

            <Separator className="bg-accent-gold" />
                  <Badge variant="destructive" className="text-2xl font-subheading">
                    HEMAT {discount}%
                  </Badge>

            {/* Harga */}
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-bold text-accent-gold">
                {formatPrice(activePrice)}
              </span>
              {activeOriginalPrice && (
                <>
                  <span className="font-mono text-lg text-muted-foreground line-through">
                    {formatPrice(activeOriginalPrice)}
                  </span>
                </>
              )}
            </div>

            <Separator />
            {!isMobile ? (
              /* Pilih Warna UNTUK DESKTOP MODE */
              <div className="space-y-3 mb-6 lg:mb-0">
                <div>
                  <Label className="font-subheading uppercase tracking-wider">
                    Pilih Warna
                  </Label>
                  {selectedColor && (
                    <span className="text-bold text-accent-gold ml-2">
                      — {selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {uniqueColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorSelect(color.name)}
                      title={color.name}
                      className={`
                        w-8 h-8 rounded-full border-2
                        transition-all duration-200
                        ${selectedColor === color.name
                          ? "border-amber-400 ring-1px ring-amber-300 scale-110"
                          : "border-border hover:border-amber-300"
                        }
                      `}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {/* Pilih Ukuran */}
            <div className="space-y-3 mt-3">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="font-subheading uppercase tracking-wider">Pilih Ukuran</Label>
                  {selectedSize && (
                    <span className="text-bold text-accent-gold ml-2">— {selectedSize}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {sizesForSelectedColor.map(({ size, stock }) => (
                  <button
                    key={size}
                    onClick={() => stock > 0 && setSelectedSize(size)}
                    disabled={stock === 0}
                    className={`px-3 py-2 rounded border text-sm font-mono transition-all ${
                      selectedSize === size
                        ? 'border-amber-300 scale-105'
                        : stock === 0
                        ? 'border-border text-muted-foreground opacity-40 cursor-not-allowed line-through'
                        : 'border-border hover:border-accent-gold/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stok */}
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-accent-gold" />
              <span className="text-muted-foreground">
                Stok:{' '}
                <span className={currentStock > 0 ? 'text-green-500 font-semibold' : 'text-destructive font-semibold'}>
                  {currentStock > 0 ? `Tersisa ${currentStock} pcs` : 'Habis'}
                </span>
              </span>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                variant="outline"
                disabled={currentStock === 0}
                className="w-full border-2 text-accent-gold font-subheading uppercase tracking-wider h-12"
              >
                TAMBAH KE KERANJANG
              </Button>
              <Button
                onClick={handleDirectCheckout}
                disabled={currentStock === 0}
                className="w-full bg-gradient-to-r from-accent-gold to-accent-gold-light border-2 border-accent-gold text-accent-gold font-subheading uppercase tracking-wider h-14 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                🛒 CHECKOUT LANGSUNG
              </Button>
              <Button
                onClick={handleWhatsAppOrder}
                className="w-full bg-accent-gold hover:bg-accent-gold-light text-accent-gold font-subheading uppercase tracking-wider h-12"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                BELI VIA WHATSAPP
              </Button>

            </div>

            <Separator />

            {/* Accordion */}
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger className="font-subheading uppercase tracking-wider">
                  Deskripsi Produk
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>{product.description}</p>
                  <p className="mt-3">• Berat: {product.weight}g</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="font-subheading uppercase tracking-wider">
                  Info Pengiriman
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 mt-1 text-accent-gold" />
                    <div>
                      <p>Estimasi: {SHIPPING_INFO.estimatedDays}</p>
                      <p className="text-sm">Kurir: {SHIPPING_INFO.couriers.join(', ')}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-3xl tracking-[0.1em] mb-8">MUNGKIN KAMU SUKA</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
};