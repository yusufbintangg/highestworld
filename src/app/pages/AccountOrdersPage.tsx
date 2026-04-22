import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';

const STATUS_MAP = {
  waiting_payment:  { label: 'Menunggu Pembayaran', icon: CreditCard, color: 'text-[var(--accent-gold)]',   bgColor: 'bg-[var(--accent-gold)]/10',   filter: 'processing' },
  payment_confirmed:{ label: 'Pembayaran Dikonfirmasi', icon: Clock, color: 'text-[var(--text-secondary)]', bgColor: 'bg-[var(--bg-secondary)]',      filter: 'processing' },
  processing:       { label: 'Diproses',             icon: Clock,      color: 'text-[var(--text-secondary)]', bgColor: 'bg-[var(--bg-secondary)]',      filter: 'processing' },
  shipped:          { label: 'Dikirim',              icon: Truck,      color: 'text-[var(--accent-gold)]',   bgColor: 'bg-[var(--accent-gold)]/10',   filter: 'shipping' },
  delivered:        { label: 'Selesai',              icon: CheckCircle,color: 'text-[var(--accent-green)]',  bgColor: 'bg-[var(--accent-green)]/10',  filter: 'delivered' },
  cancelled:        { label: 'Dibatalkan',           icon: XCircle,    color: 'text-[var(--accent-red)]',    bgColor: 'bg-[var(--accent-red)]/10',    filter: 'cancelled' },
  refunded:         { label: 'Direfund',             icon: XCircle,    color: 'text-[var(--accent-red)]',    bgColor: 'bg-[var(--accent-red)]/10',    filter: 'cancelled' },
};

const getStatusInfo = (status) => STATUS_MAP[status] || {
  label: status,
  icon: Package,
  color: 'text-[var(--text-muted)]',
  bgColor: 'bg-[var(--bg-secondary)]',
  filter: 'processing',
};

export const AccountOrdersPage = () => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total,
          created_at,
          courier,
          courier_service,
          awb_number,
          order_items (
            product_name,
            size,
            qty
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setOrders(data);
      setIsLoading(false);
    };

    fetchOrders();
  }, [user?.id]);

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => getStatusInfo(o.status).filter === filterStatus);

  return (
    <div className="min-h-screen mt-2 pb-2">
      <div className="max-w-5xl mx-auto px-4">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="pt-8 pb-4"
        >
          <Link
            to="/account"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
          >
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
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">
            Riwayat orders
          </p>
          <h1 className="text-5xl md:text-7xl font-light text-[var(--text-primary)]">
            Orders
          </h1>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="py-8 border-b border-[var(--border)]"
        >
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'processing', 'shipping', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 text-sm border transition-colors whitespace-nowrap ${
                  filterStatus === status
                    ? 'border-[var(--accent-gold)] text-[var(--text-primary)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-accent)]'
                }`}
              >
                {status === 'all' ? 'Semua' : status === 'processing' ? 'Diproses' : status === 'shipping' ? 'Dikirim' : status === 'delivered' ? 'Selesai' : 'Dibatalkan'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="py-12"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)]" />
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order, index) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const itemCount = order.order_items?.reduce((s, i) => s + i.qty, 0) || 0;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + (index * 0.05) }}
                    className="border border-[var(--border)] hover:border-[var(--border-accent)] transition-colors"
                  >
                    <div className="p-8">
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border)]">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl text-[var(--text-primary)]">
                              #{order.order_number}
                            </h3>
                            <span className={`text-xs px-3 py-1 flex items-center gap-2 ${statusInfo.bgColor} ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--text-muted)]">
                            {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {itemCount} item{itemCount > 1 ? 's' : ''}
                          </p>
                        </div>
                        <p className="text-2xl font-light text-[var(--text-primary)] tabular-nums">
                          {formatPrice(order.total)}
                        </p>
                      </div>

                      {/* Products */}
                      <div className="py-6 space-y-2">
                        {order.order_items?.map((item, idx) => (
                          <p key={idx} className="text-sm text-[var(--text-secondary)]">
                            • {item.product_name} — {item.size} × {item.qty}
                          </p>
                        ))}
                      </div>

                      {/* Tracking */}
                      {order.awb_number && (
                        <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">
                              Tracking Number
                            </p>
                            <p className="text-sm text-[var(--text-primary)] font-mono">
                              {order.awb_number}
                            </p>
                          </div>
                          <Link
                            to={`/orders/${order.order_number}`}
                            className="px-6 py-3 border border-[var(--border)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] text-sm transition-colors"
                          >
                            Track Order
                          </Link>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-6 border-t border-[var(--border)] flex gap-3">
                        <Link
                          to={`/orders/${order.order_number}`}
                          className="px-6 py-3 border border-[var(--border)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] text-sm transition-colors"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {filteredOrders.length === 0 && (
                <div className="py-16 text-center">
                  <Package className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                  <p className="text-sm text-[var(--text-muted)]">
                    {orders.length === 0 ? 'Belum ada orders' : 'Tidak ada orders dengan status ini'}
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};