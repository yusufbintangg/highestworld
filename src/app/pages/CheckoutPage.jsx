import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBag, CreditCard, Truck, MapPin, User, Mail, Phone, Building2, ArrowLeft, Loader2 } from 'lucide-react';
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

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('midtrans');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [loadingRates, setLoadingRates] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error('Keranjang Anda kosong');
      navigate('/produk');
    }
  }, [cartItems, navigate]);

  // Calculate shipping cost
  const cartTotal = getCartTotal();
  const shippingCost = selectedRate?.price || 0;
  const grandTotal = cartTotal + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const fetchShippingRates = async () => {
    if (!formData.postalCode || formData.postalCode.length !== 5) return;

    setLoadingRates(true);
    setSelectedRate(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const totalWeight = cartItems.reduce((sum, item) => {
        return sum + ((item.product.weight || 500) * item.quantity);
      }, 0);

      const response = await fetch(`${supabaseUrl}/functions/v1/biteship-rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          origin_postal_code: '50241', // Kode pos gudang lo — ganti sesuai alamat toko
          destination_postal_code: formData.postalCode,
          weight: totalWeight,
          item_value: cartTotal,
        }),
      });

      const data = await response.json();
      if (data.pricing) {
        setShippingRates(data.pricing);
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
    if (!formData.city.trim()) newErrors.city = 'Kota wajib diisi';
    if (!formData.province.trim()) newErrors.province = 'Provinsi wajib diisi';
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Kode pos wajib diisi';
    } else if (!/^[0-9]{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Kode pos harus 5 digit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMidtransPayment = async () => {
    setIsProcessing(true);
      if (paymentMethod === 'midtrans' && !selectedRate) {
    toast.error('Pilih kurir pengiriman dulu');
    return;
  }

    try {
      // Format data untuk edge function
      const orderPayload = {
        order: {
          notes: formData.notes || null,
        },
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
          price: item.product.price || item.product.price,
          qty: item.quantity,
          size: item.size,
          color: item.color,
          variant_images: item.variantImages || [],
        })),
      };


      console.log('Sending to edge function:', orderPayload);

      await openMidtransPayment(orderPayload, {
        onSuccess: (result) => {
  console.log('Payment Success:', result);
  toast.success('Pembayaran berhasil!');
  clearCart();
  const orderNum = result.order_number;
  setTimeout(() => navigate('/pesanan/' + orderNum), 300);
},
onPending: (result) => {
  console.log('Payment Pending:', result);
  toast.info('Selesaikan pembayaran sebelum expired!');
  clearCart();
  const orderNum = result.order_number;
  setTimeout(() => navigate('/pesanan/' + orderNum), 300);
},
        onError: (result) => {
          console.log('Payment Error:', result);
          toast.error('Pembayaran gagal. Silakan coba lagi.');
          setIsProcessing(false);
        },
        onClose: () => {
          console.log('Payment popup closed');
          setIsProcessing(false);
        },
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
      setIsProcessing(false);
    }
  };

  const handleBankTransferPayment = () => {
    setIsProcessing(true);

    // Generate order details message for WhatsApp
    const orderId = generateOrderId();
    let message = `📦 PESANAN BARU - ${orderId}\n\n`;
    message += `👤 DATA PEMBELI:\n`;
    message += `Nama: ${formData.firstName} ${formData.lastName}\n`;
    message += `Email: ${formData.email}\n`;
    message += `Telepon: ${formData.phone}\n\n`;
    message += `📍 ALAMAT PENGIRIMAN:\n`;
    message += `${formData.address}\n`;
    message += `${formData.city}, ${formData.province} ${formData.postalCode}\n\n`;
    if (formData.notes) {
      message += `📝 Catatan: ${formData.notes}\n\n`;
    }
    message += `🛍️ PESANAN:\n`;
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   • Warna: ${item.color}\n`;
      message += `   • Ukuran: ${item.size}\n`;
      message += `   • Qty: ${item.quantity}x\n`;
      message += `   • Harga: ${formatPrice(item.product.price)}\n\n`;
    });
    message += `💰 RINGKASAN:\n`;
    message += `Subtotal: ${formatPrice(cartTotal)}\n`;
    message += `Ongkir: ${ formatPrice(shippingCost)}\n`;
    message += `Total: ${formatPrice(grandTotal)}\n\n`;
    message += `Mohon kirimkan detail rekening untuk transfer. Terima kasih!`;

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    // Store order data in localStorage for confirmation page
    localStorage.setItem('pending_order', JSON.stringify({
      orderId,
      formData,
      cartItems,
      cartTotal,
      shippingCost,
      grandTotal,
      timestamp: Date.now()
    }));

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank');

    // Clear cart and redirect
    setTimeout(() => {
      toast.success('Pesanan Anda sedang diproses. Silakan lanjutkan pembayaran via WhatsApp.');
      clearCart();
      navigate('/konfirmasi-pembayaran');
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Mohon lengkapi semua data yang wajib diisi');
      return;
    }

    if (paymentMethod === 'midtrans') {
      await handleMidtransPayment();
    } else if (paymentMethod === 'bank_transfer') {
      handleBankTransferPayment();
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl tracking-wider mb-2">
            CHECKOUT
          </h1>
          <p className="text-muted-foreground">
            Lengkapi data Anda untuk menyelesaikan pesanan
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-secondary p-6 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-accent-gold" />
                <h2 className="font-subheading text-xl uppercase tracking-wider">
                  Informasi Pembeli
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nama Depan *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className={errors.firstName ? 'border-destructive' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-destructive mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nama Belakang</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Nomor Telepon *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="081234567890"
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Shipping Address */}
            <div className="bg-secondary p-6 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-accent-gold" />
                <h2 className="font-subheading text-xl uppercase tracking-wider">
                  Alamat Pengiriman
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Alamat Lengkap *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Jl. Contoh No. 123, RT/RW 001/002"
                    rows={3}
                    className={errors.address ? 'border-destructive' : ''}
                  />
                  {errors.address && (
                    <p className="text-xs text-destructive mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Kota *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Jakarta"
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && (
                      <p className="text-xs text-destructive mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="province">Provinsi *</Label>
                    <Input
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      placeholder="DKI Jakarta"
                      className={errors.province ? 'border-destructive' : ''}
                    />
                    {errors.province && (
                      <p className="text-xs text-destructive mt-1">{errors.province}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Kode Pos *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="12345"
                      maxLength={5}
                      className={errors.postalCode ? 'border-destructive' : ''}
                    />
                    {errors.postalCode && (
                      <p className="text-xs text-destructive mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                  {/* Cek Ongkir */}
                  <div className="mt-4">
                    <Label className=''> Cek Ongkir</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={fetchShippingRates}
                      disabled={!formData.postalCode || formData.postalCode.length !== 5 || loadingRates}
                      className="w-full"
                    >
                      {loadingRates ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengecek ongkir...</>
                      ) : (
                        <><Truck className="w-4 h-4 mr-2" /> Cek Ongkir</>
                      )}
                    </Button>
                  </div>
                    
                  {/* Pilih Kurir */}
                  {shippingRates.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <Label>Pilih Kurir & Layanan *</Label>
                      <span className='text-1xl text-muted-foreground '>
                        Kurir yang anda Pilih: {selectedRate?.courier_name} - {selectedRate?.courier_service_name}
                      </span>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {shippingRates.map((rate, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedRate(rate)}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedRate?.courier_code === rate.courier_code && selectedRate?.courier_service_code === rate.courier_service_code
                                ? 'border-accent-gold bg-accent-gold/10'
                                : 'border-border hover:border-accent-gold/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{rate.courier_name} - {rate.courier_service_name}</p>
                                <p className="text-xs text-muted-foreground">Estimasi {rate.duration}</p>
                              </div>
                              <p className="font-mono font-bold text-accent-gold">{formatPrice(rate.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Catatan Pesanan (Opsional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Contoh: Tolong kirim sebelum tanggal 25"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-secondary p-6 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-accent-gold" />
                <h2 className="font-subheading text-xl uppercase tracking-wider">
                  Metode Pembayaran
                </h2>
              </div>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  {/* Midtrans Option */}
                  <div className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:border-accent-gold transition-colors cursor-pointer">
                    <RadioGroupItem value="midtrans" id="midtrans" className="mt-1" />
                    <Label htmlFor="midtrans" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4 text-accent-gold" />
                        <span className="font-medium">Pembayaran Online (Midtrans)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Kartu Kredit, E-wallet (GoPay, OVO, DANA), Bank Transfer Virtual Account, dan lainnya
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-[10px] px-2 py-0.5 bg-accent-gold/20 text-accent-gold rounded">VISA</span>
                        <span className="text-[10px] px-2 py-0.5 bg-accent-gold/20 text-accent-gold rounded">Mastercard</span>
                        <span className="text-[10px] px-2 py-0.5 bg-accent-gold/20 text-accent-gold rounded">GoPay</span>
                        <span className="text-[10px] px-2 py-0.5 bg-accent-gold/20 text-accent-gold rounded">OVO</span>
                        <span className="text-[10px] px-2 py-0.5 bg-accent-gold/20 text-accent-gold rounded">DANA</span>
                        <span className="text-[10px] px-2 py-0.5 bg-accent-gold/20 text-accent-gold rounded">ShopeePay</span>
                      </div>
                    </Label>
                  </div>

                  {/* Bank Transfer Manual */}
                  <div className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:border-accent-gold transition-colors cursor-pointer">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" className="mt-1" />
                    <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-accent-gold" />
                        <span className="font-medium">Transfer Bank Manual</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Lanjutkan ke WhatsApp untuk mendapatkan nomor rekening dan konfirmasi pembayaran
                      </p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-secondary p-6 rounded-lg border border-border sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-5 h-5 text-accent-gold" />
                <h2 className="font-subheading text-xl uppercase tracking-wider">
                  Ringkasan Pesanan
                </h2>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={ item.variantImages?.length > 0 
                          ? item.variantImages[0] 
                          : item.product.images?.[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium line-clamp-2 mb-1">
                        {item.product.name}
                      </h3>
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

              {/* Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ongkir</span>
                  <span className="font-mono">{shippingCost > 0 ? formatPrice(shippingCost) :'Silahkan klik Cek Ongkir di atas'}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-subheading uppercase tracking-wider">Total</span>
                <span className="font-mono text-2xl font-bold text-accent-gold">
                  {formatPrice(grandTotal)}
                </span>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full bg-accent-gold hover:bg-accent-gold-light text-accent-gold font-subheading uppercase h-12"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'midtrans' ? 'Bayar Sekarang' : 'Lanjutkan ke WhatsApp'}
                  </>
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
