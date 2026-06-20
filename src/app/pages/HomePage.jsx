import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Package, ShieldCheck, Zap, Truck } from 'lucide-react';
import { ProductGrid } from '../components/product/ProductGrid';
import { supabase } from '../../lib/supabase';
import { SHIPPING_INFO } from '../../lib/config';
import { formatPrice } from '../../lib/utils';

// Fallback banner URLs — akan dipakai kalau Supabase belum ada data
const FALLBACK_BANNERS = [];

const BANNER_INTERVAL = 5000; // 5 detik per pergantian banner  

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
  console.log('[HomePage] fetchData START');
  setLoading(true);

  // Categories
  console.log('[HomePage] before categories query');
  const { data: catData, error: catErr } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');
  console.log('[HomePage] after categories query', { catData, catErr });
  if (catData) setCategories(catData);

  // Products
  console.log('[HomePage] before products query');
  const { data: prodData, error: prodErr } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true);
  console.log('[HomePage] after products query', { prodData, prodErr });

  // ... lanjut kode aslinya (banners, dst) tetep sama

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
    <div className="min-h-screen bg-white text-black w-full overflow-x-hidden">
      {/* ===================== HERO BANNER ===================== */}
      <section className="w-full border-b border-gray-200">
        {/* === DESKTOP: square kiri + kolom kanan === */}
        <div className="hidden lg:flex">
          {/* Kiri: Banner Square */}
          <div
            className="relative flex-shrink-0 bg-gray-100 overflow-hidden"
            style={{ width: 'min(55vw, 760px)', aspectRatio: '1 / 1' }}
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
                    <p className="text-[10px] tracking-widest uppercase text-black/70">{banner.subtitle}</p>
                  )}
                  {banner.link && (
                    <Link to={banner.link} className="text-[10px] tracking-widest uppercase text-black/80 transition-colors">
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
                to={`/products?category=${encodeURIComponent(cat.slug)}`}
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
            {heroBanners.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-white/10">
                <div key={`pm-${currentBanner}`} className="h-full bg-white/50"
                  style={{ animation: `progress ${BANNER_INTERVAL}ms linear forwards` }} />
              </div>
            )}
          </div>
          {/* List kategori di bawah banner */}
          <div className="flex flex-col divide-y divide-gray-200 border-t border-gray-200 max-h-96 overflow-y-auto">
            <div className="px-5 py-4">
              <p className="text-[12px] tracking-widest uppercase font-bold text-black">Highest World</p>
            </div>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.slug)}`}
                className="px-5 py-4 text-[11px] tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
              >
                {cat.name}
              </Link>
            ))}
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
      {/* Perubahan: Hapus pb-16 agar nempel ke elemen bawahnya jika dibutuhkan, atau sesuaikan */}
      <section className="pt-0 pb-12 w-full">
        {/* Tab Bar */}
        <div className="border-b border-gray-200 w-full">
          {/* Perubahan: px-4 lg:px-6 diganti ke px-5 untuk menyamakan indentasi teks kategori mobile */}
          <div className="px-5 flex gap-8">
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

        {/* Grid Produk — FULL MEPEET SCREEN */}
        {/* Perubahan: Menghapus mx-auto dan px-4 / lg:px-6 agar menyentuh ujung layar luar */}
        <div className="w-full pt-0">
          {loading ? (
            /* Perubahan: gap-[2px] diubah ke gap-0 atau hapus gap agar kotak skeleton mepet */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[1/1] bg-gray-100 animate-pulse border-r border-b border-gray-200" />
              ))}
            </div>
          ) : activeProducts.length > 0 ? (
            /* CATATAN: Pastikan di dalam komponen <ProductGrid /> Anda juga TIDAK menggunakan padding atau gap besar. */
            <ProductGrid products={activeProducts} />
          ) : (
            <p className="text-center py-16 text-[11px] tracking-widest uppercase text-gray-400">
              No products found
            </p>
          )}
        </div>

        {/* View All Button */}
        {/* Perubahan: Hapus px-4/lg:px-6, buat layout pembungkus full width */}
        <div className="w-full pt-10 text-center">
          <Link
            to="/products"
            className="inline-block text-[11px] tracking-widest uppercase border border-black px-10 py-3 hover:bg-black hover:text-white transition-all duration-200"
          >
            View All
          </Link>
        </div>
      </section>

      {/* ===================== WHY US ===================== */}
      {/* Perubahan: Hapus padding container utama (px-4 / lg:px-6) agar border pembatas menyentuh ujung layar kanan-kiri */}
      <section className="border-t border-b border-gray-200 w-full">
        <div className="w-full">
          {/* Perubahan: Pastikan grid membagi rata dan mepet layar. Ditambahkan border-b-0 pada item untuk struktur grid clean */}
          <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y md:divide-y-0 divide-gray-200 w-full">
            {[
              { icon: Package,    title: 'Big Size Ready', desc: '2XL sampai 10XL tersedia' },
              { icon: ShieldCheck, title: 'Premium Quality', desc: 'Material pilihan, QC ketat' },
              { icon: Zap,        title: 'Fast Shipping',   desc: `Estimasi ${SHIPPING_INFO.estimatedDays}` },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="px-4 py-8 flex flex-col items-center gap-3 text-center bg-white">
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