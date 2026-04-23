import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';
import { WHATSAPP_NUMBER } from '../../lib/config';
import { openMidtransPayment, generateOrderId } from '../../lib/midtrans';
import { PAYMENT_METHODS } from '../components/checkout/PaymentMethodModal';
import { toast } from 'sonner';

export const useCheckout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qris');
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
  const [savedAddress, setSavedAddress] = useState(null);
  const areaRef = useRef(null);
  const searchTimeout = useRef(null);

  const cartTotal = getCartTotal();
  const shippingCost = selectedRate?.price || 0;
  const grandTotal = cartTotal + shippingCost;

  // Auto-fill dari user login
  useEffect(() => {
    if (!user) return;
    setFormData(prev => ({
      ...prev,
      firstName: prev.firstName || user.name?.split(' ')[0] || '',
      lastName: prev.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
    }));
  }, [user?.id, user?.name, user?.phone, user?.email]);

// Redirect kalau cart kosong - EXCLUDE checkout direct access
  useEffect(() => {
    if (cartItems.length === 0 && !document.referrer.includes('/products') && !document.referrer.includes('/product')) {
      toast.error('Keranjang Anda kosong');
      navigate('/products');
    }
  }, [cartItems, navigate]);

  // Close dropdown kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (areaRef.current && !areaRef.current.contains(e.target)) {
        setShowAreaDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-load saved address dari user
  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single()
      .then(({ data }) => {
        if (data) {
          setSavedAddress(data);
          setFormData(prev => ({
            ...prev,
            firstName: data.recipient_name?.split(' ')[0] || '',
            lastName: data.recipient_name?.split(' ').slice(1).join(' ') || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            province: data.province || '',
            postalCode: data.postal_code || '',
          }));
          const cityParts = data.city?.split(', ') || [];
          setSelectedArea({
            id: data.area_id,
            postal_code: data.postal_code,
            administrative_division_level_1_name: data.province,
            administrative_division_level_2_name: cityParts[1] || data.city,
            administrative_division_level_3_name: cityParts[0] || '',
          });
          setAreaSearch(data.city || '');
          setShowAreaDropdown(false);
          if (data.postal_code) {
            fetchShippingRates(data.postal_code);
          }
        }
      });
  }, [user?.id]);

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
    } catch {}
    finally { setLoadingArea(false); }
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
      const totalWeight = cartItems.reduce((sum, item) => sum + ((item.product?.weight || 100) * item.quantity), 0);
      const response = await fetch(`${supabaseUrl}/functions/v1/biteship-rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
        body: JSON.stringify({
          origin_postal_code: '50265',
          destination_postal_code: String(kodePos),
          weight: totalWeight,
          item_value: cartTotal,
          items: cartItems,
        }),
      });
      const data = await response.json();
      if (data.pricing) {
        setShippingRates(data.pricing);
      } else {
        toast.error('Ongkir tidak tersedia untuk area ini');
      }
    } catch {
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
    if (!selectedArea && !savedAddress) newErrors.area = 'Pilih kota/kecamatan dari dropdown';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfileIfNeeded = async () => {
    if (!user) return;
    await supabase.from('user_profiles').update({
      full_name: `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone,
    }).eq('id', user.id);

    const { data: existing } = await supabase
      .from('user_addresses')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single();

    const addressPayload = {
      recipient_name: `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone,
      address: formData.address,
      city: selectedArea
        ? `${selectedArea.administrative_division_level_3_name}, ${selectedArea.administrative_division_level_2_name}`
        : formData.city,
      province: selectedArea ? selectedArea.administrative_division_level_1_name : formData.province,
      postal_code: formData.postalCode,
    };

    if (existing) {
      await supabase.from('user_addresses').update(addressPayload).eq('id', existing.id);
    } else {
      await supabase.from('user_addresses').insert({ ...addressPayload, user_id: user.id, label: 'Rumah', is_default: true });
    }
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
        user_id: user?.id || null,
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
          cost: selectedRate.price,
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
          weight: item.product.weight || 100,
        })),
      };

      const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod);
      await openMidtransPayment(orderPayload, {
        onSuccess: async (result) => {
          try { await saveProfileIfNeeded(); } catch {}
          clearCart();
          window.location.href = '/orders/' + result.order_number;
        },
        onPending: async (result) => {
          await saveProfileIfNeeded();
          clearCart();
          window.location.href = '/orders/' + result.order_number;
        },
        onError: () => {
          toast.error('Pembayaran gagal. Silakan coba lagi.');
          setIsProcessing(false);
        },
        onClose: (result) => {
          setIsProcessing(false);
          if (result?.order_number) {
            window.location.href = '/orders/' + result.order_number;
          }
        },
      }, selectedMethod?.enabledPayments || []);
    } catch {
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
      setIsProcessing(false);
    }
  };

  const handleBankTransferPayment = () => {
    setIsProcessing(true);
    const orderId = generateOrderId();
    const actualShippingCost = selectedRate?.price || 0;
    const actualGrandTotal = cartTotal + actualShippingCost;

    let message = `📦 orders BARU - ${orderId}\n\n`;
    message += `👤 DATA PEMBELI:\nNama: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nTelepon: ${formData.phone}\n\n`;
    message += `📍 ALAMAT:\n${formData.address}\n${formData.city}, ${formData.province} ${formData.postalCode}\n\n`;
    if (formData.notes) message += `📝 Catatan: ${formData.notes}\n\n`;
    message += `🛍️ orders/:\n`;
    cartItems.forEach((item, i) => {
      message += `${i + 1}. ${item.product.name} (${item.sku || 'N/A'}.${item.size}) • ${item.quantity}x • ${formatPrice(item.product.price)}\n`;
    });
    message += `\n💰 Subtotal: ${formatPrice(cartTotal)}\nOngkir: ${formatPrice(actualShippingCost)}\nTotal: ${formatPrice(actualGrandTotal)}\n\nMohon kirimkan detail rekening. Terima kasih!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    setTimeout(() => { clearCart(); navigate('/konfirmasi-pembayaran'); }, 1000);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) {
      toast.error('Mohon lengkapi semua data yang wajib diisi');
      return;
    }
    if (paymentMethod === 'bank_transfer') {
      handleBankTransferPayment();
    } else {
      await handleMidtransPayment();
    }
  };

  return {
    // state
    formData, errors, isProcessing, paymentMethod,
    areaSearch, areaResults, loadingArea, showAreaDropdown, selectedArea,
    shippingRates, loadingRates, selectedRate, savedAddress,
    cartItems, cartTotal, shippingCost, grandTotal,
    areaRef, user,
    // handlers
    handleInputChange,
    handleAreaInput,
    handleSelectArea,
    setSelectedRate,
    setPaymentMethod,
    handleSubmit,
  };
};
