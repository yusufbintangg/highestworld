import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatPrice } from '../../../lib/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const SIZES_PAKAIAN = ['S','M','L','XL','2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL', '10XL'];
const SIZES_CELANA = ['36', '38', '40', '42', '44', '46', '48', '50'];

const emptyVariant = { color: '', color_hex: '#000000', size: '', sku: '', msku: '', stock: 0, price: '', original_price: '', images: '' };

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [existingVariants, setExistingVariants] = useState([]);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variants, setVariants] = useState([{ ...emptyVariant }]);
  const [sizeType, setSizeType] = useState('pakaian');

  const emptyForm = {
    name: '', slug: '', description: '', price: '',
    original_price: '', category_id: '', weight: '',
    images: '', badges: [], is_active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').eq('is_active', true);
    setCategories(data || []);
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const generateSlug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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
    });

    // Load existing variants
    const { data: vars, error } = await supabase
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

  // Variant handlers
  const addVariant = () => setVariants(prev => [...prev, { ...emptyVariant }]);
  const removeVariant = (i) => setVariants(prev => prev.filter((_, idx) => idx !== i));
  const updateVariant = (i, field, value) => {
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  // Update existing variant stock/sku
  const handleUpdateExistingVariant = async (variantId, field, value) => {
    await supabase.from('product_variants').update({ [field]: value }).eq('id', variantId);
    toast.success('Tersimpan!');
  };

  const handleDeleteExistingVariant = async (variantId) => {
    if (!confirm('Hapus varian ini?')) return;
    await supabase.from('product_variants').delete().eq('id', variantId);
    setExistingVariants(prev => prev.filter(v => v.id !== variantId));
    toast.success('Varian dihapus');
  };
  
  const handleOpenEditExistingVariant = (variant) => {
    setEditingVariant({ ...variant });
  };

  const handleSaveEditingVariant = async () => {
    if (!editingVariant) return;
    const { error } = await supabase.from('product_variants').update(editingVariant).eq('id', editingVariant.id);
    if (error) {
      toast.error('Gagal update varian');
      return;
    }
    setExistingVariants(prev =>
      prev.map(v => v.id === editingVariant.id ? editingVariant : v)
    );
    setEditingVariant(null);
    toast.success('Varian diupdate!');
  };


  const toggleBadge = (badge) => {
    setForm(prev => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter(b => b !== badge)
        : [...prev.badges, badge]
    }));
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

    // Insert new variants (yang diisi) - hanya untuk tambah produk baru atau tambah varian baru ke existing product
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
      
      // Reload existing variants jika edit mode
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

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const sizeOptions = sizeType === 'pakaian' ? SIZES_PAKAIAN : SIZES_CELANA;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produk</h1>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Produk
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-10xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editProduct ? 'Edit Produk' : 'Tambah Produk'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Info Dasar */}
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Info Produk</p>
                  <Input
                    placeholder="Nama Produk *"
                    value={form.name}
                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value, slug: generateSlug(e.target.value) }))}
                    required
                  />
                  <Input
                    placeholder="Slug (URL)"
                    value={form.slug}
                    onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))}
                  />
                  <select
                    className="w-full border border-border rounded-md px-3 py-2 bg-background text-sm"
                    value={form.category_id}
                    onChange={(e) => setForm(p => ({ ...p, category_id: e.target.value }))}
                    required
                  >
                    <option value="">Pilih kategori *</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="grid grid-cols-3 gap-3">
                    <Input type="number" placeholder="Harga Jual *" value={form.price} onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))} required />
                    <Input type="number" placeholder="Harga Coret" value={form.original_price} onChange={(e) => setForm(p => ({ ...p, original_price: e.target.value }))} />
                    <Input type="number" placeholder="Berat (gram) *" value={form.weight} onChange={(e) => setForm(p => ({ ...p, weight: e.target.value }))} required />
                  </div>
                  <textarea
                    className="w-full border border-border rounded-md px-3 py-2 bg-background text-sm min-h-[60px]"
                    placeholder="URL Gambar (satu per baris)"
                    value={form.images}
                    onChange={(e) => setForm(p => ({ ...p, images: e.target.value }))}
                  />
                  <textarea
                    className="w-full border border-border rounded-md px-3 py-2 bg-background text-sm min-h-[60px]"
                    placeholder="Deskripsi produk"
                    value={form.description}
                    onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Badges</p>
                    <div className="flex gap-2">
                      {['New', 'Best Seller', 'Sale'].map(badge => (
                        <button key={badge} type="button" onClick={() => toggleBadge(badge)}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${form.badges.includes(badge) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                          {badge}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                    <label htmlFor="is_active" className="text-sm">Produk aktif</label>
                  </div>
                </div>

                {/* Existing Variants (edit mode) */}
                {editProduct && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Varian Existing ({existingVariants.length})</p>
                    {existingVariants.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg text-center">
                        Tidak ada varian. Klik "Tambah Varian Baru" untuk menambahkan.
                      </p>
                    ) : (
                      <div className="border border-border rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="bg-muted/50 grid grid-cols-12 gap-2 p-3 text-xs font-medium text-muted-foreground border-b border-border">
                          <div className="col-span-2">Warna</div>
                          <div className="col-span-1 text-center">Size</div>
                          <div className="col-span-1 text-center">SKU</div>
                          <div className="col-span-1 text-center">MSKU</div>
                          <div className="col-span-2 text-center">Harga</div>
                          <div className="col-span-2 text-center">Coret</div>
                          <div className="col-span-1 text-center">Stok</div>
                          <div className="col-span-2 text-right">Aksi</div>
                        </div>
                        {/* Rows */}
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                          {existingVariants.map((v) => (
                            <div key={v.id} className="grid grid-cols-12 gap-2 p-3 items-center text-xs bg-background hover:bg-muted/50 border-b border-border last:border-b-0">
                              {/* Warna */}
                              <div className="col-span-2 flex items-center gap-2">
                                {v.images && Array.isArray(v.images) && v.images.length > 0 ? (
                                  <img src={v.images[0]} alt={v.color} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full border flex-shrink-0" style={{ backgroundColor: v.color_hex }} />
                                )}
                                <span className="font-medium truncate">{v.color}</span>
                              </div>
                              {/* Size */}
                              <div className="col-span-1 text-center">{v.size}</div>
                              {/* SKU */}
                              <div className="col-span-1 text-center">{v.sku || '-'}</div>
                              {/* MSKU */}
                              <div className="col-span-1 text-center">{v.msku || '-'}</div>
                              {/* Harga */}
                              <div className="col-span-2 text-center">{v.price ? formatPrice(v.price) : '-'}</div>
                              {/* Coret */}
                              <div className="col-span-2 text-center">{v.original_price ? formatPrice(v.original_price) : '-'}</div>
                              {/* Stok */}
                              <div className="col-span-1 text-center font-medium">{v.stock}</div>
                              {/* Aksi */}
                              <div className="col-span-2 flex justify-end gap-1">
                                <button type="button" onClick={() => handleOpenEditExistingVariant(v)} className="p-1 text-primary hover:bg-primary/10 rounded">
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button type="button" onClick={() => handleDeleteExistingVariant(v.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tambah Varian Baru */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {editProduct ? 'Tambah Varian Baru' : 'Varian Produk'}
                    </p>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-muted-foreground">Ukuran:</span>
                      <button type="button" onClick={() => setSizeType('pakaian')}
                        className={`text-xs px-2 py-1 rounded border ${sizeType === 'pakaian' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>
                        Pakaian
                      </button>
                      <button type="button" onClick={() => setSizeType('celana')}
                        className={`text-xs px-2 py-1 rounded border ${sizeType === 'celana' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>
                        Celana
                      </button>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="grid grid-cols-12 gap-1 text-xs text-muted-foreground px-1">
                    <span className="col-span-1 text-center">Warna/Nama Warna</span>
                    <span className="col-span-1 text-center">Size</span>
                    <span className="col-span-2 text-center">SKU</span>
                    <span className="col-span-2 text-center">MSKU</span>
                    <span className="col-span-2 text-center">Harga</span>
                    <span className="col-span-2 text-center">Coret</span>
                    <span className="col-span-2 text-center">Stok</span>
                  </div>

                  {variants.map((v, i) => (
                <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-12 gap-1 items-center">
                    {/* Color Picker/Nama Warna*/}
                    <div className="col-span-1 flex items-center gap-1">
                      <input
                        type="color"
                        value={v.color_hex}
                        onChange={(e) => updateVariant(i, 'color_hex', e.target.value)}
                        className="w-8 h-8 cursor-pointer border border-border"
                      />
                          <Input placeholder="Nama warna" value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} className="h-8 text-xs" />
                    </div>
                        {/* Ukuran */}
                        <div className="col-span-1">
                          <select
                            className="w-full border border-border rounded-md px-2 py-1.5 bg-background text-xs"
                            value={v.size}
                            onChange={(e) => updateVariant(i, 'size', e.target.value)}
                          >
                            <option value="">-</option>
                            {sizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>

                        {/* SKU / MSKU */}
                        <div className="col-span-2">
                          <Input placeholder="SKU e.g. KODE + UKURAN" value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} className="h-7 text-xs" />
                        </div>
                        <div className="col-span-2">
                          <Input placeholder="MSKU e.g. NAMA PRODUCT" value={v.msku} onChange={(e) => updateVariant(i, 'msku', e.target.value)} className="h-7 text-xs" />
                        </div>

                        {/* Harga */}
                        <div className="col-span-2">
                          <Input type="number" placeholder="Harga"  value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} className="h-8 text-xs" />
                        </div>

                        {/* Harga Coret */}
                        <div className="col-span-2">
                          <Input type="number" placeholder="Coret" value={v.original_price} onChange={(e) => updateVariant(i, 'original_price', e.target.value)} className="h-8 text-xs" />
                        </div>

                        {/* Stock */}
                        <div className="col-span-2">
                          <Input type="number" min="0" placeholder="0" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} className="h-8 text-xs text-center" />
                        </div>

                        {/* Delete */}
                        <div className="col-span-2 flex justify-end">
                          {variants.length > 1 && (
                            <button type="button" onClick={() => removeVariant(i)} className="text-destructive hover:opacity-70 p-1">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                        
                      {/* Gambar per warna */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">URL Gambar warna ini (satu per baris)</p>
                        <textarea
                          className="w-full border border-border rounded-md px-2 py-1.5 bg-background text-xs min-h-[50px]"
                          placeholder={"https://...\nhttps://..."}
                          value={v.images || ''}
                          onChange={(e) => updateVariant(i, 'images', e.target.value)}
                        />
                      </div>
                    </div>
                    ))}
                  <button type="button" onClick={addVariant}
                    className="w-full border border-dashed border-border rounded-md py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    + Tambah Varian
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1">{editProduct ? 'Update' : 'Simpan'}</Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Batal</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Variant */}
      {editingVariant && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Edit Varian</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Warna</label>
                    <Input value={editingVariant.color} onChange={(e) => setEditingVariant(p => ({ ...p, color: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hex Color</label>
                    <input type="color" value={editingVariant.color_hex} onChange={(e) => setEditingVariant(p => ({ ...p, color_hex: e.target.value }))} className="w-full h-10 border border-border rounded-md" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Size</label>
                    <Input value={editingVariant.size} onChange={(e) => setEditingVariant(p => ({ ...p, size: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">SKU</label>
                    <Input value={editingVariant.sku || ''} onChange={(e) => setEditingVariant(p => ({ ...p, sku: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">MSKU</label>
                    <Input value={editingVariant.msku || ''} onChange={(e) => setEditingVariant(p => ({ ...p, msku: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stock</label>
                    <Input type="number" value={editingVariant.stock} onChange={(e) => setEditingVariant(p => ({ ...p, stock: parseInt(e.target.value) }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Harga</label>
                    <Input type="number" value={editingVariant.price || ''} onChange={(e) => setEditingVariant(p => ({ ...p, price: parseInt(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Harga Coret</label>
                    <Input type="number" value={editingVariant.original_price || ''} onChange={(e) => setEditingVariant(p => ({ ...p, original_price: parseInt(e.target.value) }))} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">URL Gambar (satu per baris)</label>
                  <textarea 
                    value={editingVariant.images ? (Array.isArray(editingVariant.images) ? editingVariant.images.join('\n') : editingVariant.images) : ''}
                    onChange={(e) => setEditingVariant(p => ({ ...p, images: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))}
                    className="w-full border border-border rounded-md px-3 py-2 bg-background text-sm min-h-[80px]"
                    placeholder="https://...\nhttps://..."
                  />
                  {editingVariant.images && Array.isArray(editingVariant.images) && editingVariant.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {editingVariant.images.slice(0, 4).map((img, i) => (
                        <img key={i} src={img} alt={`Preview ${i}`} className="w-20 h-20 object-cover rounded-lg border border-border" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveEditingVariant} className="flex-1">Simpan</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setEditingVariant(null)}>Batal</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Produk</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Kategori</th>
                <th className="text-left p-3 font-medium">Harga</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Status</th>
                <th className="text-right p-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />}
                      <span className="font-medium line-clamp-1">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{product.categories?.name}</td>
                  <td className="p-3 font-mono">{formatPrice(product.price)}</td>
                  <td className="p-3 hidden md:table-cell">
                    <button onClick={() => handleToggleActive(product.id, product.is_active)}
                      className={`px-2 py-0.5 rounded-full text-xs ${product.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {product.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(product)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">Tidak ada produk ditemukan</div>}
        </div>
      )}
    </div>
  );
};