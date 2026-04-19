import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useCheckout } from '../hooks/useCheckout';
import { CheckoutForm } from '../components/checkout/CheckoutForm';
import { OrderSummary } from '../components/checkout/OrderSummary';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const checkout = useCheckout();

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
            areaRef={checkout.areaRef}
            onInputChange={checkout.handleInputChange}
            onAreaInput={checkout.handleAreaInput}
            onSelectArea={checkout.handleSelectArea}
            onSelectRate={checkout.setSelectedRate}
            onPaymentMethodChange={checkout.setPaymentMethod}
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
