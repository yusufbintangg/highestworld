import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CheckCircle, Clock, Package, Truck, XCircle, Loader2, AlertTriangle, ArrowLeft, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';
import { loadMidtransScript } from '../../lib/midtrans';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  waiting_payment: { label: 'Menunggu Pembayaran', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-400' },
  payment_confirmed: { label: 'Pembayaran Berhasil', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500' },
  processing: { label: 'Sedang Diproses', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-500' },
  shipped: { label: 'Dalam Pengiriman', icon: Truck, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', dot: 'bg-violet-500' },
  completed: { label: 'orders Selesai', icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-600' },
  cancelled: { label: 'orders Dibatalkan', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-400' },
};

const STEP_ORDER = ['waiting_payment', 'payment_confirmed', 'processing', 'shipped', 'completed'];

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
      const snap = await loadMidtransScript();
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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
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

  const currentStepIndex = STEP_ORDER.indexOf(order.status);

  return (
    <div className="min-h-screen bg-white pt-2 pb-16">
      <div className="max-w-xl mx-auto px-4">

        {/* Back */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-gray-400 hover:text-gray-900 transition-colors mt-4 mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Lanjut Belanja
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-gray-400 mb-1">Order Detail</p>
          <h1 className="text-xl font-semibold tracking-wide text-gray-900">{order.order_number}</h1>
        </div>

        {/* Status Banner */}
        <div className={` p-5 ${statusInfo.bg} ${statusInfo.border} border mb-6 flex items-center gap-4`}>
          <div className={`w-10 h-10 flex items-center justify-center ${statusInfo.bg} border ${statusInfo.border}`}>
            <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
          </div>
          <div className="flex-1">
            <p className={`font-semibold text-sm ${statusInfo.color}`}>{statusInfo.label}</p>
            {order.awb_number && (
              <div className="mt-1">
                <p className="text-xs text-gray-500">{order.courier?.toUpperCase()} {order.courier_service}</p>
                <p className="font-mono font-bold text-gray-900 text-sm tracking-widest">{order.awb_number}</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        {order.status !== 'cancelled' && (
          <div className="mb-6 px-1">
            <div className="flex items-center justify-between relative">
              {/* line */}
              <div className="absolute left-0 right-0 top-[10px] h-[1px] bg-gray-200 z-0" />
              <div
                className="absolute left-0 top-[10px] h-[1px] bg-gray-900 z-0 transition-all duration-500"
                style={{ width: `${Math.min(100, (currentStepIndex / (STEP_ORDER.length - 1)) * 100)}%` }}
              />
              {STEP_ORDER.map((step, i) => {
                const done = i <= currentStepIndex;
                return (
                  <div key={step} className="flex flex-col items-center z-10 gap-1.5">
                    <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                      done ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-300'
                    }`} />
                    <p className={`text-[9px] tracking-wider uppercase text-center max-w-[50px] leading-tight ${
                      done ? 'text-gray-900 font-medium' : 'text-gray-400'
                    }`}>
                      {STATUS_CONFIG[step]?.label.split(' ').slice(-1)[0]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Alert deadline */}
        {isUnpaid && !isExpired && expiredAt && (
          <div className="mb-4 bg-amber-50 border border-amber-100 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700">Segera selesaikan pembayaran</p>
              <p className="text-[11px] text-amber-600 mt-0.5">
                Berakhir {expiredAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} pukul {expiredAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                {' '}·{' '}
                {minutesLeft < 60 ? `${minutesLeft} menit lagi` : `${hoursLeft} jam lagi`}
              </p>
            </div>
          </div>
        )}

        {/* Alert expired */}
        {isUnpaid && isExpired && (
          <div className="mb-4 bg-red-50 border border-red-100 px-4 py-3 flex items-start gap-3">
            <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-600">Waktu pembayaran habis</p>
              <p className="text-[11px] text-red-500 mt-0.5">orders/ ini sudah expired. Silakan buat orders/ baru.</p>
            </div>
          </div>
        )}

        {/* Tombol Bayar */}
        {isUnpaid && !isExpired && (
          <button
            onClick={handleBayarSekarang}
            disabled={paying}
            className="w-full py-3.5 bg-black text-white text-xs tracking-[0.15em] uppercase font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 mb-6 disabled:opacity-60"
          >
            {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            {paying ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        )}

        {/* Products */}
        <div className="border border-gray-100  overflow-hidden mb-4">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium">Produk Dipesan</p>
          </div>
          <div className="divide-y divide-gray-50">
            {order.order_items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3.5 px-5 py-4">
                {item.variant_images?.[0] ? (
                  <img
                    src={item.variant_images[0]}
                    alt={item.product_name}
                    className="w-14 h-14 object-cover shrink-0 bg-gray-50"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {[item.sku_variant, item.size].filter(Boolean).join(' · ')} · {item.qty} pcs
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Info */}
        <div className="border border-gray-100 overflow-hidden mb-4">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium">Informasi Pengiriman</p>
          </div>
          <div className="px-5 py-4 space-y-1">
            <p className="text-sm font-semibold text-gray-900">{order.customer_name}</p>
            <p className="text-xs text-gray-500">{order.customer_phone}</p>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              {order.shipping_address}, {order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
            </p>
            <div className="pt-2 mt-2 border-t border-gray-50">
              <p className="text-[11px] text-gray-400">
                Kurir: <span className="font-medium text-gray-700">{order.courier?.toUpperCase()} {order.courier_service}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="border border-gray-100 overflow-hidden mb-6">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium">Ringkasan Pembayaran</p>
          </div>
          <div className="px-5 py-4 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ongkir ({order.courier?.toUpperCase()} {order.courier_service})</span>
              <span className="text-gray-900">{formatPrice(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-gray-100 pt-3 mt-1">
              <span className="text-sm text-gray-900">Total</span>
              <span className="text-base text-gray-900">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/products')}
          className="w-full py-3.5 border border-gray-200 text-xs tracking-[0.15em] uppercase text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors font-medium"
        >
          Lanjut Belanja
        </button>

      </div>
    </div>
  );
};