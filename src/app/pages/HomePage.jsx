
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ChevronDown, Truck, ShieldCheck, Package, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import { ProductGrid } from '../components/product/ProductGrid';
import { supabase } from '../../lib/supabase';
import { SHIPPING_INFO } from '../../lib/config';
import { formatPrice } from '../../lib/utils';

// Default hero banners (gambar dari luar/unsplash)
const DEFAULT_HERO_BANNERS = [
  { id: 1, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop', alt: 'Banner 1' },
  { id: 2, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1920&h=1080&fit=crop', alt: 'Banner 2' },
  { id: 3, image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1920&h=1080&fit=crop', alt: 'Banner 3' },
];

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({ newest: [], bestsellers: [], sale: [] });
  const [heroBanners, setHeroBanners] = useState(DEFAULT_HERO_BANNERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (catData) setCategories(catData);

      // Fetch products
      const { data: prodData } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('is_active', true);

      if (prodData) {
        setProducts({
          newest: prodData.slice(0, 8),
          bestsellers: prodData.filter(p => p.badges?.includes('Best Seller')).slice(0, 8),
          sale: prodData.filter(p => p.badges?.includes('Sale')).slice(0, 8)
        });
      }

      // Fetch hero banners from Supabase (optional)
      const { data: bannerData } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .eq('position', 'hero')
        .order('order', { ascending: true })
        .limit(3);

      if (bannerData && bannerData.length > 0) {
        setHeroBanners(bannerData);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const newProducts = products.newest;
  const bestSellers = products.bestsellers;
  const saleProducts = products.sale;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {/* Hero Section - Clean & Bold */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-background">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1693071433903-41260e7f07e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVzJTIwc2l6ZSUyMG1hbiUyMGNvbmZpZGVudCUyMGZhc2hpb24lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI5NTg2MjV8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Highest World Hero"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background"></div>
        </div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-[0.15em] leading-tight mb-4">
              <span className="block text-foreground drop-shadow-2xl">SIZE DOESN'T</span>
              <span className="block text-foreground drop-shadow-2xl">ALWAYS</span>
              <span className="block gold-shimmer drop-shadow-2xl">MATTER</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl md:text-5xl tracking-[0.1em] mb-4">
              KATEGORI KAMI
            </h2>
            <div className="w-24 h-1 bg-accent-gold mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/koleksi/${category.slug}`} className="group block">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border hover:border-accent-gold transition-all duration-300">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                    <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                      <h3 className="font-display text-xl text-foreground group-hover:text-accent-gold transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Lihat Koleksi
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl md:text-5xl tracking-[0.1em] mb-4">
              PILIHAN TERBAIK
            </h2>
            <div className="w-24 h-1 bg-accent-gold mx-auto"></div>
          </motion.div>

          <Tabs defaultValue="terbaru" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="terbaru" className="font-subheading uppercase">
                TERBARU
              </TabsTrigger>
              <TabsTrigger value="terlaris" className="font-subheading uppercase">
                TERLARIS
              </TabsTrigger>
              <TabsTrigger value="promo" className="font-subheading uppercase">
                PROMO
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="terbaru">
              <ProductGrid products={newProducts} />
            </TabsContent>
            
            <TabsContent value="terlaris">
              <ProductGrid products={bestSellers} />
            </TabsContent>
            
            <TabsContent value="promo">
              <ProductGrid products={saleProducts} />
            </TabsContent>
          </Tabs>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className="border-2 border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-accent-gold font-subheading uppercase">
              <Link to="/produk">LIHAT SEMUA PRODUK</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-20 bg-gradient-to-r from-accent-gold-dark via-accent-gold to-accent-gold-dark text-accent-gold">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="font-display text-4xl md:text-6xl tracking-[0.1em]">
              OUTFIT BUNDLE SALE
            </h2>
            <p className="text-xl md:text-2xl font-subheading uppercase tracking-wider">
              Hemat hingga 40% untuk Paket Outfit Set
            </p>
            <Button asChild size="lg" variant="outline" className="mt-6 border-2 border-background text-accent-gold hover:bg-background hover:text-accent-gold font-subheading uppercase">
              <Link to="/koleksi/outfit-set">BELANJA SEKARANG</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl md:text-5xl tracking-[0.1em] mb-4">
              KENAPA HIGHEST WORLD?
            </h2>
            <div className="w-24 h-1 bg-accent-gold mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Package,
                title: 'Ukuran Lengkap',
                description: 'Ukuran 2XL sampai 8XL tersedia untuk semua produk'
              },
              {
                icon: ShieldCheck,
                title: 'Premium Quality',
                description: 'Material pilihan dengan quality control ketat'
              },
              {
                icon: Zap,
                title: 'Pengiriman Express',
                description: `Estimasi ${SHIPPING_INFO.estimatedDays} ke seluruh Indonesia`
              },
              {
                icon: Truck,
                title: `Free Ongkir > ${formatPrice(SHIPPING_INFO.freeShippingMinimum)}`,
                description: 'Gratis ongkir untuk pembelian di atas jumlah minimum'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 rounded-lg border border-border hover:border-accent-gold transition-all duration-300 group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-gold/10 flex items-center justify-center group-hover:bg-accent-gold transition-colors">
                    <Icon className="w-8 h-8 text-accent-gold group-hover:text-accent-gold transition-colors" />
                  </div>
                  <h3 className="font-subheading text-xl uppercase tracking-wider mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl md:text-5xl tracking-[0.1em] mb-4">
              KATA MEREKA
            </h2>
            <div className="w-24 h-1 bg-accent-gold mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Ahmad Rizki',
                product: 'Kaos Oversize Premium',
                rating: 5,
                review: 'Kualitas bahan luar biasa! Ukurannya pas banget dan nyaman banget dipake. Highly recommended!'
              },
              {
                name: 'Budi Santoso',
                product: 'Jaket Bomber Premium',
                rating: 5,
                review: 'Akhirnya nemu jaket bigsize yang stylish dan berkualitas. Pelayanan juga cepat dan ramah.'
              },
              {
                name: 'Doni Pratama',
                product: 'Celana Cargo Tactical',
                rating: 5,
                review: 'Bahannya tebal dan kuat, banyak kantong. Perfect untuk aktivitas outdoor. Puas banget!'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-accent-gold">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.review}"
                </p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">Membeli {testimonial.product}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

