import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * Custom hook buat search SINGLE product by name
 * - Input: search query string
 * - Output: { product, loading, error }
 * 
 * LOGIC:
 * 1. ILIKE '%query%' → case-insensitive partial match
 * 2. LIMIT 1 → ambil product pertama (best match)
 * 3. Return null kalo ga ada → Navbar handle fallback
 */
export const useProductSearch = (query) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchProduct = useCallback(async (searchQuery) => {
    if (!searchQuery?.trim()) {
      setProduct(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_active', true)
        .ilike('name', `%${searchQuery.trim()}%`)
        .limit(1)
        .single();

      if (supabaseError && supabaseError.code !== 'PGRST116') { // PGRST116 = no rows
        throw supabaseError;
      }

      setProduct(data || null);
    } catch (err) {
      console.error('Product search error:', err);
      setError(err.message);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchProduct(query);
  }, [query, searchProduct]);

  return { product, loading, error, searchProduct };
};

