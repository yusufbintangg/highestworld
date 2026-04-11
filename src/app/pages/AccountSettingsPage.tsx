import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Save, User, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const AccountSettingsPage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user?.id, user?.name, user?.phone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: formData.name,
        phone: formData.phone,
      })
      .eq('id', user.id);

    if (error) {
      toast.error('Gagal menyimpan perubahan');
    } else {
      toast.success('Profile berhasil diupdate!');
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen mt-2 pb-2">
      <div className="max-w-4xl mx-auto px-4">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="pt-8 pb-4"
        >
          <Link to="/account" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Account
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-12 pb-16 border-b border-[var(--border)]"
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Pengaturan Profil</p>
              <h1 className="text-5xl md:text-7xl font-light text-[var(--text-primary)]">Settings</h1>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 border border-[var(--border)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] text-sm transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="py-12"
        >
          <div className="space-y-8">

            {/* Nama */}
            <div className="border-b border-[var(--border)] pb-8">
              <label className="block text-sm uppercase tracking-[0.15em] text-[var(--text-muted)] mb-4">Nama Lengkap</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] text-lg focus:outline-none focus:border-[var(--accent-gold)]"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[var(--text-muted)]" />
                  <p className="text-lg text-[var(--text-primary)]">{formData.name || '-'}</p>
                </div>
              )}
            </div>

            {/* Email — tidak bisa diubah */}
            <div className="border-b border-[var(--border)] pb-8">
              <label className="block text-sm uppercase tracking-[0.15em] text-[var(--text-muted)] mb-4">Email</label>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--text-muted)]" />
                <p className="text-lg text-[var(--text-primary)]">{formData.email}</p>
                <span className="text-xs text-[var(--text-muted)] border border-[var(--border)] px-2 py-1">Tidak dapat diubah</span>
              </div>
            </div>

            {/* Phone */}
            <div className="border-b border-[var(--border)] pb-8">
              <label className="block text-sm uppercase tracking-[0.15em] text-[var(--text-muted)] mb-4">No. Telepon</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] text-lg focus:outline-none focus:border-[var(--accent-gold)]"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[var(--text-muted)]" />
                  <p className="text-lg text-[var(--text-primary)]">{formData.phone || '-'}</p>
                </div>
              )}
            </div>

            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 pt-4"
              >
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 bg-[var(--accent-gold)] text-[var(--bg-primary)] hover:bg-[var(--accent-gold-dark)] transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <><div className="w-4 h-4 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin" />Menyimpan...</>
                  ) : (
                    <><Save className="w-4 h-4" />Simpan Perubahan</>
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-6 py-3 border border-[var(--border)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] text-sm transition-colors"
                >
                  Batal
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};