import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseAdmin';
import { toast } from 'sonner';

const SIZES_PAKAIAN = ['S','M','L','XL','2XL','3XL','4XL','5XL','6XL','7XL','8XL','9XL','10XL'];
const SIZES_CELANA = ['36','38','40','42','44','46','48','50'];

// Berapa lama data dianggap "fresh" (tidak perlu refetch otomatis) dan
// berapa lama tetap disimpan di cache walau tidak dipakai (gcTime).
// Ditulis EKSPLISIT di sini (bukan cuma andalkan default dari
// adminQueryClient di routes.jsx) supaya kontraknya jelas kalau file ini
// dibaca terpisah, dan tidak gampang lupa pas nambah query baru.
const PRODUCTS_STALE_TIME = 1000 * 60 * 5;   // 5 menit
const PRODUCTS_GC_TIME = 1000 * 60 * 10;     // 10 menit
const VARIANTS_STALE_TIME = 1000 * 60 * 5;
const VARIANTS_GC_TIME = 1000 * 60 * 10;

const emptyVariant = {
  color: '', color_hex: '#000000', size: '', sku: '',
  msku: '', stock: 0, price: '', original_price: '', images: '',
};

const emptyForm = {
  name: '', slug: '', description: '', price: '',
  original_price: '', category_id: '', weight: '',
  images: '', badges: [], is_active: true,
  size_chart_image: '', shopee_url: '', tokopedia_url: '',
};

const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function logErr(label, error) {
  console.error(`[useAdminProducts] ${label}:`, {
    message: error?.message,
    code: error?.code,
    status: error?.status,
    details: error?.details,
  });
}

