import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Package, ShieldCheck, Zap, Truck } from 'lucide-react';
import { ProductGrid } from '../components/product/ProductGrid';
import { supabase } from '../../lib/supabase';
import { SHIPPING_INFO } from '../../lib/config';
import { formatPrice } from '../../lib/utils';

// Fallback banner URLs — akan dipakai kalau Supabase belum ada data
const FALLBACK_BANNERS = [
  { id: '1', image_url: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1774414633/ftwpfbbgdw8vujlib3lo.jpg', title: null, subtitle: null, link: '/produk' },
  { id: '2', image_url: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1774414602/ietbm7anihjbzs2goabe.jpg', title: null, subtitle: null, link: '/produk' },
  { id: '3', image_url: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1774414611/e6lc5nlams9qd2ho24gt.jpg', title: null, subtitle: null, link: '/produk' },
  { id: '4', image_url: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1774414502/nds3xhknsigzzg64adap.jpg', title: null, subtitle: null, link: '/produk' },
  { id: '5', image_url: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1774414713/o08j7eborleihio5ihsk.jpg', title: null, subtitle: null, link: '/produk' },
  { id: '6', image_url: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1774414573/ewj604ywigir3ggwepsx.jpg', title: null, subtitle: null, link: '/produk' },
];

const BANNER_INTERVAL = 10000; // 10 detik

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({ newest: [], bestsellers: [], sale: [] });
  const [heroBanners, setHeroBanners] = useState(FALLBACK_BANNERS);
  const [activeTab, setActiveTab] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const timerRef = useRef(null);

  const resetTimer = (banners) => {
    clearInterval(timerRef.current);
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, BANNER_INTERVAL);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (catData) setCategories(catData);

      // Products
      const { data: prodData } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('is_active', true);

      if (prodData) {
        setProducts({
          newest: prodData
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 12),
          bestsellers: prodData.filter(p => p.badges?.includes('Best Seller')).slice(0, 12),
          sale: prodData.filter(p => p.badges?.includes('Sale')).slice(0, 12),
        });
      }

      // Banners dari Supabase
      const { data: bannerData } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .eq('position', 'hero')
        .order('order', { ascending: true })
        .limit(6);

      const finalBanners = (bannerData && bannerData.length > 0) ? bannerData : FALLBACK_BANNERS;
      setHeroBanners(finalBanners);
      resetTimer(finalBanners);

      setLoading(false);
    };

    fetchData();
    return () => clearInterval(timerRef.current);
  }, []);

  const goToBanner = (index) => {
    setCurrentBanner(index);
    resetTimer(heroBanners);
  };

  const activeProducts =
    activeTab === 'newest' ? products.newest :
    activeTab === 'bestsellers' ? products.bestsellers :
    products.sale;

  return (
    <div className="min-h-screen bg-white text-black">
      {/* ===================== HERO BANNER ===================== */}
      <section className="w-full border-b border-gray-200">

        {/* === DESKTOP: square kiri + kolom kanan === */}
        <div className="hidden lg:flex">

          {/* Kiri: Banner Square */}
          <div
            className="relative flex-shrink-0 bg-gray-100 overflow-hidden"
            style={{ width: 'min(55vw, 760px)', 
                     aspectRatio: '1 / 1' }}
          >
            {heroBanners.map((banner, i) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  i === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={banner.image_url}
                  alt={banner.title || `Banner ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {banner.title && (
                  <div className="absolute top-6 right-5 z-20">
                    <p
                      className="text-white font-black uppercase leading-none"
                      style={{ writingMode: 'vertical-rl', fontSize: 'clamp(2rem, 5vw, 4.5rem)', letterSpacing: '0.08em' }}
                    >
                      {banner.title}
                    </p>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between px-5 pb-5">
                  {banner.subtitle && (
                    <p className="text-[10px] tracking-widest uppercase text-white/70">{banner.subtitle}</p>
                  )}
                  {banner.link && (
                    <Link to={banner.link} className="text-[10px] tracking-widest uppercase text-white/80 hover:text-white transition-colors">
                      View More
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {/* Progress bar */}
            {heroBanners.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-white/10">
                <div key={`p-${currentBanner}`} className="h-full bg-white/50"
                  style={{ animation: `progress ${BANNER_INTERVAL}ms linear forwards` }} />
              </div>
            )}
            {/* Dots */}
            {heroBanners.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
                {heroBanners.map((_, i) => (
                  <button key={i} onClick={() => goToBanner(i)}
                    className={`rounded-full transition-all duration-300 ${i === currentBanner ? 'bg-white w-4 h-1.5' : 'bg-white/40 w-1.5 h-1.5'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Kanan: Info kolom — dibagi per kategori */}
          <div className="flex-1 border-l border-gray-200 flex flex-col divide-y divide-gray-200">
            <div className="flex-1 px-8 py-6 flex flex-col justify-center gap-1">
              <p className="text-[13px] tracking-widest uppercase font-bold text-black">Highest World</p>
              <p className="text-[10px] tracking-wide text-gray-400 leading-relaxed max-w-xs mt-1">
                Fashion bigsize premium untuk Bigbro & Bigsis. Size 2XL hingga 10XL.
              </p>
            </div>
            {categories.slice(0, 3).map((cat) => (
              <Link
                key={cat.id}
                to={`/produk?category=${cat.slug}`}
                className="flex-1 px-8 py-6 flex items-center hover:bg-gray-50 transition-colors group"
              >
                <span className="text-[12px] tracking-widest uppercase font-semibold text-gray-400 group-hover:text-black transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* === MOBILE: banner full width + list kategori di bawah === */}
        <div className="lg:hidden flex flex-col">

          {/* Banner full width — square */}
          <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '1/1' }}>
            {heroBanners.map((banner, i) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  i === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={banner.image_url}
                  alt={banner.title || `Banner ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Vertical title kanan */}
                {banner.title && (
                  <div className="absolute top-4 right-3 z-20">
                    <p
                      className="text-white font-black uppercase leading-none"
                      style={{ writingMode: 'vertical-rl', fontSize: 'clamp(1.8rem, 8vw, 3rem)', letterSpacing: '0.08em' }}
                    >
                      {banner.title}
                    </p>
                  </div>
                )}
                {/* Bottom: subtitle + view more */}
                <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between px-4 pb-4">
                  {banner.subtitle && (
                    <p className="text-[9px] tracking-widest uppercase text-white/70">{banner.subtitle}</p>
                  )}
                  {banner.link && (
                    <Link to={banner.link} className="text-[9px] tracking-widest uppercase text-white/80">
                      View More
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {/* Progress bar mobile */}
            {heroBanners.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-white/10">
                <div key={`pm-${currentBanner}`} className="h-full bg-white/50"
                  style={{ animation: `progress ${BANNER_INTERVAL}ms linear forwards` }} />
              </div>
            )}
          </div>

          {/* List kategori di bawah banner */}
          <div className="flex flex-col divide-y divide-gray-200 border-t border-gray-200">
            <div className="px-5 py-4">
              <p className="text-[12px] tracking-widest uppercase font-bold text-black">Highest World</p>
            </div>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/produk?category=${cat.slug}`}
                className="px-5 py-4 text-[11px] tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            {/* Scroll indicator */}
            <div className="px-5 py-4 text-center">
              <p className="text-[10px] tracking-widest uppercase text-gray-400">Scroll</p>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </section>

      {/* ===================== PRODUCT TABS ===================== */}
      <section className="pt-0 pb-16">

        {/* Tab Bar */}
        <div className="border-b border-gray-200">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-6 flex gap-8">
            {[
              { key: 'newest', label: 'New Arrivals' },
              { key: 'bestsellers', label: 'Best Sellers' },
              { key: 'sale', label: 'Sale' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 text-[11px] tracking-widest uppercase transition-colors border-b-2 -mb-[1px] ${
                  activeTab === tab.key
                    ? 'border-black text-black font-bold'
                    : 'border-transparent text-gray-400 hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 pt-[2px]">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[2px]">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : activeProducts.length > 0 ? (
            <ProductGrid products={activeProducts} />
          ) : (
            <p className="text-center py-16 text-[11px] tracking-widest uppercase text-gray-400">
              No products found
            </p>
          )}
        </div>

        {/* View All */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 pt-8 text-center">
          <Link
            to="/produk"
            className="inline-block text-[11px] tracking-widest uppercase border border-black px-10 py-3 hover:bg-black hover:text-white transition-all duration-200"
          >
            View All
          </Link>
        </div>
      </section>

      {/* ===================== WHY US ===================== */}
      <section className="border-t border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-200">
            {[
              { icon: Package,    title: 'Big Size Ready', desc: '2XL sampai 10XL tersedia' },
              { icon: ShieldCheck, title: 'Premium Quality', desc: 'Material pilihan, QC ketat' },
              { icon: Zap,        title: 'Fast Shipping',   desc: `Estimasi ${SHIPPING_INFO.estimatedDays}` },
              { icon: Truck,      title: 'Free Ongkir',     desc: `Belanja di atas ${formatPrice(SHIPPING_INFO.freeShippingMinimum)}` },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="px-6 py-8 flex flex-col items-center gap-3 text-center">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <p className="text-[11px] tracking-widest uppercase font-semibold">{item.title}</p>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};