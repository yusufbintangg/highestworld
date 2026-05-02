import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { CourierCard, COURIER_LOGOS } from './CourierCard';
import { PaymentMethodModal, PAYMENT_METHODS, VA_BANKS } from './PaymentMethodModal';


export const CheckoutForm = ({
  formData,
  errors,
  user,
  areaSearch,
  areaResults,
  loadingArea,
  showAreaDropdown,
  selectedArea,
  shippingRates,
  loadingRates,
  selectedRate,
  paymentMethod,
  selectedVaBank,
  areaRef,
  onInputChange,
  onAreaInput,
  onSelectArea,
  onSelectRate,
  onPaymentMethodChange,    // untuk bank_transfer (manual)
  onPaymentMethodSelect,    // untuk Midtrans (QRIS, VA, OVO, dll)
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCourierModal, setShowCourierModal] = useState(false);

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod) || null;

  useEffect(() => {
    document.body.style.overflow = showCourierModal ? 'hidden' : 'auto';
  }, [showCourierModal]);

  return (
    <div className="lg:col-span-3 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Detail Alamat</h1>
      </div>

      {/* Email */}
      <div className="space-y-3">
        <input
          id="email" name="email" type="email"
          value={formData.email}
          onChange={onInputChange}
          disabled={!!user}
          placeholder="Alamat Email"
          className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition ${!!user ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''} ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        <p className="text-xs text-gray-400">
          {user
            ? 'Email ini sudah terisi berdasarkan data akun Anda.'
            : 'Pastikan email yang dimasukkan benar untuk menerima notifikasi pesanan, cek bagian spam jika email tidak muncul di inbox.'
          }
        </p>
      </div>

      {/* Nama */}
      <div className="space-y-3">
        <input
          id="firstName" name="firstName"
          value={formData.firstName}
          onChange={onInputChange}
          placeholder="Nama Lengkap Penerima"
          className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition ${errors.firstName ? 'border-red-400' : 'border-gray-200'}`}
        />
        {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
      </div>

      {/* Phone */}
      <div className="space-y-3">
        <input
          id="phone" name="phone" type="tel"
          value={formData.phone}
          onChange={onInputChange}
          placeholder="Nomor HP Penerima"
          className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
        />
        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
      </div>

      {/* Area Search */}
      <div ref={areaRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={areaSearch}
            onChange={onAreaInput}
            placeholder="Kecamatan dan Kota"
            className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition ${errors.area ? 'border-red-400' : selectedArea ? 'border-gray-400' : 'border-gray-200'}`}
          />
          {loadingArea && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
        </div>
        {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}

        {showAreaDropdown && areaResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {areaResults.map((area, i) => (
              <div key={i} onClick={() => onSelectArea(area)} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors">
                <p className="text-sm font-medium text-gray-900">
                  {area.administrative_division_level_3_name}, {area.administrative_division_level_2_name}
                </p>
                <p className="text-xs text-gray-400">
                  {area.administrative_division_level_1_name} • Kode Pos:{' '}
                  <span className="font-semibold text-gray-700">{area.postal_code}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {selectedArea && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-gray-600 shrink-0" />
            <p className="text-xs text-gray-600">
              {selectedArea.administrative_division_level_3_name},{' '}
              {selectedArea.administrative_division_level_2_name},{' '}
              {selectedArea.administrative_division_level_1_name} — Kode Pos:{' '}
              <strong>{selectedArea.postal_code}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Detail Alamat */}
      <div className="space-y-1">
        <textarea
          id="address" name="address"
          value={formData.address}
          onChange={onInputChange}
          placeholder="Detail Alamat"
          rows={4}
          maxLength={250}
          className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition resize-none ${errors.address ? 'border-red-400' : 'border-gray-200'}`}
        />
        <div className="flex justify-between items-center">
          {errors.address ? <p className="text-xs text-red-500">{errors.address}</p> : <span />}
          <p className="text-xs text-gray-400 text-right">{formData.address.length} / 250</p>
        </div>
      </div>

      {/* Catatan */}
      <div>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={onInputChange}
          placeholder="Catatan pesanan (opsional)"
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition resize-none"
        />
      </div>

      {/* Metode Pengiriman */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Metode Pengiriman</h2>
        {loadingRates && (
          <div className="flex items-center gap-2 px-4 py-4 rounded-xl border border-gray-200 bg-gray-50">
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            <span className="text-sm text-gray-500">Mengecek ongkir...</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowCourierModal(true)}
          className="w-full flex h-16 items-center justify-between px-4 py-4 border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            {selectedRate ? (
              <>
                <img
                  src={COURIER_LOGOS[selectedRate.courier_code]}
                  alt={selectedRate.courier_name}
                  className="h-10 w-10 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="text-sm font-medium text-gray-900">
                  {selectedRate.courier_name} - {selectedRate.courier_service_name}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-700">Pilih metode pengiriman</span>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {showCourierModal && (
          <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowCourierModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white rounded-2xl w-full max-w-md p-5 z-10"
              >
                <h2 className="text-lg font-bold mb-4">Pilih Pengiriman</h2>
                {shippingRates.length === 0 && !loadingRates ? (
                  <span className="text-xs text-gray-500 mb-3 block">Isi alamat dulu</span>
                ) : null}
                <div className="max-h-180 overflow-y-auto divide-y">
                  {shippingRates.map((rate, i) => (
                    <CourierCard
                      key={i}
                      rate={rate}
                      selected={
                        selectedRate?.courier_code === rate.courier_code &&
                        selectedRate?.courier_service_code === rate.courier_service_code
                      }
                      onClick={() => {
                        onSelectRate(rate);
                        setShowCourierModal(false);
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Metode Pembayaran */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Metode Pembayaran</h2>
        <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">

          {/* Midtrans — klik buka modal */}
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="w-full flex items-center justify-between px-4 py-5 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${paymentMethod && paymentMethod !== 'bank_transfer' ? 'border-black' : 'border-gray-300'}`}>
                {paymentMethod && paymentMethod !== 'bank_transfer' && (
                  <div className="w-2 h-2 rounded-full bg-black" />
                )}
              </div>
              <div>
                {selectedMethod ? (
                  <div className="h-6 flex items-center">
                    {selectedMethod.id === 'va' && selectedVaBank ? (
                      // tampil logo bank yang dipilih
                      (() => {
                        const VA_BANKS = [
                          { id: 'mandiri', logo: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1777711468/i7e1nwbzexqfjaqdlelt.png' },
                          { id: 'bri',     logo: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1777711447/0f7fdf08-32f9-4266-bd89-89f6a8b1c416.png' },
                          { id: 'bni',     logo: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1777710112/Bank_Negara_Indonesia_logo__2004.svg_d7jlic.png' },
                          { id: 'permata', logo: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1777711488/pkqlpxcmdpaj49acarxf.png' },
                        ];
                        const bank = VA_BANKS.find(b => b.id === selectedVaBank);
                        return bank ? (
                          <img src={bank.logo} alt={selectedVaBank} className="h-5 w-auto object-contain" />
                        ) : (
                          <p className="text-xs font-semibold text-black">Virtual Account — {selectedVaBank.toUpperCase()}</p>
                        );
                      })()
                    ) : (
                      selectedMethod.logo
                    )}
                   </div>
                 ) : (
                  <p className="text-xs text-gray-400">QRIS, OVO, VA, Kartu Kredit, dll</p>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>

          {/* Transfer Bank Manual */}
          <button
            type="button"
            onClick={() => onPaymentMethodChange('bank_transfer')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${paymentMethod === 'bank_transfer' ? 'border-black' : 'border-gray-300'}`}>
                {paymentMethod === 'bank_transfer' && <div className="w-2 h-2 rounded-full bg-black" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Transfer Bank Manual</p>
                <p className="text-xs text-gray-400">Konfirmasi via WhatsApp</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
       </button>
        </div>
      </div>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selected={PAYMENT_METHODS.find(m => m.id === paymentMethod)}
        selectedBank={selectedVaBank}
        onSelect={(method, bank) => {
          onPaymentMethodSelect(method, bank);
          setShowPaymentModal(false);
        }}
      />
    </div>
  );
};