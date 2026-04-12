import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Gift, Construction } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoyaltyRewardsPage() {
  const { user } = useAuth();

  const comingSoonRewards = [
    { name: 'Kaos Premium Gratis', points: 100, type: 'Produk Fisik' },
    { name: 'Voucher Rp 50.000', points: 50, type: 'Voucher' },
    { name: 'Diskon 10%', points: 25, type: 'Diskon' },
    { name: 'Voucher Rp 100.000', points: 90, type: 'Voucher' },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-5xl mx-auto px-4">

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="pt-8 pb-4">
          <Link to="/loyalty" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="pt-12 pb-16 border-b border-[var(--border)]">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Katalog Reward</p>
          <h1 className="text-5xl md:text-7xl font-light text-[var(--text-primary)]">Redeem</h1>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="py-12 border-b border-[var(--border)]">
          <div className="flex items-start gap-4 p-8 border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/5">
            <Construction className="w-6 h-6 text-[var(--accent-gold)] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg text-[var(--text-primary)] mb-2">Fitur Redeem Segera Hadir</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Kami sedang menyiapkan katalog reward terbaik untuk kamu. Poin yang sudah terkumpul tidak akan hangus — terus belanja dan tambah poinmu sekarang!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Preview Rewards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="py-16">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] mb-8">Preview Reward</p>
          <div className="grid md:grid-cols-2 gap-6">
            {comingSoonRewards.map((reward, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + (index * 0.05) }}
                className="border border-[var(--border)] opacity-60"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl text-[var(--text-primary)] mb-1">{reward.name}</h3>
                      <span className="text-xs text-[var(--text-muted)] border border-[var(--border)] px-2 py-1">{reward.type}</span>
                    </div>
                    <Gift className="w-5 h-5 text-[var(--text-muted)]" />
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                    <p className="text-2xl font-light text-[var(--text-primary)] tabular-nums">
                      {reward.points} <span className="text-sm text-[var(--text-muted)]">poin</span>
                    </p>
                    <div className="px-6 py-3 border border-[var(--border)] text-sm text-[var(--text-muted)] cursor-not-allowed">
                      Coming Soon
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
