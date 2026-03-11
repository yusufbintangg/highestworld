import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBag, CreditCard, Truck, MapPin, User, Building2, ArrowLeft, Loader2, Search, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Textarea } from '../components/ui/textarea';
import { useCart } from '../../context/CartContext';
import { formatPrice, generateCartWAMessage } from '../../lib/utils';
import { SHIPPING_INFO, WHATSAPP_NUMBER } from '../../lib/config';
import { openMidtransPayment, generateOrderId } from '../../lib/midtrans';
import { toast } from 'sonner';

const CourierCard = ({ rate, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`p-3 rounded-lg m-4 border cursor-pointer transition-all ${
      selected
        ? 'border-accent-gold bg-accent-gold/10 ring-1 ring-accent-gold'
        : 'border-border hover:border-accent-gold/50'
    }`}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {selected && <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />}
        <div className="min-w-0">
          <p className="font-medium text-sm">{rate.courier_name}</p>
          <p className="text-xs text-muted-foreground">{rate.courier_service_name} • Est. {rate.duration}</p>
        </div>
      </div>
      <p className="font-mono font-bold text-accent-gold shrink-0">{formatPrice(rate.price)}</p>
    </div>
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
          color: item.color,
          variant_images: item.variantImages || [],
        })),
      };
      await openMidtransPayment(orderPayload, {
        onSuccess: (result) => {
          toast.success('Pembayaran berhasil!');
          clearCart();
          setTimeout(() => navigate('/pesanan/' + result.order_number), 300);
        },
        onPending: (result) => {
          toast.info('Selesaikan pembayaran sebelum expired!');
          clearCart();
          setTimeout(() => navigate('/pesanan/' + result.order_number), 300);
        },
        onError: () => {
          toast.error('Pembayaran gagal. Silakan coba lagi.');
          setIsProcessing(false);
        },
        onClose: () => { setIsProcessing(false); },
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
      message += `${i + 1}. ${item.product.name} • ${item.color} • ${item.size} • ${item.quantity}x • ${formatPrice(item.product.price)}\n`;
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
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>
        <div className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl tracking-wider mb-2">CHECKOUT</h1>
          <p className="text-muted-foreground">Lengkapi data Anda untuk menyelesaikan pesanan</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Customer Info */}
            <div className="bg-secondary p-6 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-accent-gold" />
                <h2 className="font-subheading text-xl uppercase tracking-wider">Informasi Pembeli</h2>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nama Depan *</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" className={errors.firstName ? 'border-destructive' : ''} />
                    {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nama Belakang</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" className={errors.email ? 'border-destructive' : ''} />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Nomor Telepon *</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="081234567890" className={errors.phone ? 'border-destructive' : ''} />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-secondary p-6 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-accent-gold" />
                <h2 className="font-subheading text-xl uppercase tracking-wider">Alamat Pengiriman</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Alamat Lengkap *</Label>
                  <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Jl. Contoh No. 123, RT/RW 001/002" rows={3} className={errors.address ? 'border-destructive' : ''} />
                  {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                </div>

                {/* Area Search */}
                <div ref={areaRef} className="relative">
                  <Label>Kecamatan / Kota *</Label>
                  <p className="text-xs text-muted-foreground mb-1">Ketik nama kecamatan atau kota untuk mencari area pengiriman</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={areaSearch}
                      onChange={handleAreaInput}
                      placeholder="Kecamatan, Kota..."
                      className={`pl-9 ${errors.area ? 'border-destructive' : selectedArea ? 'border-accent-gold' : ''}`}
                    />
                    {loadingArea && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
                  </div>
                  {errors.area && <p className="text-xs text-destructive mt-1">{errors.area}</p>}

                  {/* Dropdown */}
                  {showAreaDropdown && areaResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
                      {areaResults.map((area, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectArea(area)}
                          className="px-4 py-3 hover:bg-secondary cursor-pointer border-b border-border last:border-0 transition-colors"
                        >
                          <p className="text-sm font-medium">
                            {area.administrative_division_level_3_name}, {area.administrative_division_level_2_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {area.administrative_division_level_1_name} • Kode Pos: <span className="font-mono font-semibold text-foreground">{area.postal_code}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedArea && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-accent-gold/10 border border-accent-gold/30 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                      <p className="text-xs text-accent-gold">
                        {selectedArea.administrative_division_level_3_name}, {selectedArea.administrative_division_level_2_name}, {selectedArea.administrative_division_level_1_name} — Kode Pos: <strong>{selectedArea.postal_code}</strong>
                      </p>
                    </div>
                  )}
                </div>

                {/* Kurir */}
                {loadingRates && (
                  <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg border border-border">
                    <Loader2 className="w-4 h-4 animate-spin text-accent-gold" />
                    <span className="text-sm text-muted-foreground">Mengecek ongkir...</span>
                  </div>
                )}

                {shippingRates.length > 0 && !loadingRates && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-accent-gold" />
                      <Label>Pilih Kurir Pengiriman *</Label>
                    </div>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
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
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Catatan Pesanan (Opsional)</Label>
                  <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Contoh: Tolong kirim sebelum tanggal 25" rows={2} />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-secondary p-6 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-accent-gold" />
                <h2 className="font-subheading text-xl uppercase tracking-wider">Metode Pembayaran</h2>
              </div>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:border-accent-gold transition-colors cursor-pointer">
                    <RadioGroupItem value="midtrans" id="midtrans" className="mt-1" />
                    <Label htmlFor="midtrans" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4 text-accent-gold" />
                        <span className="font-medium">Pembayaran Online (Midtrans)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Kartu Kredit, E-wallet, Bank Transfer Virtual Account</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {['VISA','Mastercard','GoPay','OVO','DANA','ShopeePay'].map(m => (
                          <span key={m} className="text-[10px] px-2 py-0.5 bg-accent-gold/20 text-accent-gold rounded">{m}</span>
                        ))}
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:border-accent-gold transition-colors cursor-pointer">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" className="mt-1" />
                    <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-accent-gold" />
                        <span className="font-medium">Transfer Bank Manual</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Lanjutkan ke WhatsApp untuk konfirmasi pembayaran</p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-secondary p-6 rounded-lg border border-border sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-5 h-5 text-accent-gold" />
                <h2 className="font-subheading text-xl uppercase tracking-wider">Ringkasan</h2>
              </div>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.variantImages?.length > 0 ? item.variantImages[0] : item.product.images?.[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium line-clamp-2 mb-1">{item.product.name}</h3>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>{item.color} • {item.size}</p>
                        <p>Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-sm font-mono font-medium text-accent-gold">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ongkir</span>
                  <span className="font-mono">
                    {loadingRates ? <Loader2 className="w-3 h-3 animate-spin inline" /> : shippingCost > 0 ? formatPrice(shippingCost) : '-'}
                  </span>
                </div>
                {selectedRate && (
                  <p className="text-xs text-muted-foreground text-right">{selectedRate.courier_name} {selectedRate.courier_service_name}</p>
                )}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center mb-6">
                <span className="font-subheading uppercase tracking-wider">Total</span>
                <span className="font-mono text-2xl font-bold text-accent-gold">{formatPrice(grandTotal)}</span>
              </div>
              <Button onClick={handleSubmit} disabled={isProcessing} className="w-full bg-accent-gold hover:bg-accent-gold-light text-accent-gold font-subheading uppercase h-12">
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Memproses...</>
                ) : (
                  paymentMethod === 'midtrans' ? 'Bayar Sekarang' : 'Lanjutkan ke WhatsApp'
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};