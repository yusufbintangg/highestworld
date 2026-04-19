import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildPaymentConfirmedEmail } from "../_shared/email-templates.ts";

const sendEmail = async (resendKey: string, to: string, subject: string, html: string) => {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Highest World <no-reply@highestworld.id>", // ganti domain
      to: [to],
      subject,
      html,
    }),
  });
};

serve(async (req) => {
  try {
    const body = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const fonnteToken = Deno.env.get("FONNTE_TOKEN");
    const adminWa = Deno.env.get("ADMIN_WA_NUMBER");
    const resendKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { order_id, transaction_status, payment_type } = body;

    const { data: payment } = await supabase
      .from("payments")
      .select("*, orders(*)")
      .eq("midtrans_order_id", order_id)
      .single();

    if (!payment) return new Response("Order not found", { status: 404 });

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

    await supabase.from("payments").update({
      status: newPaymentStatus,
      midtrans_payment_type: payment_type,
      midtrans_transaction_id: body.transaction_id,
      raw_payload: body,
      updated_at: new Date().toISOString(),
    }).eq("id", payment.id);

    await supabase.from("orders").update({
      status: newOrderStatus,
      updated_at: new Date().toISOString(),
    }).eq("id", payment.order_id);

    await supabase.from("order_status_history").insert({
      order_id: payment.order_id,
      status: newOrderStatus,
      note: `Midtrans: ${transaction_status} via ${payment_type}`,
      changed_by: "system",
    });

    if (newOrderStatus === "payment_confirmed") {

      // 1. Kurangi stok
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

      // 2. Add points
      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .eq("id", payment.order_id)
        .single();

      let pointsEarned = 0;

      if (order?.user_id && order.points_earned === 0) {
        const points = Math.floor(order.total / 100000) * 10;

        if (points > 0) {
          pointsEarned = points;
          const expiredAt = new Date();
          expiredAt.setFullYear(expiredAt.getFullYear() + 1);

          await supabase.from("points_ledger").insert({
            user_id: order.user_id,
            type: "earn",
            amount: points,
            source: "purchase",
            order_id: payment.order_id,
            description: `Poin dari order ${payment.orders.order_number}`,
            expired_at: expiredAt.toISOString(),
          });

          const { data: profile } = await supabase
            .from("user_profiles")
            .select("points_balance, total_points")
            .eq("id", order.user_id)
            .single();

          await supabase.from("user_profiles").update({
            points_balance: (profile?.points_balance || 0) + points,
            total_points: (profile?.total_points || 0) + points,
          }).eq("id", order.user_id);

          await supabase.from("orders").update({
            points_earned: points,
          }).eq("id", payment.order_id);
        }
      }

      // 3. WA notif ke admin
      if (fonnteToken && adminWa) {
        const o = payment.orders;
        const msg = `🛍️ ORDER BARU MASUK!\n\nNo: ${o.order_number}\nCustomer: ${o.customer_name}\nHP: ${o.customer_phone}\nTotal: Rp ${o.total?.toLocaleString("id-ID")}\nKurir: ${o.courier?.toUpperCase()} ${o.courier_service}\n\nSegera proses pesanan! 🚀`;

        await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: {
            "Authorization": fonnteToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ target: adminWa, message: msg }),
        });
      }

      // 4. Email konfirmasi pembayaran
      if (resendKey && order?.customer_email) {
        try {
          const html = buildPaymentConfirmedEmail(order, orderItems || [], pointsEarned);
          await sendEmail(
            resendKey,
            order.customer_email,
            `✅ Pembayaran #${order.order_number} Berhasil — Highest World`,
            html
          );
        } catch (emailError) {
          console.error("Email error:", emailError);
        }
      }
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});