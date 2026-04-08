import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBag, CreditCard, Truck, MapPin, User, Building2, ArrowLeft, Loader2, Search, CheckCircle2, Tag, ChevronRight, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Textarea } from '../components/ui/textarea';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/utils';
import { WHATSAPP_NUMBER } from '../../lib/config';
import { openMidtransPayment, generateOrderId } from '../../lib/midtrans';
import { toast } from 'sonner';

const CourierCard = ({ rate, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`px-4 py-3 border-b last:border-b-0 cursor-pointer transition-all flex items-center justify-between gap-3 hover:bg-gray-50 ${
      selected ? 'bg-gray-50' : ''
    }`}
  >
    <div className="flex items-center gap-3 min-w-0">
      {selected
        ? <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
        : <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
      }
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{rate.courier_name}</p>
        <p className="text-xs text-gray-500">{rate.courier_service_name} • Est. {rate.duration}</p>
      </div>
    </div>
    <p className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(rate.price)}</p>
  </div>
);

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('midtrans');

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', province: '', postalCode: '', notes: '',
  });

  const [errors, setErrors] = useState({});
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [loadingRates, setLoadingRates] = useState(false);

  const [areaSearch, setAreaSearch] = useState('');
  const [areaResults, setAreaResults] = useState([]);
  const [loadingArea, setLoadingArea] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const areaRef = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error('Keranjang Anda kosong');
      navigate('/produk');
    }
  }, [cartItems, navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (areaRef.current && !areaRef.current.contains(e.target)) {
        setShowAreaDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cartTotal = getCartTotal();
  const shippingCost = selectedRate?.price || 0;
  const grandTotal = cartTotal + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const searchArea = async (keyword) => {
    if (!keyword || keyword.length < 3) {
      setAreaResults([]);
      setShowAreaDropdown(false);
      return;
    }
    setLoadingArea(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/biteship-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
        body: JSON.stringify({ keyword }),
      });
      const data = await response.json();
      if (data.areas?.length > 0) {
        setAreaResults(data.areas);
        setShowAreaDropdown(true);
      } else {
        setAreaResults([]);
        setShowAreaDropdown(false);
      }
    } catch (error) {
      console.error('Area search error:', error);
    } finally {
      setLoadingArea(false);
    }
  };

  const handleAreaInput = (e) => {
    const value = e.target.value;
    setAreaSearch(value);
    setSelectedArea(null);
    setShippingRates([]);
    setSelectedRate(null);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchArea(value), 400);
  };

  const handleSelectArea = (area) => {
    setSelectedArea(area);
    setAreaSearch(`${area.administrative_division_level_3_name}, ${area.administrative_division_level_2_name}`);
    setFormData(prev => ({
      ...prev,
      city: area.administrative_division_level_2_name || area.name,
      province: area.administrative_division_level_1_name || '',
      postalCode: String(area.postal_code) || '',
    }));
    setShowAreaDropdown(false);
    setAreaResults([]);
    if (area.postal_code) {
      setTimeout(() => fetchShippingRates(String(area.postal_code)), 300);
    }
  };

  const fetchShippingRates = async (postalCode) => {
    const kodePos = postalCode || formData.postalCode;
    if (!kodePos || String(kodePos).length !== 5) return;
    setLoadingRates(true);
    setSelectedRate(null);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const totalWeight = cartItems.reduce((sum, item) => sum + ((item.product.weight || 500) * item.quantity), 0);
      const response = await fetch(`${supabaseUrl}/functions/v1/biteship-rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
        body: JSON.stringify({
          origin_postal_code: '50265',
          destination_postal_code: String(kodePos),
          weight: totalWeight,
          item_value: cartTotal,
        }),
      });
      const data = await response.json();
      if (data.pricing) {
        setShippingRates(data.pricing);
      } else {
        toast.error('Ongkir tidak tersedia untuk area ini');
      }
    } catch (error) {
      toast.error('Gagal cek ongkir. Coba lagi.');
    } finally {
      setLoadingRates(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Nama depan wajib diisi';
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^[0-9]{10,13}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Nomor telepon harus 10-13 digit';
    }
    if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
    if (!selectedArea) newErrors.area = 'Pilih kota/kecamatan dari dropdown';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMidtransPayment = async () => {
    setIsProcessing(true);
    if (!selectedRate) {
      toast.error('Pilih kurir pengiriman dulu');
      setIsProcessing(false);
      return;
    }
    try {
      const orderPayload = {
        order: { notes: formData.notes || null },
        customer: {
          name: `${formData.firstName} ${formData.lastName || ''}`.trim(),
          phone: formData.phone,
          email: formData.email,
        },
        shipping: {
          address: formData.address,
          city: formData.city,
          city_id: 1,
          province: formData.province,
          postal_code: formData.postalCode,
          courier: selectedRate?.courier_code || 'jne',
          service: selectedRate?.courier_service_code || 'REG',
          cost: shippingCost,
          etd: selectedRate?.duration || '2-3 hari',
        },
        items: cartItems.map(item => ({
          product_id: item.product.id,
          variant_id: item.variantId || null,
          name: item.product.name,
          price: item.product.price,
          qty: item.quantity,
          size: item.size,
          sku: item.sku || null,
          variant_images: item.variantImages || [],
        })),
      };

      await openMidtransPayment(orderPayload, {
        onSuccess: (result) => {
          clearCart();
          window.location.href = '/pesanan/' + result.order_number;
        },
        onPending: (result) => {
          clearCart();
          window.location.href = '/pesanan/' + result.order_number;
        },
        onError: () => {
          toast.error('Pembayaran gagal. Silakan coba lagi.');
          setIsProcessing(false);
        },
        onClose: (result) => {
          setIsProcessing(false);
          if (result?.order_number) {
            window.location.href = '/pesanan/' + result.order_number;
          }
        },
      });
    } catch (error) {
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
      setIsProcessing(false);
    }
  };

  const handleBankTransferPayment = () => {
    setIsProcessing(true);
    const orderId = generateOrderId();
    let message = `📦 PESANAN BARU - ${orderId}\n\n`;
    message += `👤 DATA PEMBELI:\nNama: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nTelepon: ${formData.phone}\n\n`;
    message += `📍 ALAMAT:\n${formData.address}\n${formData.city}, ${formData.province} ${formData.postalCode}\n\n`;
    if (formData.notes) message += `📝 Catatan: ${formData.notes}\n\n`;
    message += `🛍️ PESANAN:\n`;
    cartItems.forEach((item, i) => {
      message += `${i + 1}. ${item.product.name} • ${item.sku || item.color || ''} • ${item.size} • ${item.quantity}x • ${formatPrice(item.product.price)}\n`;
    });
    message += `\n💰 Subtotal: ${formatPrice(cartTotal)}\nOngkir: ${formatPrice(shippingCost)}\nTotal: ${formatPrice(grandTotal)}\n\nMohon kirimkan detail rekening. Terima kasih!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    setTimeout(() => { clearCart(); navigate('/konfirmasi-pembayaran'); }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Mohon lengkapi semua data yang wajib diisi');
      return;
    }
    if (paymentMethod === 'midtrans') {
      await handleMidtransPayment();
    } else {
      handleBankTransferPayment();
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-white pt-20 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8 mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="grid lg:grid-cols-5 gap-10">

          {/* ─── LEFT: Form ─── */}
          <div className="lg:col-span-3 space-y-8">

            {/* Detail Alamat header */}
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
                onChange={handleInputChange}
                placeholder="Alamat Email (opsional)"
                className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition ${
                  errors.email ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.email
                ? <p className="text-xs text-red-500">{errors.email}</p>
                : <p className="text-xs text-gray-400">Detail pesanan akan dikirim ke email</p>
              }
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-3">
              <input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Nama Lengkap Penerima"
                className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition ${
                  errors.firstName ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
            </div>

            {/* Nomor HP */}
            <div className="space-y-3">
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nomor HP Penerima"
                className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition ${
                  errors.phone ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>

            {/* Negara */}
            <div className="relative">
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-gray-200 transition appearance-none"
                defaultValue="ID"
              >
                <option value="ID">Indonesia</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
              <label className="absolute left-4 top-2 text-[10px] text-gray-400 font-medium tracking-wide">Negara</label>
            </div>

            {/* Kota / Kecamatan (Area Search) */}
            <div ref={areaRef} className="relative">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={areaSearch}
                  onChange={handleAreaInput}
                  placeholder="Kota dan Kecamatan"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition ${
                    errors.area ? 'border-red-400' : selectedArea ? 'border-gray-400' : 'border-gray-200'
                  }`}
                />
                {loadingArea && (
                  <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
              {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}

              {/* Dropdown results */}
              {showAreaDropdown && areaResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {areaResults.map((area, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectArea(area)}
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
                onChange={handleInputChange}
                placeholder="Detail Alamat"
                rows={4}
                maxLength={250}
                className={`w-full px-4 py-3 rounded-xl border text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition resize-none ${
                  errors.address ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              <div className="flex justify-between items-center">
                {errors.address
                  ? <p className="text-xs text-red-500">{errors.address}</p>
                  : <span />
                }
                <p className="text-xs text-gray-400 text-right">{formData.address.length} / 250</p>
              </div>
            </div>

            {/* Catatan pesanan */}
            <div>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Catatan pesanan (opsional)"
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200 transition resize-none"
              />
            </div>

            {/* ─── Metode Pengiriman ─── */}
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
                      onClick={() => setSelectedRate(rate)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ─── Metode Pembayaran ─── */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Metode Pembayaran</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                  {/* Midtrans */}
                  <label
                    htmlFor="midtrans"
                    className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="midtrans" id="midtrans" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Pembayaran Online (Midtrans)</p>
                        <p className="text-xs text-gray-400">Kartu Kredit, E-wallet, Virtual Account</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </label>

                  {/* Bank Transfer */}
                  <label
                    htmlFor="bank_transfer"
                    className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
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

          {/* ─── RIGHT: Order Summary ─── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border border-gray-200 overflow-hidden">

              {/* Cart items */}
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

              {/* Pesan pengiriman */}
              <button className="w-full flex items-center justify-between px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-gray-500">Tinggalkan pesan pengiriman (opsional)</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <Separator />

              {/* Voucher */}
              <button className="w-full flex items-center justify-between px-5 py-3.5 text-sm hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 text-gray-700">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span>Voucher</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <Separator />

              {/* Pricing breakdown */}
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

              {/* Total */}
              <div className="px-5 py-4 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total Pembayaran</span>
                <span className="text-lg font-bold text-gray-900">{formatPrice(grandTotal)}</span>
              </div>

              {/* Secure badge */}
              <div className="px-5 pb-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <Lock className="w-3 h-3" />
                <span>Transaksi Aman | Pembayaran telah terenkripsi.</span>
              </div>

              {/* Import warning */}
              <div className="mx-5 mb-4 px-4 py-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 leading-relaxed">
                  Bea atau pajak impor mungkin dikenakan tergantung negara tujuan pengiriman.
                </p>
              </div>

              {/* CTA */}
              <div className="px-5 pb-5">
                <button
                  onClick={handleSubmit}
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

        </div>
      </div>
    </div>
  );
};