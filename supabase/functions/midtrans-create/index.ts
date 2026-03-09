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
    const { order, items, customer, shipping } = await req.json();

    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:5173";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate order number
    const orderNumber = `HW-${Date.now()}`;

    // Hitung total
    const subtotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const total = subtotal + shipping.cost;

    // Simpan order ke DB
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email || null,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_city_id: shipping.city_id,
        shipping_province: shipping.province,
        shipping_postal_code: shipping.postal_code,
        courier: shipping.courier,
        courier_service: shipping.service,
        shipping_cost: shipping.cost,
        shipping_etd: shipping.etd,
        subtotal,
        total,
        payment_method: "midtrans",
        status: "waiting_payment",
        notes: order.notes || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Simpan order items
    const orderItems = items.map(i => ({
      order_id: newOrder.id,
      product_id: i.product_id,
      variant_id: i.variant_id,
      product_name: i.name,
      size: i.size,
      color: i.color,
      qty: i.qty,
      price: i.price,
      subtotal: i.price * i.qty,
      variant_images: i.variant_images || [],
    }));

    console.log('Inserting order items:', orderItems);
    
    const { data: insertedItems, error: orderItemsError } = await supabase.from("order_items").insert(orderItems).select();
    
    if (orderItemsError) {
      console.error('Error inserting order_items:', orderItemsError);
      throw new Error('Gagal simpan order items: ' + orderItemsError.message);
    }
    
    console.log('Order items inserted successfully:', insertedItems);

    // Buat transaksi Midtrans
    const midtransOrderId = `HW-${newOrder.id}`;

    const midtransPayload = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: total,
      },
      customer_details: {
        first_name: customer.name,
        phone: customer.phone,
        email: customer.email || "customer@highestworld.id",
      },
      callbacks: {
        finish: `${frontendUrl}/pesanan/${orderNumber}`,
      },
      item_details: [
        ...items.map(i => ({
          id: i.product_id,
          price: i.price,
          quantity: i.qty,
          name: `${i.name} (${i.color}/${i.size})`.substring(0, 50),
        })),
        {
          id: "SHIPPING",
          price: shipping.cost,
          quantity: 1,
          name: `Ongkir ${shipping.courier.toUpperCase()} ${shipping.service}`,
        },
      ],
    };

    const midtransResponse = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${btoa(serverKey + ":")}`,
        },
        body: JSON.stringify(midtransPayload),
      }
    );

    const midtransData = await midtransResponse.json();

    if (!midtransData.token) throw new Error("Gagal buat transaksi Midtrans");

    // Simpan payment record
    await supabase.from("payments").insert({
      order_id: newOrder.id,
      method: "midtrans",
      midtrans_order_id: midtransOrderId,
      amount: total,
      status: "pending",
    });

    // Simpan snap_token + expired 24 jam
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("orders").update({
      snap_token: midtransData.token,
      payment_expired_at: expiredAt,
    }).eq("id", newOrder.id);

    return new Response(
      JSON.stringify({
        success: true,
        snap_token: midtransData.token,
        order_id: newOrder.id,
        order_number: orderNumber,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});