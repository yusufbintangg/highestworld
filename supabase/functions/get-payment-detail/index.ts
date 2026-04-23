// supabase/functions/get-payment-detail/index.ts
// Deploy: supabase functions deploy get-payment-detail

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order_number } = await req.json();
    if (!order_number) throw new Error("order_number diperlukan");

    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY tidak ditemukan di env");

    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // 1. Ambil order dulu buat dapet id
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, payment_expired_at")
      .eq("order_number", order_number)
      .single();

    if (orderError || !order) {
      throw new Error("Order tidak ditemukan: " + orderError?.message);
    }

    // 2. Ambil midtrans_order_id dari tabel payments
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("midtrans_order_id, status")
      .eq("order_id", order.id)
      .single();

    if (paymentError || !payment) {
      throw new Error("Data payment tidak ditemukan: " + paymentError?.message);
    }

    const midtransOrderId = payment.midtrans_order_id;
    console.log("Fetching Midtrans status for:", midtransOrderId);

    // 3. Hit Midtrans Get Status API
    // Production: https://api.midtrans.com/v2/{order_id}/status
    // Sandbox:    https://api.sandbox.midtrans.com/v2/{order_id}/status
    const isSandbox = serverKey.startsWith("SB-");
    const baseUrl = isSandbox
      ? "https://api.sandbox.midtrans.com"
      : "https://api.midtrans.com";

    const statusRes = await fetch(`${baseUrl}/v2/${midtransOrderId}/status`, {
      headers: {
        "Authorization": `Basic ${btoa(serverKey + ":")}`,
        "Content-Type": "application/json",
      },
    });

    const txData = await statusRes.json();
    // LOG FULL RESPONSE - hapus setelah debug selesai
    console.log("=== FULL MIDTRANS RESPONSE ===");
    console.log(JSON.stringify(txData, null, 2));
    console.log("==============================");

    // 404 dari Midtrans = transaksi belum di-charge sama sekali
    if (txData.status_code === "404") {
      throw new Error("Transaksi belum diproses Midtrans. Coba beberapa saat lagi.");
    }

    if (!txData.payment_type) {
      throw new Error("Response Midtrans tidak valid: " + JSON.stringify(txData));
    }

    const paymentType: string = txData.payment_type;

    // 4. Build detail object sesuai payment type
    const detail: Record<string, unknown> = {
      payment_type: paymentType,
      transaction_status: txData.transaction_status,
      gross_amount: txData.gross_amount,
      order_id: txData.order_id,
      expiry_time: txData.expiry_time ?? null,
    };

    if (paymentType === "qris") {
  // Snap QRIS — QR ada di endpoint terpisah, pakai snap_token
  const { data: orderData } = await supabase
    .from("orders")
    .select("snap_token")
    .eq("order_number", order_number)
    .single();

  const snapToken = orderData?.snap_token;
  let qr_url = null;

  if (snapToken) {
  const qrRes = await fetch(
    `${baseUrl}/snap/v1/transactions/${snapToken}/qr-code`,
    {
      headers: {
        "Authorization": `Basic ${btoa(serverKey + ":")}`,
      },
    }
  );

  console.log("QR fetch status:", qrRes.status);

  if (qrRes.ok) {
    const buffer = await qrRes.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    qr_url = `data:image/png;base64,${base64}`;
  } else {
    const errText = await qrRes.text();
    console.log("QR error response:", errText);
  }
}
  detail.qr_url = qr_url;  // ← closing if (snapToken)
  
    } else if (paymentType === "bank_transfer") {
      // Virtual Account — bisa BCA, BNI, BRI, Permata, dll
      if (txData.permata_va_number) {
        detail.bank = "PERMATA";
        detail.va_number = txData.permata_va_number;
      } else if (txData.va_numbers?.length > 0) {
        detail.bank = txData.va_numbers[0].bank?.toUpperCase();
        detail.va_number = txData.va_numbers[0].va_number;
      } else {
        detail.bank = null;
        detail.va_number = null;
      }

    } else if (paymentType === "cstore") {
      // Alfamart / Indomaret
      detail.store = txData.store ?? null;
      detail.payment_code = txData.payment_code ?? null;

    } else if (paymentType === "echannel") {
      // Mandiri Bill
      detail.biller_code = txData.biller_code ?? null;
      detail.bill_key = txData.bill_key ?? null;

    } else if (["gopay", "shopeepay", "ovo"].includes(paymentType)) {
      // E-wallet
      const actions = txData.actions as any[] ?? [];
      detail.qr_url = actions.find((a) => a.name === "generate-qr-code")?.url ?? null;
      detail.deeplink_url = actions.find((a) => a.name === "deeplink-redirect")?.url ?? null;

    } else if (paymentType === "credit_card") {
      detail.masked_card = txData.masked_card ?? null;
      detail.card_type = txData.card_type ?? null;
    }

    return new Response(JSON.stringify({ success: true, detail }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("get-payment-detail error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});