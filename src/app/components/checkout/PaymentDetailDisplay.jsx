/**
 * PaymentDetailDisplay.jsx
 *
 * Komponen ini ditaruh di dalam OrderDetailPage, ditampilkan ketika:
 * - order.status === 'waiting_payment'
 * - payment.payment_detail ada isinya (dari Core API charge)
 *
 * Usage di OrderDetailPage:
 *
 *   import { PaymentDetailDisplay } from '../components/checkout/PaymentDetailDisplay';
 *
 *   // Di dalam render, setelah load order + payment:
 *   {order.status === 'waiting_payment' && payment?.payment_detail && (
 *     <PaymentDetailDisplay detail={payment.payment_detail} total={order.total} />
 *   )}
 *
 * "payment" adalah row dari tabel payments yang lo fetch bersama order.
 * Contoh fetch:
 *
 *   const { data: payment } = await supabase
 *     .from('payments')
 *     .select('payment_detail, midtrans_payment_type')
 *     .eq('order_id', order.id)
 *     .single();
 */

import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Clock, RefreshCw } from 'lucide-react';
import { formatPrice } from '../../../lib/utils';

// ------------------------------------------------------------------
// Countdown timer hook — update setiap detik sampai expired
// ------------------------------------------------------------------
const useCountdown = (expiryTime) => {
  const calcRemaining = useCallback(() => {
    if (!expiryTime) return null;
    const diff = new Date(expiryTime).getTime() - Date.now();
    if (diff <= 0) return { expired: true, display: '00:00:00' };
    const h  = Math.floor(diff / 3_600_000);
    const m  = Math.floor((diff % 3_600_000) / 60_000);
    const s  = Math.floor((diff % 60_000) / 1_000);
    const pad = (n) => String(n).padStart(2, '0');
    return { expired: false, display: `${pad(h)}:${pad(m)}:${pad(s)}` };
  }, [expiryTime]);

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    if (!expiryTime) return;
    const id = setInterval(() => setRemaining(calcRemaining()), 1_000);
    return () => clearInterval(id);
  }, [expiryTime, calcRemaining]);

  return remaining;
};

// ------------------------------------------------------------------
// Tiny copy-to-clipboard button
// ------------------------------------------------------------------
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2_000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Tersalin' : 'Salin'}
    </button>
  );
};

// ------------------------------------------------------------------
// QRIS display
// ------------------------------------------------------------------
const QrisDisplay = ({ detail, total }) => {
  const remaining = useCountdown(detail.expiry_time);

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {/* QR image */}
      {detail.qr_url ? (
        <div className="relative">
          <img
            src={detail.qr_url}
            alt="QR Code Pembayaran"
            className="w-52 h-52 rounded-xl object-contain border border-gray-200 p-2"
          />
          {remaining?.expired && (
            <div className="absolute inset-0 bg-white/90 rounded-xl flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 text-gray-400" />
              <p className="text-xs text-gray-500 font-medium">QR Code kedaluwarsa</p>
            </div>
          )}
        </div>
      ) : (
        <div className="w-52 h-52 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50">
          <p className="text-xs text-gray-400">QR tidak tersedia</p>
        </div>
      )}

      {/* Total */}
      <div className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-widest">Total Pembayaran</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatPrice(total)}</p>
      </div>

      {/* Countdown */}
      {remaining && !remaining.expired && (
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" />
          QR berlaku {remaining.display}
        </div>
      )}
      {remaining?.expired && (
        <p className="text-sm text-red-500 font-medium">QR Code sudah kedaluwarsa</p>
      )}

      {/* Instructions */}
      <div className="w-full max-w-xs text-left space-y-1 text-xs text-gray-500">
        <p className="font-semibold text-gray-700 mb-2">Cara membayar:</p>
        {[
          'Buka aplikasi pembayaran (GoPay, OVO, Dana, dll)',
          'Pilih Bayar dengan QR',
          'Scan QR Code di atas',
          'Konfirmasi pembayaran',
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-500 flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5">
              {i + 1}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// Virtual Account display
// ------------------------------------------------------------------
const VaDisplay = ({ detail, total }) => {
  const remaining = useCountdown(detail.expiry_time);
  const bankName  = detail.bank || 'Bank';
  const vaNumber  = detail.va_number || '-';

  return (
    <div className="flex flex-col items-center gap-5 py-6 w-full">
      {/* Bank + VA Number */}
      <div className="w-full bg-gray-50 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
            Bank {bankName}
          </p>
          <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wide font-bold">
            Virtual Account
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-2xl font-bold text-gray-900 tracking-wider font-mono">
            {vaNumber}
          </p>
          <CopyButton text={vaNumber} />
        </div>
      </div>

      {/* Total */}
      <div className="text-center">
        <p className="text-xs text-gray-400 uppercase tracking-widest">Total Pembayaran</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatPrice(total)}</p>
      </div>

      {/* Countdown */}
      {remaining && !remaining.expired && (
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" />
          Bayar sebelum {remaining.display}
        </div>
      )}
      {remaining?.expired && (
        <p className="text-sm text-red-500 font-medium">Waktu pembayaran sudah habis</p>
      )}

      {/* Instructions */}
      <div className="w-full text-left space-y-1 text-xs text-gray-500">
        <p className="font-semibold text-gray-700 mb-2">Cara transfer:</p>
        {[
          `Login ke mobile banking atau ATM ${bankName}`,
          'Pilih Transfer → Virtual Account',
          `Masukkan nomor VA: ${vaNumber}`,
          `Konfirmasi pembayaran sejumlah ${formatPrice(total)}`,
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-500 flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5">
              {i + 1}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// Main export
// ------------------------------------------------------------------
export const PaymentDetailDisplay = ({ detail, total }) => {
  if (!detail) return null;

  const { payment_type } = detail;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Label */}
      <div className="px-5 pt-5 pb-0">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Instruksi Pembayaran
        </p>
      </div>

      <div className="px-5 pb-5">
        {payment_type === 'qris' && <QrisDisplay detail={detail} total={total} />}
        {payment_type === 'bank_transfer' && <VaDisplay detail={detail} total={total} />}
        {!['qris', 'bank_transfer'].includes(payment_type) && (
          <p className="py-6 text-center text-sm text-gray-400">
            Detail pembayaran tidak tersedia
          </p>
        )}
      </div>
    </div>
  );
};
