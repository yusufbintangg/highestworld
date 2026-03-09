import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Search, Save, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

// Urutan ukuran untuk sorting
const SIZE_ORDER = {
  'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 
  '2XL': 6, '3XL': 7, '4XL': 8, '5XL': 9, '6XL': 10,
  '2X': 6, '3X': 7, '4X': 8, '5X': 9, '6X': 10
};

const getSizeOrder = (size) => {
  const upperSize = (size || '').toUpperCase().trim();
  return SIZE_ORDER[upperSize] || 99;
};

export const AdminStock = () => {
  const [variants, setVariants] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [editedStocks, setEditedStocks] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const { data: prods } = await supabase
      .from('products')
      .select('id, name, price, original_price')
      .eq('is_active', true)
      .order('name');

    const { data: vars } = await supabase
      .from('product_variants')
      .select('*, products(id, name, price, original_price)')
      .order('products(name)');

    setProducts(prods || []);
    setVariants(vars || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleStockChange = (variantId, value) => {
    setEditedStocks(prev => ({ ...prev, [variantId]: value }));
  };

  const handleAdjust = (variantId, currentStock, delta) => {
    const current = editedStocks[variantId] !== undefined
      ? parseInt(editedStocks[variantId])
      : currentStock;
    const newVal = Math.max(0, current + delta);
    setEditedStocks(prev => ({ ...prev, [variantId]: newVal }));
  };

  const handleSaveAll = async () => {
    if (Object.keys(editedStocks).length === 0) {
      toast.info('Tidak ada perubahan');
      return;
    }
    setSaving(true);

    const updates = Object.entries(editedStocks).map(([id, stock]) =>
      supabase.from('product_variants').update({ stock: parseInt(stock) }).eq('id', id)
    );

    await Promise.all(updates);
    toast.success(`${Object.keys(editedStocks).length} varian berhasil diupdate!`);
    setEditedStocks({});
    setSaving(false);
    fetchData();
  };

  // Group variants by product
  const filtered = variants.filter(v => {
    const matchSearch = !search ||
      v.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.sku?.toLowerCase().includes(search.toLowerCase()) ||
      v.msku?.toLowerCase().includes(search.toLowerCase()) ||
      v.color?.toLowerCase().includes(search.toLowerCase());
    const matchProduct = filterProduct === 'all' || v.products?.id === filterProduct;
    return matchSearch && matchProduct;
  });

  // Sort variants: by color (alphabetically), then by size
  const sortedVariants = [...filtered].sort((a, b) => {
    const colorA = (a.color || '').toLowerCase();
    const colorB = (b.color || '').toLowerCase();
    if (colorA !== colorB) return colorA.localeCompare(colorB);
    return getSizeOrder(a.size) - getSizeOrder(b.size);
  });

  const grouped = sortedVariants.reduce((acc, v) => {
    const prodId = v.products?.id;
    if (!acc[prodId]) acc[prodId] = { name: v.products?.name, price: v.products?.price, original_price: v.products?.original_price, variants: [] };
    acc[prodId].variants.push(v);
    return acc;
  }, {});

  const hasChanges = Object.keys(editedStocks).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Stock</h1>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk, SKU, warna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="border border-border rounded-md px-3 py-2 bg-background text-sm"
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
        >
          <option value="all">Semua Produk</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-t-lg text-xs font-medium text-muted-foreground uppercase">
        <div className="col-span-3">Produk</div>
        <div className="col-span-2">Warna</div>
        <div className="col-span-1">Ukuran</div>
        <div className="col-span-2">SKU</div>
        <div className="col-span-2">Harga</div>
        <div className="col-span-2">Stock</div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(grouped).map(([prodId, group]) => (
            <div key={prodId} className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Product Header */}
              <div className="px-4 py-3 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="font-medium text-sm">{group.name}</h3>
                <div className="flex items-center gap-2">
                  {group.original_price && group.original_price > group.price ? (
                    <>
                      <span className="text-sm font-mono text-muted-foreground line-through">
                        {formatPrice(group.original_price)}
                      </span>
                      <span className="text-sm font-mono text-accent-gold font-semibold">
                        {formatPrice(group.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-mono text-accent-gold font-semibold">
                      {formatPrice(group.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Variants */}
              <div className="divide-y divide-border">
                {group.variants.map((variant) => {
                  const currentStock = editedStocks[variant.id] !== undefined
                    ? editedStocks[variant.id]
                    : variant.stock;
                  const isEdited = editedStocks[variant.id] !== undefined;
                  const variantPrice = variant.price || group.price;
                  const variantOriginalPrice = variant.original_price || group.original_price;

                  return (
                    <div key={variant.id} className="p-3 grid grid-cols-1 md:grid-cols-12 gap-3 md:items-center">
                      {/* Produk (hidden on mobile, shown in header) */}
                      <div className="hidden md:block col-span-3 text-sm truncate">
                        {variant.products?.name}
                      </div>

                      {/* Warna */}
                      <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full border border-border flex-shrink-0"
                          style={{ backgroundColor: variant.color_hex || '#888' }}
                        />
                        <span className="text-sm md:hidden">{variant.color}</span>
                        <span className="hidden md:block text-sm">{variant.color}</span>
                      </div>

                      {/* Ukuran */}
                      <div className="col-span-1 md:col-span-1">
                        <span className="text-sm font-medium">{variant.size}</span>
                      </div>

                      {/* SKU */}
                      <div className="col-span-1 md:col-span-2 flex gap-2">
                        <span className="text-xs text-muted-foreground md:hidden">SKU:</span>
                        <span className="text-xs font-mono">{variant.sku || '-'}</span>
                      </div>

                      {/* Harga */}
                      <div className="col-span-1 md:col-span-2">
                        {variantOriginalPrice && variantOriginalPrice > variantPrice ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(variantOriginalPrice)}
                            </span>
                            <span className="text-sm font-mono text-accent-gold font-semibold">
                              {formatPrice(variantPrice)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-mono text-accent-gold font-semibold">
                            {formatPrice(variantPrice)}
                          </span>
                        )}
                      </div>

                      {/* Stock Control */}
                      <div className="col-span-1 md:col-span-2 flex items-center gap-1 md:justify-end">
                        <button
                          onClick={() => handleAdjust(variant.id, variant.stock, -1)}
                          className="w-6 h-6 md:w-7 md:h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <Input
                          type="number"
                          value={currentStock}
                          onChange={(e) => handleStockChange(variant.id, e.target.value)}
                          className={`w-12 md:w-16 h-7 md:h-8 text-center text-sm font-mono ${isEdited ? 'border-accent-gold text-accent-gold' : ''}`}
                          min={0}
                        />
                        <button
                          onClick={() => handleAdjust(variant.id, variant.stock, 1)}
                          className="w-6 h-6 md:w-7 md:h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        {/* Stock status */}
                        <span className={`text-[10px] md:text-xs px-1 md:px-2 py-0.5 rounded-full w-14 md:w-16 text-center flex-shrink-0 ${
                          currentStock == 0
                            ? 'bg-red-500/10 text-red-500'
                            : currentStock < 5
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-green-500/10 text-green-500'
                        }`}>
                          {currentStock == 0 ? 'Habis' : currentStock < 5 ? 'Hampir' : 'Aman'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {Object.keys(grouped).length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-lg">
              Tidak ada varian ditemukan
            </div>
          )}
        </div>
      )}

      {/* Save Button Bottom */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button onClick={handleSaveAll} disabled={saving} size="lg" className="shadow-lg">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Menyimpan...' : `Simpan ${Object.keys(editedStocks).length} Perubahan`}
          </Button>
        </div>
      )}
    </div>
  );
};
