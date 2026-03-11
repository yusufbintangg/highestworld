import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { origin_postal_code, destination_postal_code, weight, item_value } = await req.json();

    const apiKey = Deno.env.get("BITESHIP_API_KEY");

    const response = await fetch("https://api.biteship.com/v1/rates/couriers", {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origin_postal_code: parseInt(origin_postal_code),
        destination_postal_code: parseInt(destination_postal_code),
        couriers: "jne,jnt,sicepat,ide",        items: [
          {
            name: "Produk Highest World",
            description: "Pakaian",
            value: item_value || 100000,
            length: 30,
            width: 20,
            height: 5,
            weight: weight || 500,
          }
        ]
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
