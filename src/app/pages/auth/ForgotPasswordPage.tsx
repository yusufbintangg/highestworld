import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError('Gagal mengirim email. Periksa kembali alamat email kamu.');
      setIsLoading(false);
      return;
    }

    setSent(true);
    setIsLoading(false);
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
          {!sent ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-light text-[var(--text-primary)] mb-2">Lupa Password</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Masukkan email kamu dan kami akan kirimkan link untuk reset password.
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
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                      placeholder="your@email.com"
                    />
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
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Link Reset</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-4"
            >
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-5" strokeWidth={1.5} />
              <h2 className="text-2xl font-light text-[var(--text-primary)] mb-3">Email Terkirim!</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2">
                Link reset password sudah dikirim ke
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-6">{email}</p>
              <p className="text-xs text-[var(--text-muted)]">
                Cek folder spam jika tidak ada di inbox. Link berlaku selama 1 jam.
              </p>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
            >
              ← Kembali ke Login
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
