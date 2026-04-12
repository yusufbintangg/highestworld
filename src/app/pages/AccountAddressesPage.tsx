import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Edit, Trash2, Home, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface UserAddress {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at?: string;
}

export const AccountAddressesPage = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const emptyForm = { label: 'Rumah', recipient_name: '', phone: '', address: '', city: '', province: '', postal_code: '' };
  const [formData, setFormData] = useState(emptyForm);

  const fetchAddresses = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    setAddresses(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, [user?.id]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    if (editingId) {
      const { error } = await supabase.from('user_addresses').update(formData).eq('id', editingId);
      if (error) toast.error('Gagal update alamat');
      else { toast.success('Alamat berhasil diupdate!'); setEditingId(null); }
    } else {
      const { error } = await supabase.from('user_addresses').insert({ ...formData, user_id: user.id, is_default: addresses.length === 0 });
      if (error) toast.error('Gagal menyimpan alamat');
      else { toast.success('Alamat berhasil ditambahkan!'); setShowAddForm(false); }
    }

    setFormData(emptyForm);
    await fetchAddresses();
    setIsSaving(false);
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('user_addresses').update({ is_default: true }).eq('id', id);
    await fetchAddresses();
    toast.success('Alamat utama diubah');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus alamat ini?')) return;
    await supabase.from('user_addresses').delete().eq('id', id);
    await fetchAddresses();
    toast.success('Alamat dihapus');
  };

  const handleEdit = (address: UserAddress) => {
    setEditingId(address.id);
    setFormData({
      label: address.label,
      recipient_name: address.recipient_name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      province: address.province,
      postal_code: address.postal_code,
    });
    setShowAddForm(true);
  };

  const AddressForm = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12 border-b border-[var(--border)]">
      <div className="border border-[var(--border)] p-8">
        <h3 className="text-lg text-[var(--text-primary)] mb-6">{editingId ? 'Edit Alamat' : 'Tambah Alamat Baru'}</h3>
        <div className="space-y-4">
          <input type="text" placeholder="Label (Rumah, Kantor, dll)" value={formData.label}
            onChange={e => setFormData({ ...formData, label: e.target.value })}
            className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]" />
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nama Penerima" value={formData.recipient_name}
              onChange={e => setFormData({ ...formData, recipient_name: e.target.value })}
              className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]" />
            <input type="tel" placeholder="No. Telepon" value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]" />
          </div>
          <textarea placeholder="Alamat Lengkap" rows={3} value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] resize-none" />
          <div className="grid md:grid-cols-3 gap-4">
            <input type="text" placeholder="Kota/Kecamatan" value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]" />
            <input type="text" placeholder="Provinsi" value={formData.province}
              onChange={e => setFormData({ ...formData, province: e.target.value })}
              className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]" />
            <input type="text" placeholder="Kode Pos" value={formData.postal_code}
              onChange={e => setFormData({ ...formData, postal_code: e.target.value })}
              className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]" />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} disabled={isSaving}
              className="px-6 py-3 bg-[var(--accent-gold)] text-[var(--bg-primary)] hover:bg-[var(--accent-gold-dark)] transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
              {isSaving ? <><div className="w-4 h-4 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin" />Menyimpan...</> : 'Simpan Alamat'}
            </button>
            <button onClick={() => { setShowAddForm(false); setEditingId(null); setFormData(emptyForm); }}
              className="px-6 py-3 border border-[var(--border)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] text-sm transition-colors">
              Batal
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen mt-2 pb-2">
      <div className="max-w-5xl mx-auto px-4">

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="pt-8 pb-4">
          <Link to="/account" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Account
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="pt-12 pb-16 border-b border-[var(--border)]">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Alamat Pengiriman</p>
              <h1 className="text-5xl md:text-7xl font-light text-[var(--text-primary)]">Addresses</h1>
            </div>
            <button onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setFormData(emptyForm); }}
              className="px-6 py-3 bg-[var(--accent-gold)] text-[var(--bg-primary)] hover:bg-[var(--accent-gold-dark)] transition-colors text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tambah Alamat
            </button>
          </div>
        </motion.div>

        {showAddForm && <AddressForm />}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="py-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)]" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="py-16 text-center">
              <Home className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-sm text-[var(--text-muted)]">Belum ada alamat tersimpan</p>
            </div>
          ) : (
            <div className="space-y-6">
              {addresses.map((address, index) => (
                <motion.div key={address.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + (index * 0.05) }}
                  className={`border transition-colors ${address.is_default ? 'border-[var(--accent-gold)]' : 'border-[var(--border)] hover:border-[var(--border-accent)]'}`}>
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 border border-[var(--border)]">
                          <Home className="w-5 h-5 text-[var(--accent-gold)]" />
                        </div>
                        <div>
                          <h3 className="text-lg text-[var(--text-primary)] mb-1">{address.label}</h3>
                          {address.is_default && (
                            <span className="text-xs px-3 py-1 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center gap-1 w-fit">
                              <Check className="w-3 h-3" /> Alamat Utama
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(address)}
                          className="p-2 border border-[var(--border)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        {!address.is_default && (
                          <button onClick={() => handleDelete(address.id)}
                            className="p-2 border border-[var(--border)] hover:border-[var(--accent-red)] hover:text-[var(--accent-red)] transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <p className="text-sm text-[var(--text-primary)]">{address.recipient_name}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{address.phone}</p>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {address.address}<br />
                        {address.city}, {address.province} {address.postal_code}
                      </p>
                    </div>

                    {!address.is_default && (
                      <button onClick={() => handleSetDefault(address.id)}
                        className="px-6 py-3 border border-[var(--border)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] text-sm transition-colors">
                        Jadikan Alamat Utama
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};