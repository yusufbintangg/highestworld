export const MIDTRANS_CONFIG = {
  clientKey: import.meta.env.VITE_MIDTRANS_CLIENT_KEY,
  isProduction: true,
};

export function loadMidtransScript() {
  return new Promise((resolve, reject) => {
    if (window.snap) { resolve(window.snap); return; }
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

/**
 * Buat order di DB via midtrans-create, lalu charge via Core API charge-payment.
 * Dipakai untuk QRIS dan Virtual Account.
 *
 * @param {object} orderData        – sama persis seperti yang dikirim ke midtrans-create
 * @param {string} paymentType      – "qris" | "bank_transfer"
 * @param {string|null} bank        – "bni" | "bri" | "mandiri" | "permata" (hanya kalau bank_transfer)
 * @returns {{ orderNumber: string, orderId: string, detail: object }}
 */
export async function createAndChargeOrder(orderData, paymentType, bank = null) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // 1. Buat order di DB + dapatkan snap_token (kita butuh order_number untuk charge)
  const createRes = await fetch(`${supabaseUrl}/functions/v1/midtrans-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error || 'Gagal membuat order');
  }

  const createData = await createRes.json();
  const { order_number: orderNumber, order_id: orderId } = createData;

  if (!orderNumber) throw new Error('order_number tidak ditemukan dari server');

  // 2. Charge via Core API
  const chargePayload = { order_number: orderNumber, payment_type: paymentType };
  if (paymentType === 'bank_transfer' && bank) {
    chargePayload.bank = bank;
  }

  const chargeRes = await fetch(`${supabaseUrl}/functions/v1/charge-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(chargePayload),
  });

  const chargeData = await chargeRes.json();

  if (!chargeData.success) {
    throw new Error(chargeData.error || 'Pembayaran gagal diproses');
  }

  return {
    orderNumber,
    orderId,
    detail: chargeData.detail,
  };
}

/**
 * Snap popup (untuk OVO, Alfamart, Akulaku, CC — metode yang tidak pakai Core API).
 *
 * @param {object}   orderData
 * @param {object}   callbacks        – { onSuccess, onPending, onError, onClose }
 * @param {string[]} enabledPayments  – filter metode di Snap
 */
export async function openMidtransPayment(orderData, callbacks = {}, enabledPayments = []) {
  try {
    const snap = await loadMidtransScript();
    const { token, orderId, orderNumber } = await createTransaction(orderData);

    const snapOptions = {
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
    };

    if (enabledPayments && enabledPayments.length > 0) {
      snapOptions.enabledPayments = enabledPayments;
    }

    snap.pay(token, snapOptions);
  } catch (error) {
    if (callbacks.onError) callbacks.onError({ message: error.message });
    throw error;
  }
}