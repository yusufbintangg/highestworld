import { useParams, Navigate, useNavigate } from 'react-router';
import { useIsMobile } from '../components/ui/use-mobile';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ProductGrid } from '../components/product/ProductGrid';
import { supabase } from '../../lib/supabase';
import { calculateDiscount, generateProductWAMessage } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

import { ProductImages } from '../components/product/detail/ProductImages';
import { ProductInfo } from '../components/product/detail/ProductInfo';
import { ProductVariants, sortSizes } from '../components/product/detail/ProductVariants';
import { ProductActions } from '../components/product/detail/ProductActions';
import { ProductMeta } from '../components/product/detail/ProductMeta';

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

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*, categories(id, name), size_chart_image, shopee_url, tokopedia_url')
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

  // ── Loading skeleton ──
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

  // ── Derived state ──
  const uniqueColors = [
    ...new Map(variants.map(v => [v.color, { name: v.color, hex: v.color_hex }])).values(),
  ];
  const sizesForSelectedColor = sortSizes(
    variants.filter(v => v.color === selectedColor).map(v => ({ size: v.size, stock: v.stock }))
  );
  const selectedVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize);
  const currentStock = selectedVariant?.stock ?? 0;
  const badges = product.badges || [];

  const colorImages = variants.filter(v => v.color === selectedColor && v.images?.length > 0)?.[0]?.images || [];
  const images = colorImages.length > 0 ? colorImages : (product.images || []);

  const activePrice = selectedVariant?.price || product.price;
  const activeOriginalPrice = selectedVariant?.original_price || product.original_price;
  const discount = calculateDiscount(activeOriginalPrice, activePrice);

  // ── Handlers ──
  const handleColorSelect = (colorName) => {
    setSelectedColor(colorName);
    const firstAvailable = variants.find(v => v.color === colorName && v.stock > 0);
    setSelectedSize(firstAvailable?.size || '');
  };

  const handleAddToCart = () => {
    const needsColor = variants.length > 0 && uniqueColors.length > 1;
    if (needsColor && !selectedColor) { toast.error('Pilih warna terlebih dahulu'); return; }
    if (!selectedSize) { toast.error('Pilih ukuran terlebih dahulu'); return; }
    if (currentStock === 0) { toast.error('Stok habis untuk pilihan ini'); return; }

    addToCart(
      {
        ...product,
        price: activePrice,
        weight: product.weight || 500,
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

  const handleDirectCheckout = () => {
    const needsColor = variants.length > 0 && uniqueColors.length > 1;
    if (needsColor && !selectedColor) { toast.error('Pilih warna terlebih dahulu'); return; }
    if (!selectedSize) { toast.error('Pilih ukuran terlebih dahulu'); return; }
    if (currentStock === 0) { toast.error('Stok habis untuk pilihan ini'); return; }

    addToCart(
      {
        ...product,
        price: activePrice,
        weight: product.weight || 500,
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
    setTimeout(() => navigate('/checkout'), 500);
  };

  const handleWhatsAppOrder = () => {
    const needsColor = variants.length > 0 && uniqueColors.length > 1;
    if (needsColor && !selectedColor) { toast.error('Pilih warna terlebih dahulu'); return; }
    if (!selectedSize) { toast.error('Pilih ukuran terlebih dahulu'); return; }
    const activeSku = selectedVariant?.sku || product.sku;
    window.open(generateProductWAMessage(product, selectedColor || null, selectedSize, activeSku), '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link produk disalin!');
    }
  };

  // ── Render ──
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-24">

        {/* Breadcrumb */}
        {!isMobile && (
          <div className="text-[10px] tracking-widest uppercase text-gray-400 pt-4 mb-4 flex gap-2 items-center">
            <span className="hover:text-black cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</span>
            <span className="text-gray-300">/</span>
            <span className="hover:text-black cursor-pointer transition-colors" onClick={() => navigate('/products')}>
              {product.categories?.name || 'Products'}
            </span>
            <span className="text-gray-300">/</span>
            <span className="text-black">{product.name}</span>
          </div>
        )}

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-14 items-start">

          {/* LEFT: Images */}
          <ProductImages
            images={images}
            productName={product.name}
            badges={badges}
            discount={discount}
            isMobile={isMobile}
            onShare={handleShare}
          />

          {/* RIGHT: Sticky Sidebar */}
          <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 lg:sticky lg:top-20 lg:self-start">

            <ProductInfo
              product={product}
              activePrice={activePrice}
              activeOriginalPrice={activeOriginalPrice}
              discount={discount}
            />

            <ProductVariants
              variants={variants}
              uniqueColors={uniqueColors}
              sizesForSelectedColor={sizesForSelectedColor}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              currentStock={currentStock}
              onColorSelect={handleColorSelect}
              onSizeSelect={setSelectedSize}
            />

            <ProductActions
              product={product}
              currentStock={currentStock}
              onAddToCart={handleAddToCart}
              onDirectCheckout={handleDirectCheckout}
              onWhatsAppOrder={handleWhatsAppOrder}
            />

            <ProductMeta product={product} />

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <div className="flex gap-6 border-b border-gray-200 mb-8">
              <span className="text-[11px] tracking-[0.25em] uppercase font-medium pb-2 border-b-2 border-black">
                Related Products
              </span>
            </div>
            <ProductGrid products={relatedProducts} />
          </div>
        )}

      </div>
    </div>
  );
};