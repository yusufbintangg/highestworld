import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  CheckCircle, Clock, Package, Truck, XCircle, Loader2,
  ArrowLeft, MapPin, CreditCard, ChevronDown, ChevronUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';
import { loadMidtransScript } from '../../lib/midtrans';
import { toast } from 'sonner';
import { PaymentDetailDisplay } from '../components/checkout/PaymentDetailDisplay';

const STATUS_CONFIG = {
  waiting_payment:   { label: 'Menunggu Pembayaran',  icon: Clock,        color: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  payment_confirmed: { label: 'Pembayaran Berhasil',  icon: CheckCircle,  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  processing:        { label: 'Sedang Diproses',       icon: Package,      color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
  shipped:           { label: 'Dalam Pengiriman',      icon: Truck,        color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-100' },
  completed:         { label: 'Order Selesai',         icon: CheckCircle,  color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  cancelled:         { label: 'Order Dibatalkan',      icon: XCircle,      color: 'text-red-500',     bg: 'bg-red-50',     border: 'border-red-100' },
};

const STEP_ORDER  = ['waiting_payment', 'payment_confirmed', 'processing', 'shipped', 'completed'];
const STEP_LABELS = ['Pembayaran', 'Berhasil', 'Diproses', 'Pengiriman', 'Selesai'];


export const OrderDetailPage = () => {
  const { orderNumber } = useParams();
  const navigate        = useNavigate();

  const [order,       setOrder]       = useState(null);
  const [payment,     setPayment]     = useState(null);   // ← row dari tabel payments
  const [loading,     setLoading]     = useState(true);
  const [paying,      setPaying]      = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => { fetchOrder(); }, [orderNumber]);

  const fetchOrder = async () => {
    setLoading(true);

    // 1. Fetch order
    const { data: orderData, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNumber)
      .single();

    if (error || !orderData) {
      toast.error('Order tidak ditemukan');
      navigate('/');
      return;
    }

    setOrder(orderData);

    // 2. Fetch payment detail (untuk Core API — QRIS / VA)
    const { data: paymentData } = await supabase
    .from('payments')
    .select('payment_detail, midtrans_payment_type, status')
    .eq('order_id', orderData.id)
    .single();

    console.log('order.id:', orderData.id);
    console.log('paymentData:', paymentData);

    setPayment(paymentData);
    setLoading(false);
  };

  // Snap popup — untuk order yang pakai Snap (OVO, Alfamart, dll)
  const handleBayarSekarang = async () => {
    if (!order.snap_token) {
      toast.error('Token pembayaran tidak ditemukan');
      return;
    }
    setPaying(true);
    try {
      const snap = await loadMidtransScript();
      snap.pay(order.snap_token, {
        onSuccess: () => { toast.success('Pembayaran berhasil!'); fetchOrder(); setPaying(false); },
        onPending: () => { toast.info('Menunggu pembayaran...'); setPaying(false); },
        onError:   () => { toast.error('Pembayaran gagal'); setPaying(false); },
        onClose:   () => setPaying(false),
      });
    } catch {
      toast.error('Gagal membuka pembayaran');
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
    </div>
  );

  const statusInfo      = STATUS_CONFIG[order.status] || STATUS_CONFIG.waiting_payment;
  const StatusIcon      = statusInfo.icon;
  const isUnpaid        = order.status === 'waiting_payment';
  const expiredAt       = order.payment_expired_at ? new Date(order.payment_expired_at) : null;
  const isExpired       = expiredAt && new Date() > expiredAt;
  const currentStepIdx  = STEP_ORDER.indexOf(order.status);

  // Apakah order ini pakai Core API (sudah ada payment_detail)?
  const hasCoreApiDetail = isUnpaid && payment?.payment_detail && !isExpired;
  // Apakah perlu tampilkan tombol "Bayar Sekarang" via Snap?
  const showSnapButton   = isUnpaid && !isExpired && !hasCoreApiDetail && order.snap_token;

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Back */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-gray-400 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Lanjut Belanja
        </button>

        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] tracking-[0.25em] uppercase text-gray-400 mb-1">Order Detail</p>
          <h1 className="text-xl font-bold tracking-wide text-gray-900">{order.order_number}</h1>
        </div>

        {/* ── CORE API: QR / VA display ─────────────────────────────── */}
        {hasCoreApiDetail && (
          <div className="mb-4">
            {/* Header card */}
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden mb-0">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <p className="text-sm font-semibold text-gray-900">Selesaikan Pembayaran</p>
                </div>
                {expiredAt && (
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">Berakhir</p>
                    <p className="text-[11px] font-medium text-gray-600">
                      {expiredAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}{' '}
                      {expiredAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* QR / VA detail */}
            <PaymentDetailDisplay
              detail={payment.payment_detail}
              total={order.total}
            />
          </div>
        )}

        {/* ── SNAP: tombol Bayar Sekarang ───────────────────────────── */}
        {showSnapButton && (
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-sm font-semibold text-gray-900">Selesaikan Pembayaran</p>
              </div>
              {expiredAt && (
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">Berakhir</p>
                  <p className="text-[11px] font-medium text-gray-600">
                    {expiredAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}{' '}
                    {expiredAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
              <p className="text-xs text-gray-400">Total Pembayaran</p>
              <p className="text-xl font-bold text-gray-900">{formatPrice(order.total)}</p>
            </div>
            {expiredAt && (
              <div className="px-5 py-3.5 flex items-center justify-between bg-amber-50 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-xs text-amber-700 font-medium">Sisa waktu</p>
                </div>
                <CountdownTimer expiresAt={expiredAt} />
              </div>
            )}
            <div className="px-5 py-4">
              <button
                onClick={handleBayarSekarang}
                disabled={paying}
                className="w-full py-3.5 bg-gray-900 text-white text-xs tracking-[0.18em] uppercase font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {paying
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Memproses...</>
                  : <><CreditCard className="w-3.5 h-3.5" /> Bayar Sekarang</>
                }
              </button>
            </div>
          </div>
        )}

        {/* Expired alert */}
        {isUnpaid && isExpired && (
          <div className="mb-4 bg-red-50 border border-red-100 px-4 py-3 flex items-start gap-3">
            <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-600">Waktu pembayaran habis</p>
              <p className="text-[11px] text-red-500 mt-0.5">Order ini sudah expired. Silakan buat order baru.</p>
            </div>
          </div>
        )}

        {/* Status Banner (paid/processing/shipped/completed/cancelled) */}
        {!isUnpaid && (
          <div className={`p-4 ${statusInfo.bg} ${statusInfo.border} border mb-4 flex items-center gap-3`}>
            <div className={`w-9 h-9 flex items-center justify-center ${statusInfo.bg} border ${statusInfo.border}`}>
              <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${statusInfo.color}`}>{statusInfo.label}</p>
              {order.awb_number && (
                <div className="mt-0.5">
                  <p className="text-xs text-gray-500">{order.courier?.toUpperCase()} {order.courier_service}</p>
                  <p className="font-mono font-bold text-gray-900 text-sm tracking-widest">{order.awb_number}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Steps */}
        {order.status !== 'cancelled' && (
          <div className="bg-white border border-gray-100 shadow-sm px-5 py-5 mb-4">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-[10px] h-[1px] bg-gray-100 z-0" />
              <div
                className="absolute left-0 top-[10px] h-[1px] bg-gray-900 z-0 transition-all duration-700"
                style={{ width: `${Math.min(100, (currentStepIdx / (STEP_ORDER.length - 1)) * 100)}%` }}
              />
              {STEP_ORDER.map((step, i) => {
                const done = i <= currentStepIdx;
                return (
                  <div key={step} className="flex flex-col items-center z-10 gap-1.5">
                    <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${done ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'}`} />
                    <p className={`text-[9px] tracking-wider uppercase text-center max-w-[48px] leading-tight ${done ? 'text-gray-900 font-semibold' : 'text-gray-300'}`}>
                      {STEP_LABELS[i]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Summary collapsible */}
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden mb-4">
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="w-full px-5 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium">Ringkasan Pesanan</p>
            </div>
            {showSummary
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />
            }
          </button>
          {showSummary && (
            <div className="border-t border-gray-50">
              {order.order_items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3.5 px-5 py-4 border-b border-gray-50 last:border-0">
                  {item.variant_images?.[0]
                    ? <img src={item.variant_images[0]} alt={item.product_name} className="w-14 h-14 object-cover rounded-xl shrink-0 bg-gray-50" />
                    : <div className="w-14 h-14 bg-gray-100 rounded-xl shrink-0" />
                  }
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
          )}
        </div>

        {/* Shipping Info */}
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
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
        <div className="bg-white border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
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
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Diskon</span>
                <span className="text-emerald-600">-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-900">Total</span>
              <span className="text-base text-gray-900">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Lanjut belanja */}
        <button
          onClick={() => navigate('/products')}
          className="w-full py-3.5 border border-gray-200 text-xs tracking-[0.15em] uppercase text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors font-medium"
        >
          Lanjut Belanja
        </button>

      </div>
    </div>
  );
};