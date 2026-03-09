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
    const { order_id } = await req.json();

    const apiKey = Deno.env.get("BITESHIP_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Ambil data order + items dari DB
    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order_id)
      .single();

    if (error || !order) throw new Error("Order tidak ditemukan");

    // Format items untuk Biteship
    const items = order.order_items.map(item => ({
      name: item.product_name,
      description: `${item.color} / ${item.size}`,
      value: item.price,
      weight: 500, // gram per item, bisa disesuaikan
      quantity: item.qty,
    }));

    const payload = {
      shipper_contact_name: "Highest World",
      shipper_contact_phone: "081328769922", // Ganti nomor toko lo
      shipper_contact_email: "highestworld@gmail.com",
      shipper_organization: "Highest World",
      origin_contact_name: "Highest World",
      origin_contact_phone: "081328769922",
      origin_address: "Jl. Dawung III No.30, Pudakpayung, Banyumanik, Semarang, Jawa Tengah",
      origin_postal_code: 50265,
      destination_contact_name: order.customer_name,
      destination_contact_phone: order.customer_phone,
      destination_contact_email: order.customer_email || "",
      destination_address: `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_province}`,
      destination_postal_code: parseInt(order.shipping_postal_code),
      courier_company: order.courier,
      courier_type: order.courier_service,
      delivery_type: "now",
      order_note: order.notes || "",
      items,
    };

    const response = await fetch("https://api.biteship.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.id) throw new Error(data.error || "Gagal buat order di Biteship");

    // Simpan AWB ke DB
    await supabase.from("orders").update({
      biteship_order_id: data.id,
      awb_number: data.courier?.waybill_id || null,
      status: "processing",
      updated_at: new Date().toISOString(),
    }).eq("id", order_id);

    // Simpan ke shipping_tracking
    if (data.courier?.waybill_id) {
      await supabase.from("shipping_tracking").upsert({
        order_id: order_id,
        awb_number: data.courier.waybill_id,
        courier: order.courier,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      biteship_order_id: data.id,
      awb_number: data.courier?.waybill_id,
      tracking_url: data.courier?.tracking_id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
