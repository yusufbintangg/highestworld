import { Loader2, Tag, ChevronRight, Lock } from 'lucide-react';
import { Separator } from '../ui/separator';
import { formatPrice } from '../../../lib/utils';

export const OrderSummary = ({
  cartItems,
  cartTotal,
  shippingCost,
  grandTotal,
  loadingRates,
  selectedRate,
  paymentMethod,
  isProcessing,
  onSubmit,
}) => {
  return (
    <div className="lg:col-span-2">
      <div className="sticky top-24 rounded-2xl border border-gray-200 overflow-hidden">

        {/* Cart Items */}
        <div className="p-5 space-y-4 max-h-64 overflow-y-auto">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative shrink-0">
                <img
                  src={item.variantImages?.length > 0 ? item.variantImages[0] : item.product.images?.[0]}
                  alt={item.product.name}
                  className="w-14 h-14 object-cover rounded-lg border border-gray-100"
                />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{item.product.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{item.sku || item.color} • {item.size}</p>
              </div>
              <div className="text-sm font-semibold text-gray-900 shrink-0">
                {formatPrice(item.product.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <button className="w-full flex items-center justify-between px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <span className="text-gray-500">Tinggalkan pesan pengiriman (opsional)</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <Separator />

        <button className="w-full flex items-center justify-between px-5 py-3.5 text-sm hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2 text-gray-700">
            <Tag className="w-4 h-4 text-gray-400" />
            <span>Voucher</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <Separator />

        {/* Totals */}
        <div className="px-5 py-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal • {cartItems.reduce((s, i) => s + i.quantity, 0)} barang</span>
            <span className="font-medium text-gray-900">{formatPrice(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Pengiriman</span>
            <span className="font-medium text-gray-900">
              {loadingRates
                ? <Loader2 className="w-3 h-3 animate-spin inline" />
                : shippingCost > 0 ? formatPrice(shippingCost) : '-'
              }
            </span>
          </div>
          {selectedRate && (
            <p className="text-xs text-gray-400 text-right">{selectedRate.courier_name} {selectedRate.courier_service_name}</p>
          )}
        </div>

        <Separator />

        <div className="px-5 py-4 flex justify-between items-center">
          <span className="text-base font-bold text-gray-900">Total Pembayaran</span>
          <span className="text-lg font-bold text-gray-900">{formatPrice(grandTotal)}</span>
        </div>

        <div className="px-5 pb-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <Lock className="w-3 h-3" />
          <span>Transaksi Aman | Pembayaran telah terenkripsi.</span>
        </div>

        <div className="mx-5 mb-4 px-4 py-3 bg-blue-50 rounded-xl">
          <p className="text-xs text-blue-600 leading-relaxed">
            Bea atau pajak impor mungkin dikenakan tergantung negara tujuan pengiriman.
          </p>
        </div>

        {/* Submit */}
        <div className="px-5 pb-5">
          <button
            onClick={onSubmit}
            disabled={isProcessing}
            className="w-full py-3.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-900 active:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Memproses...</>
            ) : (
              paymentMethod === 'midtrans' ? 'Order Sekarang' : 'Lanjutkan ke WhatsApp'
            )}
          </button>
          <p className="text-[11px] text-center text-gray-400 mt-3">
            Dengan melakukan pesanan, telah setuju dengan{' '}
            <a href="/syarat-ketentuan" className="underline text-gray-600 hover:text-gray-900">Syarat & Ketentuan</a>
          </p>
        </div>

      </div>
    </div>
  );
};
