import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export const AccountSecurityPage = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'newPassword') {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^a-zA-Z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak sama!');
      return;
    }
    if (formData.newPassword.length < 8) {
      toast.error('Password minimal 8 karakter!');
      return;
    }
    setIsChanging(true);
    const { error } = await supabase.auth.updateUser({ password: formData.newPassword });
    if (error) {
      toast.error('Gagal mengubah password. Coba lagi.');
    } else {
      toast.success('Password berhasil diubah!');
      setFormData({ newPassword: '', confirmPassword: '' });
      setPasswordStrength(0);
    }
    setIsChanging(false);
  };

  const getStrengthLabel = (s: number) => {
    if (s === 1) return { label: 'Lemah', color: 'text-[var(--accent-red)]' };
    if (s === 2) return { label: 'Cukup', color: 'text-[var(--text-secondary)]' };
    if (s === 3) return { label: 'Kuat', color: 'text-[var(--accent-gold)]' };
    if (s === 4) return { label: 'Sangat Kuat', color: 'text-[var(--accent-green)]' };
    return { label: '', color: '' };
  };

  const strengthInfo = getStrengthLabel(passwordStrength);

  return (
    <div className="min-h-screen mt-2 pb-2">
      <div className="max-w-4xl mx-auto px-4">

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="pt-8 pb-4">
          <Link to="/account" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Account
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="pt-12 pb-16 border-b border-[var(--border)]">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Keamanan Akun</p>
          <h1 className="text-5xl md:text-7xl font-light text-[var(--text-primary)]">Security</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="py-12 border-b border-[var(--border)]">
          <div className="flex items-start gap-4 p-6 border border-[var(--accent-gold)]/20 bg-[var(--accent-gold)]/5">
            <Shield className="w-6 h-6 text-[var(--accent-gold)] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-sm text-[var(--text-primary)] mb-2">Tips Password yang Aman</h3>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                <li>• Minimal 8 karakter</li>
                <li>• Kombinasi huruf besar dan kecil</li>
                <li>• Mengandung angka dan simbol</li>
                <li>• Tidak menggunakan informasi pribadi</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="py-12">
          <h2 className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] mb-8">Ganti Password</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* New Password */}
            <div>
              <label className="block text-sm uppercase tracking-[0.15em] text-[var(--text-muted)] mb-4">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full pl-12 pr-12 py-3 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                  placeholder="Masukkan password baru"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.newPassword && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[var(--border)] overflow-hidden">
                    <div className={`h-full transition-all ${
                      passwordStrength === 1 ? 'bg-[var(--accent-red)] w-1/4' :
                      passwordStrength === 2 ? 'bg-[var(--text-secondary)] w-1/2' :
                      passwordStrength === 3 ? 'bg-[var(--accent-gold)] w-3/4' :
                      passwordStrength === 4 ? 'bg-[var(--accent-green)] w-full' : 'w-0'
                    }`} />
                  </div>
                  {strengthInfo.label && <span className={`text-xs ${strengthInfo.color}`}>{strengthInfo.label}</span>}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm uppercase tracking-[0.15em] text-[var(--text-muted)] mb-4">Konfirmasi Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full pl-12 pr-12 py-3 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)]"
                  placeholder="Konfirmasi password baru"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.newPassword && (
                <div className="mt-2 flex items-center gap-2">
                  {formData.newPassword === formData.confirmPassword ? (
                    <><CheckCircle className="w-4 h-4 text-[var(--accent-green)]" /><span className="text-xs text-[var(--accent-green)]">Password cocok</span></>
                  ) : (
                    <span className="text-xs text-[var(--accent-red)]">Password tidak cocok</span>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isChanging}
                className="px-6 py-3 bg-[var(--accent-gold)] text-[var(--bg-primary)] hover:bg-[var(--accent-gold-dark)] transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChanging ? (
                  <><div className="w-4 h-4 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin" />Mengubah Password...</>
                ) : (
                  <><Lock className="w-4 h-4" />Ganti Password</>
                )}
              </button>
            </div>
          </form>
        </motion.div>

      </div>
    </div>
  );
};