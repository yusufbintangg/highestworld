import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export const EditVariantModal = ({ editingVariant, setEditingVariant, onSave }) => {
  if (!editingVariant) return null;

  const update = (field, value) => setEditingVariant(p => ({ ...p, [field]: value }));

  const imagesValue = editingVariant.images
    ? (Array.isArray(editingVariant.images) ? editingVariant.images.join('\n') : editingVariant.images)
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Edit Varian</h2>
          <div className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Warna</label>
                <Input value={editingVariant.color} onChange={(e) => update('color', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Hex Color</label>
                <input type="color" value={editingVariant.color_hex}
                  onChange={(e) => update('color_hex', e.target.value)}
                  className="w-full h-10 border border-border rounded-md" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Size</label>
                <Input value={editingVariant.size} onChange={(e) => update('size', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input value={editingVariant.sku || ''} onChange={(e) => update('sku', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">MSKU</label>
                <Input value={editingVariant.msku || ''} onChange={(e) => update('msku', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <Input type="number" value={editingVariant.stock}
                  onChange={(e) => update('stock', parseInt(e.target.value))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Harga</label>
                <Input type="number" value={editingVariant.price || ''}
                  onChange={(e) => update('price', parseInt(e.target.value))} />
              </div>
              <div>
                <label className="text-sm font-medium">Harga Coret</label>
                <Input type="number" value={editingVariant.original_price || ''}
                  onChange={(e) => update('original_price', parseInt(e.target.value))} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">URL Gambar (satu per baris)</label>
              <textarea
                value={imagesValue}
                onChange={(e) => update('images', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                className="w-full border border-border rounded-md px-3 py-2 bg-background text-sm min-h-[160px]"
                placeholder="https://..."
              />
              {Array.isArray(editingVariant.images) && editingVariant.images.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {editingVariant.images.slice(0, 4).map((img, i) => (
                    <img key={i} src={img} alt={`Preview ${i}`}
                      className="w-40 h-40 object-cover rounded-lg border border-border" />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={onSave} className="flex-1">Simpan</Button>
              <Button variant="outline" className="flex-1" onClick={() => setEditingVariant(null)}>Batal</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
