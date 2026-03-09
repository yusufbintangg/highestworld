import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CheckCircle, Clock, Package, Truck, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';
import { openMidtransPayment } from '../../lib/midtrans';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  waiting_payment: { label: 'Menunggu Pembayaran', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  payment_confirmed: { label: 'Pembayaran Berhasil', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  processing: { label: 'Sedang Diproses', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  shipped: { label: 'Dalam Pengiriman', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  completed: { label: 'Pesanan Selesai', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-600/10' },
  cancelled: { label: 'Pesanan Dibatalkan', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

export const OrderDetailPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNumber)
      .single();

    if (error || !data) {
      toast.error('Order tidak ditemukan');
      navigate('/');
      return;
    }
    setOrder(data);
    setLoading(false);
  };

  const handleBayarSekarang = async () => {
    if (!order.snap_token) {
      toast.error('Token pembayaran tidak ditemukan');
      return;
    }

    setPaying(true);
    try {
      const snap = await import('../../lib/midtrans').then(m => m.loadMidtransScript());
      snap.pay(order.snap_token, {
        onSuccess: () => {
          toast.success('Pembayaran berhasil!');
          fetchOrder();
          setPaying(false);
        },
        onPending: () => {
          toast.info('Menunggu pembayaran...');
          setPaying(false);
        },
        onError: () => {
          toast.error('Pembayaran gagal');
          setPaying(false);
        },
        onClose: () => setPaying(false),
      });
    } catch (err) {
      toast.error('Gagal membuka pembayaran');
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
    </div>
  );

  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.waiting_payment;
  const StatusIcon = statusInfo.icon;
  const isUnpaid = order.status === 'waiting_payment';
  const expiredAt = order.payment_expired_at ? new Date(order.payment_expired_at) : null;
  const now = new Date();
  const isExpired = expiredAt && now > expiredAt;
  const hoursLeft = expiredAt ? Math.max(0, Math.ceil((expiredAt - now) / (1000 * 60 * 60))) : 0;
  const minutesLeft = expiredAt ? Math.max(0, Math.ceil((expiredAt - now) / (1000 * 60))) : 0;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-2xl tracking-wider mb-1">Detail Pesanan</h1>
          <p className="text-muted-foreground text-sm">{order.order_number}</p>
        </div>

        {/* Status Card */}
        <div className={`rounded-xl p-6 ${statusInfo.bg} border border-border text-center`}>
          <StatusIcon className={`w-12 h-12 mx-auto mb-3 ${statusInfo.color}`} />
          <h2 className={`text-xl font-bold ${statusInfo.color}`}>{statusInfo.label}</h2>
          {order.awb_number && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground">Nomor Resi</p>
              <p className="font-mono font-bold text-lg tracking-widest">{order.awb_number}</p>
              <p className="text-xs text-muted-foreground">{order.courier?.toUpperCase()} {order.courier_service}</p>
            </div>
          )}
        </div>

        {/* Alert deadline bayar */}
        {isUnpaid && !isExpired && expiredAt && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-500 text-sm">Segera Selesaikan Pembayaran</p>
              <p className="text-xs text-muted-foreground mt-1">
                Bayar sebelum {expiredAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} pukul {expiredAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                {minutesLeft < 60
                  ? ` (${minutesLeft} menit lagi)`
                  : ` (${hoursLeft} jam lagi)`}
              </p>
            </div>
          </div>
        )}

        {/* Alert expired */}
        {isUnpaid && isExpired && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-500 text-sm">Waktu Pembayaran Habis</p>
              <p className="text-xs text-muted-foreground mt-1">Pesanan ini sudah expired. Silakan buat pesanan baru.</p>
            </div>
          </div>
        )}

        {/* Tombol Bayar */}
        {isUnpaid && !isExpired && (
          <button
            onClick={handleBayarSekarang}
            disabled={paying}
            className="w-full py-4 bg-accent-gold hover:bg-accent-gold/90 text-accent-gold font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {paying ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        )}

        {/* Order Items */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-sm">Produk Dipesan</h3>
          {order.order_items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.variant_images?.[0] && (
                <img src={item.variant_images[0]} alt={item.product_name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">{item.color} / {item.size} × {item.qty}</p>
              </div>
              <p className="font-mono text-sm font-bold">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>

        {/* Info Customer */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2 text-sm">
          <h3 className="font-semibold">Informasi Pengiriman</h3>
          <p className="font-medium">{order.customer_name}</p>
          <p className="text-muted-foreground">{order.customer_phone}</p>
          <p className="text-muted-foreground">{order.shipping_address}, {order.shipping_city}, {order.shipping_province}</p>
          <p className="text-muted-foreground">Kode Pos: {order.shipping_postal_code}</p>
        </div>

        {/* Ringkasan Bayar */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2 text-sm">
          <h3 className="font-semibold mb-3">Ringkasan Pembayaran</h3>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ongkir ({order.courier?.toUpperCase()} {order.courier_service})</span>
            <span>{formatPrice(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-border pt-2 mt-2">
            <span>Total</span>
            <span className="text-accent-gold text-base">{formatPrice(order.total)}</span>
          </div>
        </div>

        <button onClick={() => navigate('/produk')} className="w-full py-3 border border-border rounded-xl text-sm hover:border-accent-gold transition-colors">
          Lanjut Belanja
        </button>

      </div>
    </div>
  );
};