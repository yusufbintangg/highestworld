import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const ProductFormModal = ({
  editProduct, form, setForm,
  categories, toggleBadge,
  variants, sizeType, setSizeType, sizeOptions,
  addVariant, removeVariant, updateVariant,
  existingVariants,
  handleDeleteExistingVariant, handleOpenEditExistingVariant,
  handleSubmit, onClose,
  generateSlug,
}) => {
  const [previewImages, setPreviewImages] = useState([]);

  // Update preview function (like EditVariantModal)
  const updatePreviewImages = useCallback((imagesText) => {
    const urls = (imagesText || '')
      .split('\n')
      .map(url => url.trim())
      .filter(url => url);
    setPreviewImages(urls.slice(0, 8));
  }, []);

  // Initial load + watch form.images changes
  useEffect(() => {
    updatePreviewImages(form.images);
  }, [form.images, updatePreviewImages]);

  const handleImageError = (index) => {
    setPreviewImages(prev => {
      const newImages = [...prev];
      newImages[index] = null;
      return newImages;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-8xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editProduct ? 'Edit Produk' : 'Tambah Produk'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Info Produk ─────────────────────────────────────── */}
            <section className="space-y-3">
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
                <Input type="number" placeholder="Harga Jual *" value={form.price}
                  onChange={(e) => setForm(p => ({ ...p, price: parseInt(e.target.value) || 0 }))} required />
                <Input type="number" placeholder="Harga Coret" value={form.original_price}
                  onChange={(e) => setForm(p => ({ ...p, original_price: parseInt(e.target.value) || 0 }))} />
                <Input type="number" placeholder="Berat (gram) *" value={form.weight}
                  onChange={(e) => setForm(p => ({ ...p, weight: parseInt(e.target.value) || 0 }))} required />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block uppercase tracking-wider">
                  URL Gambar Produk (satu per baris)
                </label>
                <textarea
                  className="w-full border border-border rounded-md px-3 py-2 bg-background text-sm min-h-[100px]"
                  placeholder="https://example.com/img1.jpg
https://example.com/img2.jpg"
                  value={form.images}
                  onChange={(e) => {
                    setForm(p => ({ ...p, images: e.target.value }));
                    updatePreviewImages(e.target.value);
                  }}
                />
                {/* Images Preview Grid */}
                {previewImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {previewImages.map((img, i) => (
                      img && (
                        <div key={i} className="relative group">
                          <img 
                            src={img} 
                            alt={`Preview ${i + 1}`}
                            className="w-full aspect-square object-cover rounded-lg border border-border shadow-sm"
                            onError={() => handleImageError(i)}
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => {
                              const lines = form.images.split('\n');
                              lines.splice(i, 1);
                              const newImages = lines.join('\n');
                              setForm(p => ({ ...p, images: newImages }));
                              updatePreviewImages(newImages);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>

              <textarea
                className="w-full border border-border rounded-md px-3 py-2 bg-background text-sm min-h-[220px]"
                placeholder="Deskripsi produk"
                value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              />

              {/* Badges */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Badges</p>
                <div className="flex gap-2 flex-wrap">
                  {['New', 'Best Seller', 'Sale'].map(badge => (
                    <button key={badge} type="button" onClick={() => toggleBadge(badge)}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                        form.badges?.includes(badge)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground'
                      }`}>
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={form.is_active || false}
                  onChange={(e) => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                <label htmlFor="is_active" className="text-sm">Produk aktif</label>
              </div>
            </section>

            {/* ── Link Marketplace & Size Chart ───────────────────── */}
            <section className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Link & Size Chart</p>
              <Input
                placeholder="URL Size Chart (gambar)"
                value={form.size_chart_image}
                onChange={(e) => setForm(p => ({ ...p, size_chart_image: e.target.value }))}
              />
              {form.size_chart_image && (
                <img src={form.size_chart_image} alt="Size Chart Preview"
                  className="h-40 object-contain rounded-md border border-border" />
              )}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="URL Toko Shopee"
                  value={form.shopee_url}
                  onChange={(e) => setForm(p => ({ ...p, shopee_url: e.target.value }))}
                />
                <Input
                  placeholder="URL Toko Tokopedia"
                  value={form.tokopedia_url}
                  onChange={(e) => setForm(p => ({ ...p, tokopedia_url: e.target.value }))}
                />
              </div>
            </section>

            {/* ── Existing Variants (edit mode only) ──────────────── */}
            {editProduct && existingVariants?.length > 0 && (
              <section className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Varian Existing ({existingVariants.length})
                </p>
                <div className="border border-border rounded-lg overflow-hidden">
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
                  <div className="space-y-1 max-h-180 overflow-y-auto">
                    {existingVariants.map((v) => (
                      <div key={v.id} className="grid grid-cols-12 gap-2 p-3 items-center text-xs bg-background hover:bg-muted/50 border-b border-border last:border-b-0">
                        <div className="col-span-2 flex items-center gap-2">
                          {v.images?.length > 0
                            ? <img src={v.images[0]} alt={v.color} className="w-24 h-24 object-cover flex-shrink-0" />
                            : <div className="w-12 h-12 flex-shrink-0" style={{ backgroundColor: v.color_hex }} />
                          }
                          <span className="font-medium truncate">{v.color}</span>
                        </div>
                        <div className="col-span-1 text-center">{v.size}</div>
                        <div className="col-span-1 text-center">{v.sku || '-'}</div>
                        <div className="col-span-1 text-center">{v.msku || '-'}</div>
                        <div className="col-span-2 text-center">{v.price ? v.price.toLocaleString() : '-'}</div>
                        <div className="col-span-2 text-center">{v.original_price ? v.original_price.toLocaleString() : '-'}</div>
                        <div className="col-span-1 text-center font-medium">{v.stock}</div>
                        <div className="col-span-2 flex justify-end gap-1">
                          <button type="button" onClick={() => handleOpenEditExistingVariant(v)}
                            className="p-1 text-primary hover:bg-primary/10 rounded text-xs">✏️</button>
                          <button type="button" onClick={() => handleDeleteExistingVariant(v.id)}
                            className="p-1 text-destructive hover:bg-destructive/10 rounded">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── Tambah Varian Baru ───────────────────────────────── */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {editProduct ? 'Tambah Varian Baru' : 'Varian Produk'}
                </p>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground">Ukuran:</span>
                  {['pakaian', 'celana'].map(t => (
                    <button key={t} type="button" onClick={() => setSizeType(t)}
                      className={`text-xs px-2 py-1 rounded border capitalize ${
                        sizeType === t ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Variant header */}
              <div className="grid grid-cols-12 gap-1 text-xs text-muted-foreground px-1">
                <span className="col-span-1 text-center">Warna</span>
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
                    <div className="col-span-1 flex items-center gap-1">
                      <input type="color" value={v.color_hex}
                        onChange={(e) => updateVariant(i, 'color_hex', e.target.value)}
                        className="w-8 h-8 cursor-pointer border border-border" />
                      <Input placeholder="Nama warna" value={v.color}
                        onChange={(e) => updateVariant(i, 'color', e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div className="col-span-1">
                      <select className="w-full border border-border rounded-md px-2 py-1.5 bg-background text-xs"
                        value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)}>
                        <option value="">-</option>
                        {sizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Input placeholder="SKU" value={v.sku}
                        onChange={(e) => updateVariant(i, 'sku', e.target.value)} className="h-7 text-xs" />
                    </div>
                    <div className="col-span-2">
                      <Input placeholder="MSKU" value={v.msku}
                        onChange={(e) => updateVariant(i, 'msku', e.target.value)} className="h-7 text-xs" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" placeholder="Harga" value={v.price}
                        onChange={(e) => updateVariant(i, 'price', parseInt(e.target.value) || 0)} className="h-8 text-xs" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" placeholder="Coret" value={v.original_price}
                        onChange={(e) => updateVariant(i, 'original_price', parseInt(e.target.value) || 0)} className="h-8 text-xs" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" min="0" placeholder="0" value={v.stock}
                        onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value) || 0)} className="h-8 text-xs text-center" />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      {variants.length > 1 && (
                        <button type="button" onClick={() => removeVariant(i)}
                          className="text-destructive hover:opacity-70 p-1">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Gambar per warna */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">URL Gambar warna ini (satu per baris)</p>
                    <textarea
                      className="w-full border border-border rounded-md px-2 py-1.5 bg-background text-xs min-h-[120px]"
                      placeholder="https://...\nhttps://..."
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
            </section>

            {/* Sticky buttons */}
            <div className="sticky bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 z-10 -mb-20 mt-4">
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">{editProduct ? 'Update' : 'Simpan'}</Button>
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


