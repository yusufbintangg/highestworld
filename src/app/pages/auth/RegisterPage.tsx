import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { User, Mail, Lock, Eye, EyeOff, Phone, ArrowRight, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData({ ...formData, [name]: newValue });

    if (name === 'password') {
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

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama!');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          phone: formData.phone,
        },
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }


    

    navigate(from, { replace: true });
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 1: return 'bg-[var(--accent-red)]';
      case 2: return 'bg-[var(--text-secondary)]';
      case 3: return 'bg-[var(--accent-gold)]';
      case 4: return 'bg-[var(--accent-green)]';
      default: return 'bg-[var(--border)]';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-display tracking-[0.2em] text-[var(--text-primary)] mb-2">
              HIGHEST WORLD
            </h1>
            <p className="text-xs tracking-[0.3em] text-[var(--text-muted)] uppercase">
              Big Size. Real Style.
            </p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="border border-[var(--border)] bg-[var(--bg-card)] p-8 md:p-12"
        >
<div className="mb-8">
            <h2 className="text-3xl font-light text-[var(--text-primary)] mb-2">Join Us</h2>
            <p className="text-sm text-[var(--text-secondary)]">Buat akun baru</p>
          </div>

          {error && (
            <div className="mb-6 p-4 border border-[var(--accent-red)] bg-[var(--accent-red)]/5 text-sm text-[var(--accent-red)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                  placeholder="Ahmad Fauzi"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
                No. Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                  placeholder="+62 812-3456-7890"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full pl-12 pr-12 py-3 border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {formData.password && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 h-1 ${passwordStrength >= level ? getStrengthColor(passwordStrength) : 'bg-[var(--border)]'} transition-colors`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full pl-12 pr-12 py-3 border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {formData.confirmPassword && formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-[var(--accent-green)]" />
                      <span className="text-xs text-[var(--accent-green)]">Password cocok</span>
                    </>
                  ) : (
                    <span className="text-xs text-[var(--accent-red)]">Password tidak cocok</span>
                  )}
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 border border-[var(--border)] bg-[var(--bg-primary)] checked:bg-[var(--accent-gold)] checked:border-[var(--accent-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
              />
              <label className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Saya setuju dengan{' '}
                <Link to="/terms" className="text-[var(--accent-gold)] hover:underline">Syarat & Ketentuan</Link>
                {' '}dan{' '}
                <Link to="/privacy" className="text-[var(--accent-gold)] hover:underline">Kebijakan Privasi</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.agreeToTerms}
              className="w-full py-4 bg-[var(--accent-gold)] text-[var(--bg-primary)] hover:bg-[var(--accent-gold-dark)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin" />
                  <span>Mendaftar...</span>
                </>
              ) : (
                <>
                  <span>Daftar</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">atau</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-4">Sudah punya akun?</p>
            <Link
              to="/login"
              state={{ from: location.state?.from }}
              className="inline-block w-full py-4 border border-[var(--border)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors text-center"
            >
              Masuk
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8"
        >
          <Link to="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors">
            ← Kembali ke Beranda
          </Link>
        </motion.div>
      </div>
    </div>
  );
}