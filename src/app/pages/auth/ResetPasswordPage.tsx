import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [validSession, setValidSession] = useState(false);

  const [formData, setFormData] = useState({ password: '', confirm: '' });

  useEffect(() => {
  // Cek session yang sudah ada dulu
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) setValidSession(true);
  });

  // Listen untuk PASSWORD_RECOVERY event
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      setValidSession(true);
    }
  });

  return () => subscription.unsubscribe();
}, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    if (formData.password !== formData.confirm) {
      setError('Password dan konfirmasi tidak cocok.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: formData.password,
    });

    if (error) {
      setError('Gagal reset password. Coba minta link baru.');
      setIsLoading(false);
      return;
    }

    setDone(true);
    setIsLoading(false);

    // Redirect ke login setelah 3 detik
    setTimeout(() => navigate('/login'), 3000);
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
          {done ? (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-4"
            >
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-5" strokeWidth={1.5} />
              <h2 className="text-2xl font-light text-[var(--text-primary)] mb-3">Password Berhasil Diubah!</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Kamu akan diarahkan ke halaman login dalam beberapa detik...
              </p>
              <Link
                to="/login"
                className="inline-block mt-6 text-xs text-[var(--accent-gold)] hover:underline transition-colors"
              >
                Login Sekarang →
              </Link>
            </motion.div>

          ) : !validSession ? (
            /* Invalid / expired link */
            <div className="text-center py-4">
              <h2 className="text-2xl font-light text-[var(--text-primary)] mb-3">Link Tidak Valid</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                Link reset password sudah expired atau tidak valid. Silakan minta link baru.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block w-full py-4 bg-[var(--accent-gold)] text-[var(--bg-primary)] text-center hover:bg-[var(--accent-gold-dark)] transition-colors"
              >
                Minta Link Baru
              </Link>
            </div>

          ) : (
            /* Reset form */
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-light text-[var(--text-primary)] mb-2">Reset Password</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Buat password baru untuk akun kamu.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 border border-[var(--accent-red)] bg-[var(--accent-red)]/5 text-sm text-[var(--accent-red)]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
                    Password Baru
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
                      placeholder="Min. 8 karakter"
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

                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="confirm"
                      value={formData.confirm}
                      onChange={handleChange}
                      required
                      minLength={8}
                      className="w-full pl-12 pr-12 py-3 border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                      placeholder="Ulangi password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-[var(--accent-gold)] text-[var(--bg-primary)] hover:bg-[var(--accent-gold-dark)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span>Simpan Password Baru</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {!done && (
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
              >
                ← Kembali ke Login
              </Link>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
