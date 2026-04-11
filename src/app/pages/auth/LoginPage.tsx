import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({ email: '', password: '' });

  const from = (location.state as any)?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setError('Email atau password salah.');
      setIsLoading(false);
      return;
    }

    navigate(from, { replace: true });
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
            <h2 className="text-3xl font-light text-[var(--text-primary)] mb-2">Welcome Back</h2>
            <p className="text-sm text-[var(--text-secondary)]">Masuk ke akun kamu</p>
          </div>

          {error && (
            <div className="mb-6 p-4 border border-[var(--accent-red)] bg-[var(--accent-red)]/5 text-sm text-[var(--accent-red)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
              >
                Lupa password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[var(--accent-gold)] text-[var(--bg-primary)] hover:bg-[var(--accent-gold-dark)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin" />
                  <span>Masuk...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
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
            <p className="text-sm text-[var(--text-secondary)] mb-4">Belum punya akun?</p>
            <Link
              to="/register"
              state={{ from: location.state }}
              className="inline-block w-full py-4 border border-[var(--border)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors text-center"
            >
              Daftar Sekarang
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