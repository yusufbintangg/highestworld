import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router';
import { ProductGrid } from '../components/product/ProductGrid';
import { supabase } from '../../lib/supabase';

export const CollectionDetailPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch category by slug
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (catData) {
        setCategory(catData);
        
        // Fetch products by category_id
        const { data: prodData } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .eq('category_id', catData.id)
          .eq('is_active', true);
        
        if (prodData) setProducts(prodData);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="h-64 bg-muted animate-pulse rounded-lg mb-12"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Banner */}
        <div className="relative h-64 rounded-lg overflow-hidden mb-12">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30 flex items-end">
            <div className="p-8">
              <Link to="/koleksi" className="text-sm text-accent-gold hover:underline mb-2 inline-block">
                ← Kembali ke Koleksi
              </Link>
              <h1 className="font-display text-5xl md:text-6xl tracking-[0.1em] text-foreground mb-2">
                {category.name}
              </h1>
              <p className="text-muted-foreground text-lg">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="mb-6">
            <h2 className="font-subheading text-xl uppercase tracking-wider">
              {products.length} Produk Ditemukan
            </h2>
          </div>
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Belum ada produk dalam koleksi ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
