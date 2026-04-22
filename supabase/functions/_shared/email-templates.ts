const formatPrice = (num: number) => "Rp " + num?.toLocaleString("id-ID");

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#F5F4F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <tr>
            <td style="background:#111111;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.3em;color:#888888;text-transform:uppercase;">Big Size. Real Style.</p>
              <p style="margin:0;font-size:20px;letter-spacing:0.2em;color:#FFFFFF;font-weight:500;">HIGHEST WORLD</p>
            </td>
          </tr>

          <tr>
            <td style="background:#FFFFFF;padding:40px;">
              ${content}
            </td>
          </tr>

          <tr>
            <td style="background:#FFFFFF;padding:0 40px;">
              <hr style="border:none;border-top:1px solid #EEEEEE;margin:0;"/>
            </td>
          </tr>

          <tr>
            <td style="background:#FFFFFF;padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:11px;color:#999999;letter-spacing:0.1em;">© 2026 HIGHEST WORLD</td>
                  <td align="right" style="font-size:11px;color:#999999;">highestworld.id</td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const itemsTable = (items: any[]) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr style="background:#F5F4F0;">
      <td style="padding:10px 12px;font-size:10px;letter-spacing:0.15em;color:#888888;text-transform:uppercase;">Produk</td>
      <td style="padding:10px 12px;font-size:10px;letter-spacing:0.15em;color:#888888;text-transform:uppercase;text-align:center;">Qty</td>
      <td style="padding:10px 12px;font-size:10px;letter-spacing:0.15em;color:#888888;text-transform:uppercase;text-align:right;">Harga</td>
    </tr>
    ${items.map(item => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #F0F0F0;">
        <p style="margin:0;font-size:14px;color:#111111;font-weight:500;">${item.product_name}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#999999;">SKU: ${item.sku_variant || "-"} • Size: ${item.size || "-"}</p>
      </td>
      <td style="padding:12px;border-bottom:1px solid #F0F0F0;text-align:center;font-size:14px;color:#555555;">${item.qty}x</td>
      <td style="padding:12px;border-bottom:1px solid #F0F0F0;text-align:right;font-size:14px;color:#111111;">${formatPrice(item.price)}</td>
    </tr>
    `).join("")}
  </table>
`;

const totalsBlock = (subtotal: number, shippingCost: number, total: number, courier: string, courierService: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="padding:6px 0;font-size:13px;color:#888888;">Subtotal</td>
      <td style="padding:6px 0;font-size:13px;color:#555555;text-align:right;">${formatPrice(subtotal)}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;font-size:13px;color:#888888;">Ongkir (${courier?.toUpperCase()} ${courierService})</td>
      <td style="padding:6px 0;font-size:13px;color:#555555;text-align:right;">${formatPrice(shippingCost)}</td>
    </tr>
    <tr>
      <td style="padding:12px 0 0;font-size:14px;color:#111111;font-weight:500;border-top:1px solid #EEEEEE;">Total</td>
      <td style="padding:12px 0 0;font-size:18px;color:#111111;font-weight:500;text-align:right;border-top:1px solid #EEEEEE;">${formatPrice(total)}</td>
    </tr>
  </table>
`;

const addressBlock = (order: any) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="background:#F5F4F0;padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.15em;color:#888888;text-transform:uppercase;">Alamat Pengiriman</p>
        <p style="margin:0;font-size:14px;color:#111111;line-height:1.7;">
          ${order.customer_name}<br/>
          ${order.shipping_address}<br/>
          ${order.shipping_city}, ${order.shipping_province} ${order.shipping_postal_code}<br/>
          ${order.customer_phone}
        </p>
      </td>
    </tr>
  </table>
`;

const orderNumberBlock = (orderNumber: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="background:#F5F4F0;padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:11px;color:#888888;letter-spacing:0.1em;text-transform:uppercase;">Nomor Order</td>
            <td style="text-align:right;font-size:14px;color:#111111;font-weight:500;">${orderNumber}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

export const buildWaitingPaymentEmail = (order: any, items: any[], frontendUrl: string): string => {
  const content = `
    <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.2em;color:#888888;text-transform:uppercase;">Pesanan Diterima</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;color:#111111;line-height:1.3;">Selesaikan pembayaranmu.</h1>
    <p style="margin:0 0 32px;font-size:15px;color:#555555;line-height:1.7;">
      Hei ${order.customer_name}, pesanan kamu sudah kami terima. Selesaikan pembayaran untuk memproses pesananmu.
    </p>

    ${orderNumberBlock(order.order_number)}
    ${itemsTable(items)}
    ${totalsBlock(order.subtotal, order.shipping_cost, order.total, order.courier, order.courier_service)}
    ${addressBlock(order)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <a href="${frontendUrl}/orders/${order.order_number}"
            style="display:inline-block;background:#C9A84C;color:#111111;text-decoration:none;padding:16px 40px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;font-weight:500;">
            Lihat & Bayar Pesanan
          </a>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#F5F4F0;padding:16px 20px;">
          <p style="margin:0;font-size:12px;color:#666666;line-height:1.7;">
            Pembayaran berlaku selama <strong style="color:#111111;">24 jam</strong>. Jika lewat batas waktu, pesanan akan otomatis dibatalkan.
          </p>
        </td>
      </tr>
    </table>
  `;
  return emailWrapper(content);
};

export const buildPaymentConfirmedEmail = (order: any, items: any[], pointsEarned: number): string => {
  const content = `
    <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.2em;color:#888888;text-transform:uppercase;">Pembayaran Berhasil</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;color:#111111;line-height:1.3;">Pesanan sedang diproses.</h1>
    <p style="margin:0 0 32px;font-size:15px;color:#555555;line-height:1.7;">
      Hei ${order.customer_name}, pembayaran kamu sudah kami terima. Pesananmu sedang kami siapkan.
    </p>

    ${orderNumberBlock(order.order_number)}
    ${itemsTable(items)}
    ${totalsBlock(order.subtotal, order.shipping_cost, order.total, order.courier, order.courier_service)}
    ${addressBlock(order)}

    ${pointsEarned > 0 ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#F5F4F0;padding:16px 20px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:0.15em;color:#888888;text-transform:uppercase;">Poin Loyalty Didapat</p>
          <p style="margin:8px 0 0;font-size:28px;color:#C9A84C;font-weight:500;">${pointsEarned} Poin</p>
          <p style="margin:4px 0 0;font-size:12px;color:#999999;">dari pembelian ini</p>
        </td>
      </tr>
    </table>
    ` : ""}

    <p style="margin:0;font-size:12px;color:#999999;line-height:1.7;text-align:center;">
      Notifikasi resi pengiriman akan dikirim setelah barang dikirim.
    </p>
  `;
  return emailWrapper(content);
};