export const MIDTRANS_CONFIG = {
  clientKey: import.meta.env.VITE_MIDTRANS_CLIENT_KEY,
  isProduction: true,
};

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
      if (window.snap) resolve(window.snap);
      else reject(new Error('Midtrans Snap failed to load'));
    };
    script.onerror = () => reject(new Error('Failed to load Midtrans script'));
    document.head.appendChild(script);
  });
}

export async function createTransaction(orderData) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const response = await fetch(`${supabaseUrl}/functions/v1/midtrans-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create transaction');
  }
  const data = await response.json();
  if (!data.snap_token) throw new Error('No snap token received from server');
  return {
    token: data.snap_token,
    orderId: data.order_id,
    orderNumber: data.order_number,
  };
}

export function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `HW-${timestamp}-${random}`;
}

export async function openMidtransPayment(orderData, callbacks = {}) {
  try {
    const snap = await loadMidtransScript();
    const { token, orderId, orderNumber } = await createTransaction(orderData);
    snap.pay(token, {
      onSuccess: (result) => {
        if (callbacks.onSuccess) callbacks.onSuccess({ ...result, order_id: orderId, order_number: orderNumber });
      },
      onPending: (result) => {
        if (callbacks.onPending) callbacks.onPending({ ...result, order_id: orderId, order_number: orderNumber });
      },
      onError: (result) => {
        if (callbacks.onError) callbacks.onError(result);
      },
      onClose: () => {
        if (callbacks.onClose) callbacks.onClose({ order_number: orderNumber });
      },
    });
  } catch (error) {
    if (callbacks.onError) callbacks.onError({ message: error.message });
    throw error;
  }
}