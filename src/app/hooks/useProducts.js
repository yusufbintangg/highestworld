import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

const PRODUCTS_PER_PAGE = 18;

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortBy, setSortBy] = useState('newest');
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [filters, setFilters] = useState({ category: 'all', badges: [] });

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  // Fetch categories sekali saja
  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => { if (data) setCategories(data); });
  }, []);

  // Baca URL params saat mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categorySlug = urlParams.get('category');
    const page = parseInt(urlParams.get('page')) || 1;
    if (categorySlug && categorySlug !== 'all') {
      setFilters(prev => ({ ...prev, category: categorySlug }));
    }
    setCurrentPage(page);
  }, []);

  // Fetch produk — server-side filter + sort + pagination
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*, categories(name, slug)', { count: 'exact' })
        .eq('is_active', true);

      // Filter kategori
      if (filters.category !== 'all') {
        const cat = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.category)
          .single();
        if (cat.data?.id) {
          query = query.eq('category_id', cat.data.id);
        }
      }

      // Filter badges (client-side karena array contains)
      // Filter hide sold out
      if (hideSoldOut) {
        query = query.gt('total_stock', 0);
      }

      // Sort
      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Pagination — range berbasis 0
      const from = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      // Filter badges client-side (Supabase belum support array contains langsung di kolom JSONB)
      let result = data || [];
      if (filters.badges.length > 0) {
        result = result.filter(p => filters.badges.every(b => p.badges?.includes(b)));
      }

      setProducts(result);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('fetchProducts error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, hideSoldOut, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL params
  const updateURL = (category, page) => {
    const url = new URL(window.location);
    if (category && category !== 'all') {
      url.searchParams.set('category', category);
    } else {
      url.searchParams.delete('category');
    }
    if (page && page > 1) {
      url.searchParams.set('page', page);
    } else {
      url.searchParams.delete('page');
    }
    window.history.replaceState({}, '', url);
  };

  const handleCategoryFilter = (slug) => {
    setFilters(prev => ({ ...prev, category: slug }));
    setCurrentPage(1);
    updateURL(slug, 1);
  };

  const handleBadgeFilter = (badge, checked) => {
    setFilters(prev => ({
      ...prev,
      badges: checked ? [...prev.badges, badge] : prev.badges.filter(b => b !== badge),
    }));
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleHideSoldOut = (value) => {
    setHideSoldOut(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURL(filters.category, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilters({ category: 'all', badges: [] });
    setHideSoldOut(false);
    setCurrentPage(1);
    updateURL('all', 1);
  };

  const hasActiveFilters = filters.category !== 'all' || filters.badges.length > 0 || hideSoldOut;

  return {
    products, categories, loading,
    totalCount, totalPages, currentPage, PRODUCTS_PER_PAGE,
    sortBy, hideSoldOut, filters, hasActiveFilters,
    handleCategoryFilter, handleBadgeFilter,
    handleSortChange, handleHideSoldOut,
    handlePageChange, resetFilters,
  };
};
