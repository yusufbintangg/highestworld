// supabase/functions/charge-payment/index.ts
// Deploy: supabase functions deploy charge-payment --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { order_number, payment_type, bank, phone_number } = await req.json();
    // payment_type: "qris" | "bank_transfer" | "gopay"
    // bank: "bni" | "bri" | "mandiri" | "permata" (kalau bank_transfer)
    // phone_number: nomor HP (kalau gopay)

    if (!order_number || !payment_type) throw new Error("order_number dan payment_type diperlukan");

    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Ambil data order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total, customer_name, customer_phone, customer_email")
      .eq("order_number", order_number)
      .single();

    if (orderError || !order) throw new Error("Order tidak ditemukan");

    // 2. Cek payment di tabel payments — kalau udah charged, return data yang ada
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("order_id", order.id)
      .eq("status", "pending")
      .single();

    if (existingPayment?.payment_detail) {
      return new Response(JSON.stringify({ success: true, detail: existingPayment.payment_detail }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isSandbox = serverKey.startsWith("SB-");
    const baseUrl = isSandbox ? "https://api.sandbox.midtrans.com" : "https://api.midtrans.com";
    const auth = `Basic ${btoa(serverKey + ":")}`;

    // 3. Build payload Core API
    const midtransOrderId = `HW-${Date.now()}`;
    const basePayload = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: order.total,
      },
      customer_details: {
        first_name: order.customer_name,
        phone: order.customer_phone,
        email: order.customer_email || "customer@highestworld.id",
      },
    };

    let payload: Record<string, unknown> = { ...basePayload };

    if (payment_type === "qris") {
      payload.payment_type = "qris";
      payload.qris = {};
    } else if (payment_type === "bank_transfer") {
      if (!bank) throw new Error("bank diperlukan untuk bank_transfer");
      payload.payment_type = "bank_transfer";
      payload.bank_transfer = { bank };

    } else if (payment_type === "gopay") {
      payload.payment_type = "gopay";
      payload.gopay = { enable_callback: false };

    } else {
      throw new Error("payment_type tidak didukung: " + payment_type);
    }

    console.log("Sending to Midtrans:", JSON.stringify(payload));
    // 4. Hit Core API /charge
    const chargeRes = await fetch(`${baseUrl}/v2/charge`, {
      method: "POST",
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const chargeData = await chargeRes.json();
    console.log("Charge response:", JSON.stringify(chargeData));

    if (!["200", "201"].includes(chargeData.status_code)) {
      throw new Error(`Midtrans error: ${chargeData.status_message}`);
    }

    // 5. Extract detail sesuai payment type
    const detail: Record<string, unknown> = {
      payment_type: chargeData.payment_type,
      transaction_status: chargeData.transaction_status,
      gross_amount: chargeData.gross_amount,
      order_id: chargeData.order_id,
      expiry_time: chargeData.expiry_time ?? null,
    };

    if (payment_type === "qris") {
      // qr_string adalah URL image QR dari Midtrans
      detail.qr_url = chargeData.actions?.find((a: any) => a.name === "generate-qr-code")?.url
        ?? chargeData.qr_string
        ?? null;

    } else if (payment_type === "bank_transfer") {
      if (chargeData.permata_va_number) {
        detail.bank = "PERMATA";
        detail.va_number = chargeData.permata_va_number;
      } else if (chargeData.va_numbers?.length > 0) {
        detail.bank = chargeData.va_numbers[0].bank?.toUpperCase();
        detail.va_number = chargeData.va_numbers[0].va_number;
      }

    } else if (payment_type === "gopay") {
      const actions = chargeData.actions ?? [];
      detail.qr_url = actions.find((a: any) => a.name === "generate-qr-code")?.url ?? null;
      detail.deeplink_url = actions.find((a: any) => a.name === "deeplink-redirect")?.url ?? null;
    }

    // 6. Simpen payment_detail ke tabel payments
    await supabase
      .from("payments")
      .update({
        midtrans_order_id: midtransOrderId,
        midtrans_payment_type: payment_type,
        payment_detail: detail,
        raw_payload: chargeData,
      })
      .eq("order_id", order.id);

    // 7. Update payment_method di orders
    await supabase
      .from("orders")
      .update({ payment_method: payment_type })
      .eq("id", order.id);

    return new Response(JSON.stringify({ success: true, detail }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("charge-payment error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});