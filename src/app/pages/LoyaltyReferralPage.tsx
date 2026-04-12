import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, UserPlus, Gift, Construction } from 'lucide-react';

export default function LoyaltyReferralPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto px-4">

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="pt-8 pb-4">
          <Link to="/loyalty" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="pt-12 pb-16 border-b border-[var(--border)]">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Program Referral</p>
          <h1 className="text-5xl md:text-7xl font-light text-[var(--text-primary)] mb-6">
            Ajak Teman,<br />Dapat Poin
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
            Bagikan kode referral kamu. Teman dapat diskon 10%, kamu dapat 20 poin setiap mereka berhasil transaksi.
          </p>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="py-12 border-b border-[var(--border)]">
          <div className="flex items-start gap-4 p-8 border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/5">
            <Construction className="w-6 h-6 text-[var(--accent-gold)] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg text-[var(--text-primary)] mb-2">Program Referral Segera Hadir</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Kami sedang membangun sistem referral yang fair dan transparan. Kamu akan mendapat kode unik untuk dibagikan ke teman-teman. Stay tuned!
              </p>
            </div>
          </div>
        </motion.div>

        {/* How It Works Preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="py-16 opacity-60">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] mb-12">Cara Kerja</p>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 border border-[var(--border)] flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <div>
                <h3 className="text-lg text-[var(--text-primary)] mb-2">Teman Daftar</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Teman kamu mendaftar menggunakan link atau kode referral kamu</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 border border-[var(--border)] flex items-center justify-center">
                <Gift className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <div>
                <h3 className="text-lg text-[var(--text-primary)] mb-2">Teman Dapat Diskon 10%</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Mereka otomatis dapat diskon 10% untuk transaksi pertama mereka</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 border border-[var(--border)] flex items-center justify-center">
                <span className="text-lg font-light text-[var(--text-muted)]">20</span>
              </div>
              <div>
                <h3 className="text-lg text-[var(--text-primary)] mb-2">Kamu Dapat 20 Poin</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Setelah transaksi pertama mereka selesai, kamu dapat 20 poin</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
