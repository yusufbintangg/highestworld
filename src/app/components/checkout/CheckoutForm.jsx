import { useRef } from 'react';
import { Search, Loader2, CheckCircle2 } from 'lucide-react';
import { CourierCard } from './CourierCard';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ChevronRight } from 'lucide-react';

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
  areaRef,
  onInputChange,
  onAreaInput,
  onSelectArea,
  onSelectRate,
  onPaymentMethodChange,
}) => {
  return (
    <div className="lg:col-span-3 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Detail Alamat</h1>
      </div>

      {/* Email */}
      <div className="space-y-3">
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onInputChange}
          disabled={!!user}
          placeholder="Alamat Email"
          className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition ${!!user ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''} ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
        />
        {errors.email
          ? <p className="text-xs text-red-500">{errors.email}</p>
          : <p className="text-xs text-gray-400">Detail pesanan akan dikirim ke email</p>
        }
      </div>

      {/* Nama */}
      <div className="space-y-3">
        <input
          id="firstName"
          name="firstName"
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
          id="phone"
          name="phone"
          type="tel"
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
          {loadingArea && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>
        {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}

        {showAreaDropdown && areaResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {areaResults.map((area, i) => (
              <div
                key={i}
                onClick={() => onSelectArea(area)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900">
                  {area.administrative_division_level_3_name}, {area.administrative_division_level_2_name}
                </p>
                <p className="text-xs text-gray-400">
                  {area.administrative_division_level_1_name} • Kode Pos: <span className="font-semibold text-gray-700">{area.postal_code}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {selectedArea && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-gray-600 shrink-0" />
            <p className="text-xs text-gray-600">
              {selectedArea.administrative_division_level_3_name}, {selectedArea.administrative_division_level_2_name}, {selectedArea.administrative_division_level_1_name} — Kode Pos: <strong>{selectedArea.postal_code}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Detail Alamat */}
      <div className="space-y-1">
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={onInputChange}
          placeholder="Detail Alamat"
          rows={4}
          maxLength={250}
          className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition resize-none ${errors.address ? 'border-red-400' : 'border-gray-200'}`}
        />
        <div className="flex justify-between items-center">
          {errors.address
            ? <p className="text-xs text-red-500">{errors.address}</p>
            : <span />
          }
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

        {!selectedArea && !loadingRates && shippingRates.length === 0 && (
          <div className="px-4 py-4 rounded-xl border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">Lengkapi rincian alamat untuk melihat metode pengiriman yang tersedia.</p>
          </div>
        )}

        {loadingRates && (
          <div className="flex items-center gap-2 px-4 py-4 rounded-xl border border-gray-200 bg-gray-50">
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            <span className="text-sm text-gray-500">Mengecek ongkir...</span>
          </div>
        )}

        {shippingRates.length > 0 && !loadingRates && (
          <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {shippingRates.map((rate, i) => (
              <CourierCard
                key={i}
                rate={rate}
                selected={
                  selectedRate?.courier_code === rate.courier_code &&
                  selectedRate?.courier_service_code === rate.courier_service_code
                }
                onClick={() => onSelectRate(rate)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Metode Pembayaran */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Metode Pembayaran</h2>
        <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange}>
          <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
            <label htmlFor="midtrans" className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="midtrans" id="midtrans" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Pembayaran Online (Midtrans)</p>
                  <p className="text-xs text-gray-400">Kartu Kredit, E-wallet, Virtual Account</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </label>
            <label htmlFor="bank_transfer" className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Transfer Bank Manual</p>
                  <p className="text-xs text-gray-400">Konfirmasi via WhatsApp</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
