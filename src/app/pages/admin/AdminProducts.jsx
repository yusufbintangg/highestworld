import { Plus, Search } from 'lucide-react';
import { formatPrice } from '../../../lib/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { EditVariantModal } from '../../components/admin/EditVariantModal';

export const AdminProducts = () => {
  const {
    filtered, categories, loading, search, setSearch,
    showForm, setShowForm, editProduct, form, setForm,
    handleOpenAdd, handleOpenEdit, handleDelete, handleToggleActive, handleSubmit,
    toggleBadge, generateSlug,
    variants, sizeType, setSizeType, sizeOptions,
    addVariant, removeVariant, updateVariant,
    existingVariants,
    handleDeleteExistingVariant, handleOpenEditExistingVariant,
    editingVariant, setEditingVariant, handleSaveEditingVariant,
  } = useAdminProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produk</h1>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Produk
        </Button>
      </div>

      {/* Search */}
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
        <ProductFormModal
          editProduct={editProduct}
          form={form}
          setForm={setForm}
          categories={categories}
          toggleBadge={toggleBadge}
          generateSlug={generateSlug}
          variants={variants}
          sizeType={sizeType}
          setSizeType={setSizeType}
          sizeOptions={sizeOptions}
          addVariant={addVariant}
          removeVariant={removeVariant}
          updateVariant={updateVariant}
          existingVariants={existingVariants}
          handleDeleteExistingVariant={handleDeleteExistingVariant}
          handleOpenEditExistingVariant={handleOpenEditExistingVariant}
          handleSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Edit Variant Modal */}
      <EditVariantModal
        editingVariant={editingVariant}
        setEditingVariant={setEditingVariant}
        onSave={handleSaveEditingVariant}
      />

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
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
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.name}
                          className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      )}
                      <span className="font-medium line-clamp-1">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">
                    {product.categories?.name}
                  </td>
                  <td className="p-3 font-mono">{formatPrice(product.price)}</td>
                  <td className="p-3 hidden md:table-cell">
                    <button
                      onClick={() => handleToggleActive(product.id, product.is_active)}
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        product.is_active
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                      {product.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(product)}>
                        ✏️
                      </Button>
                      <Button size="icon" variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(product.id)}>
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Tidak ada produk ditemukan</div>
          )}
        </div>
      )}
    </div>
  );
};
