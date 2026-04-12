import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Gift, History, ArrowRight, Clock, Award, Construction } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function LoyaltyDashboardPage() {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, activityRes] = await Promise.all([
        supabase.from('user_profiles').select('points_balance').eq('id', user.id).single(),
        supabase.from('points_ledger').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]);

      const balance = profileRes.data?.points_balance || 0;
      setPoints(balance);
      setRecentActivity(activityRes.data || []);
      setIsLoading(false);
    };
    fetchData();
  }, [user?.id]);

  // Animated counter
  useEffect(() => {
    if (points === 0) return;
    let start = 0;
    const duration = 1500;
    const increment = points / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= points) {
        setAnimatedPoints(points);
        clearInterval(timer);
      } else {
        setAnimatedPoints(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [points]);

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto px-4">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-16 pb-12 border-b border-[var(--border)]"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Loyalty Program</p>
          <h1 className="text-6xl md:text-8xl font-light tabular-nums text-[var(--text-primary)] mb-6">
            {isLoading ? '—' : animatedPoints}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-2">Poin Aktif</p>
          <p className="text-sm text-[var(--text-muted)]">Setiap Rp 100.000 = 10 poin</p>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="py-8 border-b border-[var(--border)]"
        >
          <div className="flex items-start gap-4 p-6 border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/5">
            <Construction className="w-5 h-5 text-[var(--accent-gold)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[var(--text-primary)] mb-1">Fitur Loyalty Segera Hadir</p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Poin kamu sudah terakumulasi dan aman tersimpan. Fitur redeem reward, referral, dan tier membership akan segera diluncurkan. Terus belanja dan kumpulkan poin sekarang!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 gap-4 py-12 border-b border-[var(--border)]"
        >
          {/* Redeem - Coming Soon */}
          <div className="relative flex flex-col items-start p-6 border border-[var(--border)] opacity-50 cursor-not-allowed">
            <Gift className="w-6 h-6 text-[var(--text-muted)] mb-4" />
            <span className="text-sm text-[var(--text-secondary)]">Redeem</span>
            <span className="text-xs text-[var(--text-muted)] mt-1">Coming Soon</span>
          </div>

          {/* History */}
          <Link
            to="/loyalty/history"
            className="group flex flex-col items-start p-6 border border-[var(--border)] hover:border-[var(--border-accent)] transition-colors"
          >
            <History className="w-6 h-6 text-[var(--accent-gold)] mb-4" />
            <span className="text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">History</span>
            <span className="text-xs text-[var(--text-muted)] mt-1">Riwayat poin</span>
          </Link>
        </motion.div>

        {/* How to Earn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="py-12 border-b border-[var(--border)]"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] mb-8">Cara Kumpulkan Poin</p>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--text-secondary)]">Setiap pembelian Rp 100.000</p>
              <p className="text-lg font-light text-[var(--accent-gold)]">+10 poin</p>
            </div>
            <div className="flex items-center justify-between opacity-50">
              <p className="text-sm text-[var(--text-secondary)]">Referral teman (segera hadir)</p>
              <p className="text-lg font-light text-[var(--text-muted)]">+20 poin</p>
            </div>
            <div className="flex items-center justify-between opacity-50">
              <p className="text-sm text-[var(--text-secondary)]">Bonus ulang tahun (segera hadir)</p>
              <p className="text-lg font-light text-[var(--text-muted)]">+50 poin</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="py-12"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">Aktivitas Terakhir</h2>
            {recentActivity.length > 0 && (
              <Link to="/loyalty/history" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-gold)] flex items-center gap-2 group transition-colors">
                Lihat Semua
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-8 text-center">
              <Award className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)]">Belum ada aktivitas poin</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Mulai belanja untuk kumpulkan poin</p>
            </div>
          ) : (
            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + (index * 0.05) }}
                  className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-b-0"
                >
                  <div>
                    <p className="text-sm text-[var(--text-primary)] mb-1">{activity.description}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(activity.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <p className={`text-lg font-light tabular-nums ${activity.type === 'earn' ? 'text-[var(--accent-green)]' : 'text-[var(--text-secondary)]'}`}>
                    {activity.type === 'earn' ? '+' : '-'}{activity.amount}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
