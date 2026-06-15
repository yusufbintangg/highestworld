import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseAdmin';
import { toast } from 'sonner';

// Helper: Ensure token is fresh before queries
const ensureTokenFresh = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw new Error('No active session');
    }
    
    // If token expires in < 30s, refresh it now
    const expiresAt = data.session.expires_at;
    const expiresIn = expiresAt ? (expiresAt * 1000 - Date.now()) / 1000 : 0;
    
    if (expiresIn < 30) {
      console.log(`Token expires soon (${expiresIn.toFixed(0)}s), refreshing...`);
      const { data: refreshed, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      console.log('Token refreshed successfully');
      return refreshed.session;
    }
    
    return data.session;
  } catch (err) {
    console.error('Failed to ensure token fresh:', err);
    throw err;
  }
};

const SIZES_PAKAIAN = ['S','M','L','XL','2XL','3XL','4XL','5XL','6XL','7XL','8XL','9XL','10XL'];
const SIZES_CELANA = ['36','38','40','42','44','46','48','50'];

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

export const useAdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form / modal state
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Variant state
  const [variants, setVariants] = useState([{ ...emptyVariant }]);
  const [existingVariants, setExistingVariants] = useState([]);
  const [editingVariant, setEditingVariant] = useState(null);
  const [sizeType, setSizeType] = useState('pakaian');

  // ─── Fetch ───────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    const timeoutId = setTimeout(() => {
      console.error('fetchProducts timeout - Supabase tidak merespons dalam 12s');
      toast.error('Request timeout saat load produk (Supabase tidak merespons)');
      setProducts([]);
      setLoading(false);
    }, 12000);

    try {
      console.log('Ensuring token is fresh...');
      await ensureTokenFresh();
      
      console.log('Fetching products from admin client...');
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error response:', {
          message: error.message,
          code: error.code,
          status: error.status,
          details: error.details
        });
        throw error;
      }
      console.log('Products fetched successfully:', data?.length || 0);
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products:', {
        message: err.message,
        code: err.code,
        status: err.status,
        details: err.details
      });
      toast.error(`Gagal load produk: ${err.message}`);
      setProducts([]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').eq('is_active', true);
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      toast.error('Gagal load kategori');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ─── Product CRUD ─────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setVariants([{ ...emptyVariant }]);
    setExistingVariants([]);
    setShowForm(true);
  };

  const handleOpenEdit = async (product) => {
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

    const { data: vars } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id)
      .order('color');

    setExistingVariants(vars || []);
    setVariants([{ ...emptyVariant }]);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus produk ini? Semua varian juga akan terhapus.')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error('Gagal hapus produk'); return; }
    toast.success('Produk dihapus');
    fetchProducts();
  };

  const handleToggleActive = async (id, currentStatus) => {
    await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id);
    fetchProducts();
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
      if (error) { toast.error('Gagal update produk'); return; }
      toast.success('Produk diupdate!');
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select().single();
      if (error) { toast.error('Gagal tambah produk: ' + error.message); return; }
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
      const { error } = await supabase.from('product_variants').insert(variantPayload);
      if (error) { toast.error('Gagal simpan varian: ' + error.message); return; }
      if (!editProduct) toast.success('Varian ditambahkan!');

      if (editProduct) {
        const { data: vars } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productId)
          .order('color');
        setExistingVariants(vars || []);
      }
    }

    setShowForm(false);
    fetchProducts();
  };

  // ─── Variant CRUD ─────────────────────────────────────────────────────
  const addVariant = () => setVariants(prev => [...prev, { ...emptyVariant }]);
  const removeVariant = (i) => setVariants(prev => prev.filter((_, idx) => idx !== i));
  const updateVariant = (i, field, value) =>
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));

  const handleDeleteExistingVariant = async (variantId) => {
    if (!confirm('Hapus varian ini?')) return;
    await supabase.from('product_variants').delete().eq('id', variantId);
    setExistingVariants(prev => prev.filter(v => v.id !== variantId));
    toast.success('Varian dihapus');
  };

  const handleOpenEditExistingVariant = (variant) => setEditingVariant({ ...variant });

  const handleSaveEditingVariant = async () => {
    if (!editingVariant) return;
    const { error } = await supabase.from('product_variants').update(editingVariant).eq('id', editingVariant.id);
    if (error) { toast.error('Gagal update varian'); return; }
    setExistingVariants(prev => prev.map(v => v.id === editingVariant.id ? editingVariant : v));
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
    filtered, categories, loading, search, setSearch,
    // Form modal
    showForm, setShowForm, editProduct, form, setForm,
    handleOpenAdd, handleOpenEdit, handleDelete, handleToggleActive, handleSubmit,
    // Badges
    toggleBadge,
    // New variants
    variants, sizeType, setSizeType, sizeOptions,
    addVariant, removeVariant, updateVariant,
    // Existing variants
    existingVariants,
    handleDeleteExistingVariant, handleOpenEditExistingVariant,
    // Edit variant modal
    editingVariant, setEditingVariant,
    handleSaveEditingVariant,
    // Helpers
    generateSlug,
  };
};
