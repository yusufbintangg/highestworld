import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, X } from 'lucide-react';
import { useCheckout } from '../hooks/useCheckout';
import { useAuth } from '../../context/AuthContext';
import { CheckoutForm } from '../components/checkout/CheckoutForm';
import { OrderSummary } from '../components/checkout/OrderSummary';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const checkout = useCheckout();
  const { isAuthenticated } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (checkout.cartItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-white pt-2 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8 mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        {!isAuthenticated && !dismissed && (
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-gray-900">Login Sekarang!!</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Dapatkan poin loyalty untuk member untuk setiap pembelian, yang bisa ditukar dengan diskon di pembelian berikutnya!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                className="text-sm font-semibold text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Login
              </button>
              <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-10">
          <CheckoutForm
            formData={checkout.formData}
            errors={checkout.errors}
            user={checkout.user}
            areaSearch={checkout.areaSearch}
            areaResults={checkout.areaResults}
            loadingArea={checkout.loadingArea}
            showAreaDropdown={checkout.showAreaDropdown}
            selectedArea={checkout.selectedArea}
            shippingRates={checkout.shippingRates}
            loadingRates={checkout.loadingRates}
            selectedRate={checkout.selectedRate}
            paymentMethod={checkout.paymentMethod}
            selectedVaBank={checkout.selectedVaBank}
            areaRef={checkout.areaRef}
            onInputChange={checkout.handleInputChange}
            onAreaInput={checkout.handleAreaInput}
            onSelectArea={checkout.handleSelectArea}
            onSelectRate={checkout.setSelectedRate}
            onPaymentMethodChange={checkout.setPaymentMethod}
            onPaymentMethodSelect={checkout.handlePaymentMethodSelect}
          />
          <OrderSummary
            cartItems={checkout.cartItems}
            cartTotal={checkout.cartTotal}
            shippingCost={checkout.shippingCost}
            grandTotal={checkout.grandTotal}
            loadingRates={checkout.loadingRates}
            selectedRate={checkout.selectedRate}
            paymentMethod={checkout.paymentMethod}
            isProcessing={checkout.isProcessing}
            onSubmit={checkout.handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};