export const useAdminProducts = () => {
  const queryClient = useQueryClient();

  // Fetch products with React Query
  const { data: products = [], isLoading: isLoadingProducts, error: productsError } = useQuery({
    queryKey: ['admin-products'],
    staleTime: PRODUCTS_STALE_TIME,
    gcTime: PRODUCTS_GC_TIME,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        logErr('Fetch products FAILED', error);
        throw error;
      }
      return data || [];
    },
  });

  // Tampilkan error fetch produk secara eksplisit -- jangan diam-diam
  // menunjukkan list kosong seolah-olah memang tidak ada produk.
  if (productsError) {
    console.error('[useAdminProducts] productsError aktif, list mungkin tidak akurat:', productsError.message);
  }

  // Fetch categories with React Query
  const { data: categories = [], error: categoriesError } = useQuery({
    queryKey: ['admin-categories'],
    staleTime: PRODUCTS_STALE_TIME,
    gcTime: PRODUCTS_GC_TIME,
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').eq('is_active', true);
      if (error) {
        logErr('Fetch categories FAILED', error);
        throw error;
      }
      return data || [];
    },
  });

  if (categoriesError) {
    console.error('[useAdminProducts] categoriesError aktif:', categoriesError.message);
  }

  const [search, setSearch] = useState('');

  // Form / modal state
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Variant state (varian BARU yang belum disimpan, diinput di form)
  const [variants, setVariants] = useState([{ ...emptyVariant }]);
  const [editingVariant, setEditingVariant] = useState(null);
  const [sizeType, setSizeType] = useState('pakaian');

  // ============================================================
  // VARIANTS UNTUK PRODUK YANG SEDANG DIEDIT -- sekarang via useQuery
  // dengan key per-product (['admin-product-variants', productId]).
  //
  // SEBELUM: handleOpenEdit fetch manual ke Supabase setiap kali modal
  // dibuka, TANPA cache. Buka-tutup-buka modal produk yang sama = query
  // berulang terus walau datanya belum berubah.
  //
  // SEKARANG: query di-cache per productId. Buka modal produk yang sama
  // dalam rentang VARIANTS_STALE_TIME (5 menit) = TIDAK ada network
  // request baru, langsung pakai data dari cache.
  // `enabled: !!editProduct?.id` -> query hanya jalan kalau memang ada
  // produk yang sedang diedit (modal terbuka), bukan saat mount/idle.
  // ============================================================
  const {
    data: existingVariants = [],
    isLoading: isLoadingVariants,
    error: variantsError,
  } = useQuery({
    queryKey: ['admin-product-variants', editProduct?.id],
    enabled: !!editProduct?.id,
    staleTime: VARIANTS_STALE_TIME,
    gcTime: VARIANTS_GC_TIME,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', editProduct.id)
        .order('color');

      if (error) {
        logErr(`Fetch variants FAILED untuk product ${editProduct?.id}`, error);
        throw error;
      }
      return data || [];
    },
  });

  if (variantsError) {
    console.error('[useAdminProducts] variantsError aktif:', variantsError.message);
  }

  // ─── Product CRUD ─────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setVariants([{ ...emptyVariant }]);
    setShowForm(true);
  };

  // Tidak lagi async-fetch manual di sini. Cukup set editProduct, dan
  // useQuery di atas otomatis jalan (atau ambil dari cache kalau sudah
  // pernah di-fetch sebelumnya dalam staleTime).
  const handleOpenEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price,
      original_price: product.original_price || '',
      category_id: product.category_id,
      weight: product.weight,
      images: (product.images || []).join('\n'),
      badges: product.badges || [],
      is_active: product.is_active,
      size_chart_image: product.size_chart_image || '',
      shopee_url: product.shopee_url || '',
      tokopedia_url: product.tokopedia_url || '',
    });
    setVariants([{ ...emptyVariant }]);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus produk ini? Semua varian juga akan terhapus.')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      logErr(`Delete product ${id} FAILED`, error);
      toast.error(`Gagal hapus produk: ${error.message}`);
      return;
    }
    toast.success('Produk dihapus');
    // Delete mengubah jumlah baris -> perlu data fresh dari server, jadi
    // invalidate (refetch) memang tepat di sini, bukan optimistic update.
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  };

  // ============================================================
  // OPTIMISTIC UPDATE -- TANPA REFETCH PENUH.
  //
  // SEBELUM: toggle status aktif/nonaktif memanggil invalidateQueries,
  // yang me-refetch SEMUA produk dari server walau cuma 1 boolean yang
  // berubah. Kalau produk sudah ratusan, ini query yang sia-sia dan
  // bikin UI kerasa lambat (nunggu round-trip network sebelum berubah).
  //
  // SEKARANG: update langsung ke React Query cache via setQueryData,
  // UI berubah instan. Kalau request ke Supabase gagal, cache di-revert
  // ke nilai semula dan user diberi tahu via toast -- TIDAK ada state
  // yang "diam-diam" salah karena gagal ditangani.
  // ============================================================
  const handleToggleActive = async (id, currentStatus) => {
    const newStatus = !currentStatus;

    // Simpan snapshot sebelum diubah, untuk rollback kalau gagal.
    const previousProducts = queryClient.getQueryData(['admin-products']);

    queryClient.setQueryData(['admin-products'], (old = []) =>
      old.map((p) => (p.id === id ? { ...p, is_active: newStatus } : p))
    );

    const { error } = await supabase
      .from('products')
      .update({ is_active: newStatus })
      .eq('id', id);

    if (error) {
      logErr(`Toggle active product ${id} FAILED`, error);
      toast.error(`Gagal ubah status produk: ${error.message}`);
      // ROLLBACK -- penting supaya UI tidak menampilkan status yang
      // sebenarnya gagal disimpan ke server.
      queryClient.setQueryData(['admin-products'], previousProducts);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      description: form.description,
      price: parseInt(form.price),
      original_price: form.original_price ? parseInt(form.original_price) : null,
      category_id: form.category_id,
      weight: parseInt(form.weight),
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      badges: form.badges,
      is_active: form.is_active,
      size_chart_image: form.size_chart_image.trim() || null,
      shopee_url: form.shopee_url.trim() || null,
      tokopedia_url: form.tokopedia_url.trim() || null,
    };

    let productId = editProduct?.id;

    if (editProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editProduct.id);
      if (error) {
        logErr(`Update product ${editProduct.id} FAILED`, error);
        toast.error(`Gagal update produk: ${error.message}`);
        return;
      }
      toast.success('Produk diupdate!');
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select().single();
      if (error) {
        logErr('Insert product FAILED', error);
        toast.error(`Gagal tambah produk: ${error.message}`);
        return;
      }
      productId = data.id;
      toast.success('Produk ditambahkan!');
    }

    // Insert new variants
    const validVariants = variants.filter(v => v.color && v.size);
    if (validVariants.length > 0) {
      const variantPayload = validVariants.map(v => ({
        product_id: productId,
        color: v.color,
        color_hex: v.color_hex,
        size: v.size,
        sku: v.sku || null,
        msku: v.msku || null,
        stock: parseInt(v.stock) || 0,
        price: v.price ? parseInt(v.price) : null,
        original_price: v.original_price ? parseInt(v.original_price) : null,
        images: v.images ? v.images.split('\n').map(s => s.trim()).filter(Boolean) : [],
      }));
      const { error: variantInsertError } = await supabase.from('product_variants').insert(variantPayload);
      if (variantInsertError) {
        logErr(`Insert variants FAILED untuk product ${productId}`, variantInsertError);
        toast.error(`Gagal simpan varian: ${variantInsertError.message}`);
        return;
      }
      if (!editProduct) toast.success('Varian ditambahkan!');
    }

    setShowForm(false);
    // Produk + (mungkin) varian baru saja berubah di server -> invalidate
    // kedua cache yang relevan supaya admin lihat data ter-update.
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    if (productId) {
      queryClient.invalidateQueries({ queryKey: ['admin-product-variants', productId] });
    }
  };

  // ─── Variant CRUD (form input untuk varian BARU, belum disimpan) ──────
  const addVariant = () => setVariants(prev => [...prev, { ...emptyVariant }]);
  const removeVariant = (i) => setVariants(prev => prev.filter((_, idx) => idx !== i));
  const updateVariant = (i, field, value) =>
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));

  // ─── Existing variant CRUD (varian yang sudah tersimpan di DB) ────────
  const handleDeleteExistingVariant = async (variantId) => {
    if (!confirm('Hapus varian ini?')) return;
    const { error } = await supabase.from('product_variants').delete().eq('id', variantId);
    if (error) {
      logErr(`Delete variant ${variantId} FAILED`, error);
      toast.error(`Gagal hapus varian: ${error.message}`);
      return;
    }
    // Update cache langsung -- tidak perlu refetch network untuk hapus 1 baris.
    if (editProduct?.id) {
      queryClient.setQueryData(['admin-product-variants', editProduct.id], (old = []) =>
        old.filter((v) => v.id !== variantId)
      );
    }
    toast.success('Varian dihapus');
  };

  const handleOpenEditExistingVariant = (variant) => setEditingVariant({ ...variant });

  const handleSaveEditingVariant = async () => {
    if (!editingVariant) return;
    const { error } = await supabase
      .from('product_variants')
      .update(editingVariant)
      .eq('id', editingVariant.id);

    if (error) {
      logErr(`Update variant ${editingVariant.id} FAILED`, error);
      toast.error(`Gagal update varian: ${error.message}`);
      return;
    }

    // Update cache langsung dengan data yang baru disimpan.
    if (editProduct?.id) {
      queryClient.setQueryData(['admin-product-variants', editProduct.id], (old = []) =>
        old.map((v) => (v.id === editingVariant.id ? editingVariant : v))
      );
    }
    setEditingVariant(null);
    toast.success('Varian diupdate!');
  };

  // ─── Misc ─────────────────────────────────────────────────────────────
  const toggleBadge = (badge) => {
    setForm(prev => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter(b => b !== badge)
        : [...prev.badges, badge],
    }));
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const sizeOptions = sizeType === 'pakaian' ? SIZES_PAKAIAN : SIZES_CELANA;

  return {
    // Data
    filtered, categories, loading: isLoadingProducts, search, setSearch,
    productsError, categoriesError,
    // Form modal
    showForm, setShowForm, editProduct, form, setForm,
    handleOpenAdd, handleOpenEdit, handleDelete, handleToggleActive, handleSubmit,
    // Badges
    toggleBadge,
    // New variants
    variants, sizeType, setSizeType, sizeOptions,
    addVariant, removeVariant, updateVariant,
    // Existing variants (sekarang dari useQuery cache)
    existingVariants, isLoadingVariants, variantsError,
    handleDeleteExistingVariant, handleOpenEditExistingVariant,
    // Edit variant modal
    editingVariant, setEditingVariant,
    handleSaveEditingVariant,
    // Helpers
    generateSlug,
  };
};