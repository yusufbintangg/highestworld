import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Filter, TrendingUp, TrendingDown, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { supabase } from '../../../../lib/supabase';

export default function LoyaltyHistoryPage() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('points_ledger')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setTransactions(data || []);
      setIsLoading(false);
    };
    fetchHistory();
  }, [user?.id]);

  const filteredTransactions = filterType === 'all'
    ? transactions
    : transactions.filter(t => t.type === filterType);

  const totalEarned = transactions.filter(t => t.type === 'earn').reduce((s, t) => s + t.amount, 0);
  const totalRedeemed = transactions.filter(t => t.type === 'redeem').reduce((s, t) => s + t.amount, 0);

  const getTypeIcon = (type: string) => {
    if (type === 'earn') return <TrendingUp className="w-4 h-4 text-[var(--accent-green)]" />;
    if (type === 'redeem') return <TrendingDown className="w-4 h-4 text-[var(--text-muted)]" />;
    return <Calendar className="w-4 h-4 text-[var(--accent-red)]" />;
  };

  const getTypeLabel = (type: string) => {
    if (type === 'earn') return 'Masuk';
    if (type === 'redeem') return 'Redeem';
    return 'Hangus';
  };

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
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Riwayat Poin</p>
          <h1 className="text-5xl md:text-7xl font-light text-[var(--text-primary)]">History</h1>
        </motion.div>

        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="py-12 border-b border-[var(--border)]">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="text-sm uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">Total Earned</p>
              <p className="text-4xl font-light text-[var(--accent-green)] tabular-nums">+{totalEarned}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">Total Redeemed</p>
              <p className="text-4xl font-light text-[var(--text-secondary)] tabular-nums">-{totalRedeemed}</p>
            </div>
          </div>
        </motion.div>

        {/* Filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="py-8 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--text-muted)]" />
            <div className="flex gap-2">
              {['all', 'earn', 'redeem', 'expire'].map((type) => (
                <button key={type} onClick={() => setFilterType(type)}
                  className={`px-4 py-2 text-sm border transition-colors ${filterType === type ? 'border-[var(--accent-gold)] text-[var(--text-primary)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-accent)]'}`}>
                  {type === 'all' ? 'Semua' : getTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Transactions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="py-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)]" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[var(--text-muted)]">{transactions.length === 0 ? 'Belum ada riwayat poin' : 'Tidak ada transaksi'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTransactions.map((transaction, index) => (
                <motion.div key={transaction.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + (index * 0.05) }}
                  className="flex items-start justify-between py-6 border-b border-[var(--border)] last:border-b-0"
                >
                  <div className="flex gap-4">
                    <div className="mt-1">{getTypeIcon(transaction.type)}</div>
                    <div>
                      <p className="text-sm text-[var(--text-primary)] mb-1">{transaction.description}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(transaction.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {transaction.expired_at && transaction.type === 'earn' && (
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          Hangus: {new Date(transaction.expired_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-light tabular-nums ${transaction.type === 'earn' ? 'text-[var(--accent-green)]' : transaction.type === 'expire' ? 'text-[var(--accent-red)]' : 'text-[var(--text-secondary)]'}`}>
                      {transaction.type === 'earn' ? '+' : '-'}{transaction.amount}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{getTypeLabel(transaction.type)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
