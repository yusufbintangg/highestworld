import React, { useState, useMemo, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { ProductGrid } from '../components/product/ProductGrid';
import { supabase } from '../../lib/supabase';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    category: 'all',
    badges: []
  });

  // Fetch products dari Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch categories
      const { data: catsData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      // Fetch products
      const { data: prodsData } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('is_active', true);

      if (catsData) setCategories(catsData);
      if (prodsData) setProducts(prodsData);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Filter & sort di frontend
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter kategori
    if (filters.category !== 'all') {
      result = result.filter(p => p.categories?.slug === filters.category);
    }

    // Filter badges
    if (filters.badges.length > 0) {
      result = result.filter(p =>
        filters.badges.every(badge => p.badges?.includes(badge))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }

    return result;
  }, [products, filters, sortBy]);

  const handleCategoryFilter = (categorySlug) => {
    setFilters(prev => ({ ...prev, category: categorySlug }));
  };

  const handleBadgeFilter = (badge, checked) => {
    setFilters(prev => ({
      ...prev,
      badges: checked
        ? [...prev.badges, badge]
        : prev.badges.filter(b => b !== badge)
    }));
  };

  const resetFilters = () => {
    setFilters({ category: 'all', badges: [] });
  };

  const FilterPanel = () => (
    <div className="space-y-6 p-2">
      <div>
        <h3 className="font-subheading text-lg uppercase tracking-wider mb-4">
          Kategori
        </h3>
        <div className="space-y-2 p-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cat-all"
              checked={filters.category === 'all'}
              onCheckedChange={() => handleCategoryFilter('all')}
            />
            <Label htmlFor="cat-all" className="cursor-pointer h-8">
              Semua Produk
            </Label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center h-8 space-x-2">
              <Checkbox
                id={`cat-${category.slug}`}
                checked={filters.category === category.slug}
                onCheckedChange={() => handleCategoryFilter(category.slug)}
              />
              <Label htmlFor={`cat-${category.slug}`} className="cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-subheading text-lg p-2 uppercase tracking-wider mb-4">
          Filter
        </h3>
        <div className="space-y-2 p-4">
          {[
            { value: 'New', label: 'Produk Baru' },
            { value: 'Best Seller', label: 'Best Seller' },
            { value: 'Sale', label: 'Sedang Promo' },
          ].map((badge) => (
            <div key={badge.value} className="flex items-center h-8 space-x-2">
              <Checkbox
                id={`badge-${badge.value}`}
                checked={filters.badges.includes(badge.value)}
                onCheckedChange={(checked) => handleBadgeFilter(badge.value, checked)}
              />
              <Label htmlFor={`badge-${badge.value}`} className="cursor-pointer">
                {badge.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <Button onClick={resetFilters} variant="outline" className="w-full">
        Reset Filter
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl tracking-[0.1em] mb-2">
            SEMUA PRODUK
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Memuat produk...' : `${filteredAndSortedProducts.length} produk ditemukan`}
          </p>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32 bg-card border border-border rounded-lg p-4 max-h-[calc(100vh-160px)] overflow-y-auto">
              <FilterPanel />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex gap-2">
                <Sheet>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] [&>div]:!overflow-y-auto">
                    <SheetHeader className="sticky top-0 bg-background z-10">
                      <SheetTitle className="font-display tracking-wider">
                        FILTER PRODUK
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 overflow-y-auto h-[calc(100vh-100px)]">
                      <FilterPanel />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="price-low">Harga Terendah</SelectItem>
                  <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                  <SelectItem value="popular">Terpopuler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <ProductGrid products={filteredAndSortedProducts} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};