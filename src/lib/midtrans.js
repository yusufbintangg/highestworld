// Midtrans Payment Gateway Integration
// Docs: https://docs.midtrans.com/

// IMPORTANT: Replace these with your actual Midtrans credentials
// Get your keys from https://dashboard.midtrans.com/
export const MIDTRANS_CONFIG = {
  clientKey: 'Mid-client-vJ85dMN8LuBSAmEt', // Replace with your Client Key
  serverKey: 'Mid-server-Bpy5vHW4-qwb__05qrbSaYFA', // Replace with your Server Key (keep this secret!)
  isProduction: false, // Set to true for production
  apiUrl: 'https://app.sandbox.midtrans.com/snap/v1/transactions', // Sandbox URL
};

// Load Midtrans Snap script
export function loadMidtransScript() {
  return new Promise((resolve, reject) => {
    if (window.snap) {
      resolve(window.snap);
      return;
    }

    const script = document.createElement('script');
    script.src = MIDTRANS_CONFIG.isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', MIDTRANS_CONFIG.clientKey);
    
    script.onload = () => {
      if (window.snap) {
        resolve(window.snap);
      } else {
        reject(new Error('Midtrans Snap failed to load'));
      }
    };
    
    script.onerror = () => reject(new Error('Failed to load Midtrans script'));
    
    document.head.appendChild(script);
  });
}

// Create transaction token via Supabase Edge Function
export async function createTransaction(orderData) {
  try {
    // Call Supabase edge function to create order + get Midtrans token
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/midtrans-create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify(orderData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create transaction');
    }

    const data = await response.json();
    console.log('Edge function response:', data);
    
    if (!data.snap_token) {
      throw new Error('No snap token received from server');
    }

    return {
      token: data.snap_token,
      orderId: data.order_id,
      orderNumber: data.order_number,
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Mock function to simulate transaction creation (for demo purposes)
export function mockCreateTransaction(orderData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a mock transaction token
      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      resolve(mockToken);
    }, 1000);
  });
}

// Generate order ID (not needed anymore, handled by backend)
export function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `HW-${timestamp}-${random}`;
}

// Format order data for Midtrans
export function formatMidtransOrderData(checkoutData, cartItems, cartTotal, shippingCost) {
  const orderId = generateOrderId();
  const grossAmount = cartTotal + shippingCost;

  // Format item details for Midtrans
  const itemDetails = cartItems.map(item => ({
    id: item.product.id,
    price: item.product.price,
    quantity: item.quantity,
    name: `${item.product.name} - ${item.color} - ${item.size}`,
  }));

  // Add shipping cost as an item
  if (shippingCost > 0) {
    itemDetails.push({
      id: 'shipping',
      price: shippingCost,
      quantity: 1,
      name: 'Biaya Pengiriman',
    });
  }

  return {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    item_details: itemDetails,
    customer_details: {
      first_name: checkoutData.firstName,
      last_name: checkoutData.lastName || '',
      email: checkoutData.email,
      phone: checkoutData.phone,
      billing_address: {
        first_name: checkoutData.firstName,
        last_name: checkoutData.lastName || '',
        email: checkoutData.email,
        phone: checkoutData.phone,
        address: checkoutData.address,
        city: checkoutData.city,
        postal_code: checkoutData.postalCode,
        country_code: 'IDN',
      },
      shipping_address: {
        first_name: checkoutData.firstName,
        last_name: checkoutData.lastName || '',
        email: checkoutData.email,
        phone: checkoutData.phone,
        address: checkoutData.address,
        city: checkoutData.city,
        postal_code: checkoutData.postalCode,
        country_code: 'IDN',
      },
    },
    callbacks: {
      finish: window.location.origin + '/checkout/success',
      error: window.location.origin + '/checkout/error',
      pending: window.location.origin + '/checkout/pending',
    },
  };
}

// Open Midtrans Snap payment popup
export async function openMidtransPayment(orderData, callbacks = {}) {
  try {
    const snap = await loadMidtransScript();
    
    // Call edge function to create order + get real token
    const transactionData = await createTransaction(orderData);
    const { token, orderId, orderNumber } = transactionData;

    console.log('Opening Midtrans Snap with token:', token);

    snap.pay(token, {
      onSuccess: (result) => {
        console.log('Payment success:', result);
        if (callbacks.onSuccess) {
          callbacks.onSuccess({
            ...result,
            order_id: orderId,
            order_number: orderNumber,
          });
        }
      },
      onPending: (result) => {
        console.log('Payment pending:', result);
        if (callbacks.onPending) {
          callbacks.onPending({
            ...result,
            order_id: orderId,
            order_number: orderNumber,
          });
        }
      },
      onError: (result) => {
        console.log('Payment error:', result);
        if (callbacks.onError) callbacks.onError(result);
      },
      onClose: () => {
        console.log('Payment popup closed');
        if (callbacks.onClose) callbacks.onClose();
      },
    });
  } catch (error) {
    console.error('Error opening Midtrans payment:', error);
    if (callbacks.onError) {
      callbacks.onError({ message: error.message });
    }
    throw error;
  }
}
