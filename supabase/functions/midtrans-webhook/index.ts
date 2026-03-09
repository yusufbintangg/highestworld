import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const body = await req.json();
    
    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const fonnteToken = Deno.env.get("FONNTE_TOKEN");
    const adminWa = Deno.env.get("ADMIN_WA_NUMBER");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verifikasi signature Midtrans
    const { order_id, status_code, gross_amount, signature_key, transaction_status, payment_type } = body;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(order_id + status_code + gross_amount + serverKey);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    if (expectedSignature !== signature_key) {
      return new Response("Invalid signature", { status: 401 });
    }

    // Cari order di DB
    const { data: payment } = await supabase
      .from("payments")
      .select("*, orders(*)")
      .eq("midtrans_order_id", order_id)
      .single();

    if (!payment) return new Response("Order not found", { status: 404 });

    // Update status payment
    let newOrderStatus = payment.orders.status;
    let newPaymentStatus = "pending";

    if (transaction_status === "settlement" || transaction_status === "capture") {
      newPaymentStatus = "settlement";
      newOrderStatus = "payment_confirmed";
    } else if (transaction_status === "expire") {
      newPaymentStatus = "expire";
      newOrderStatus = "expired";
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      newPaymentStatus = "cancel";
      newOrderStatus = "payment_failed";
    }

    // Update payments table
    await supabase.from("payments").update({
      status: newPaymentStatus,
      midtrans_payment_type: payment_type,
      midtrans_transaction_id: body.transaction_id,
      raw_payload: body,
      updated_at: new Date().toISOString(),
    }).eq("id", payment.id);

    // Update orders table
    await supabase.from("orders").update({
      status: newOrderStatus,
      updated_at: new Date().toISOString(),
    }).eq("id", payment.order_id);

    // Insert status history
    await supabase.from("order_status_history").insert({
      order_id: payment.order_id,
      status: newOrderStatus,
      note: `Midtrans: ${transaction_status} via ${payment_type}`,
      changed_by: "system",
    });

    // Kurangi stok kalau payment confirmed
    if (newOrderStatus === "payment_confirmed") {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", payment.order_id);

      for (const item of orderItems || []) {
        await supabase.rpc("decrement_stock", {
          variant_id: item.variant_id,
          qty: item.qty,
        });
      }

      // Kirim WA notif ke admin via Fonnte
      if (fonnteToken && adminWa) {
        const order = payment.orders;
        const msg = `🛍️ ORDER BARU MASUK!\n\nNo: ${order.order_number}\nCustomer: ${order.customer_name}\nHP: ${order.customer_phone}\nTotal: Rp ${order.total?.toLocaleString("id-ID")}\nKurir: ${order.courier?.toUpperCase()} ${order.courier_service}\n\nSegera proses pesanan! 🚀`;
        
        await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: {
            "Authorization": fonnteToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            target: adminWa,
            message: msg,
          }),
        });
      }
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

});