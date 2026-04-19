import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';

export const handleWhatsApp = (order) => {
  const msg = encodeURIComponent(
    `Halo ${order.customer_name}, pesanan Anda (${order.order_number}) sedang kami proses. Terima kasih sudah berbelanja di Highest World! 🙏`
  );
  window.open(`https://wa.me/${order.customer_phone?.replace(/^0/, '62')}?text=${msg}`, '_blank');
};

export const handlePrintInvoice = (order) => {
  const items = order.order_items?.map(i =>
    `<tr style="font-size:12px">
      <td style="padding:1px;border:1px solid #ddd">${i.product_name}</td>
      <td style="padding:1px;border:1px solid #ddd;text-align:center">${i.sku_variant || i.sku || i.color} / ${i.size}</td>
      <td style="padding:1px;border:1px solid #ddd;text-align:center">${i.qty}</td>
      <td style="padding:1px;border:1px solid #ddd;text-align:right">Rp ${i.price?.toLocaleString('id-ID')}</td>
    </tr>`
  ).join('');

  const html = `<html>
  <head>
    <title>Invoice ${order.order_number}</title>
    <style>
      body { font-family: Arial; padding: 10px; color: #111; font-size: 8px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #f5f5f5; padding: 7px; border: 1px solid #ddd; text-align: left; font-size: 8px; }
      @media print {
        .footer { position: fixed; bottom: 10px; left: 10px; right: 10px; border-top: 1px solid #ddd; padding-top: 6px; display: flex; justify-content: space-between; font-size: 11px; color: #888; }
      }
      .footer { border-top: 1px solid #ddd; padding-top: 6px; display: flex; justify-content: space-between; font-size: 11px; color: #888; margin-top: 40px; }
    </style>
  </head>
  <body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
      <div>
        <h2 style="margin:0;font-size:20px">HIGHEST WORLD</h2>
        <p style="margin:2px 0;color:#888;font-size:12px">Big Size. Real Style.</p>
      </div>
      <div style="text-align:right">
        <p style="margin:0;font-size:11px;color:#666">No. Invoice</p>
        <p style="margin:2px 0;font-weight:bold;font-size:14px">${order.order_number}</p>
        <p style="margin:0;font-size:11px;color:#888">${new Date(order.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</p>
      </div>
    </div>
    <hr style="margin:8px 0"/>
    ${order.awb_number
      ? `<div style="background:#f5f5f5;border-left:4px solid #111;padding:8px 12px;margin-bottom:12px;border-radius:4px">
           <div style="font-size:11px;color:#666">Nomor Resi</div>
           <div style="font-size:20px;font-weight:bold;letter-spacing:3px;margin:2px 0">${order.awb_number}</div>
           <div style="font-size:11px;color:#666">${order.courier?.toUpperCase()} ${order.courier_service}</div>
         </div>`
      : `<div style="background:#fff3cd;border-left:4px solid #ffc107;padding:8px 12px;margin-bottom:12px;border-radius:4px">
           <span style="font-size:11px;color:#856404">⚠ Nomor resi belum tersedia</span>
         </div>`
    }
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;font-size:12px">
      <div>
        <div style="color:#666;font-size:11px">Customer</div>
        <div style="font-weight:bold;margin:2px 0">${order.customer_name}</div>
        <div>${order.customer_phone}</div>
        ${order.customer_email ? `<div style="color:#888">${order.customer_email}</div>` : ''}
      </div>
      <div>
        <div style="color:#666;font-size:11px">Alamat Pengiriman</div>
        <div style="margin:2px 0">${order.shipping_address}</div>
        <div>${order.shipping_city}, ${order.shipping_province}</div>
      </div>
    </div>
    <table style="margin-bottom:10px">
      <thead><tr><th>Produk</th><th style="text-align:center">Varian</th><th style="text-align:center">Qty</th><th style="text-align:right">Harga</th></tr></thead>
      <tbody>${items}</tbody>
    </table>
    <div style="text-align:right;font-size:12px;margin-bottom:16px">
      <p style="margin:3px 0">Subtotal: <b>Rp ${order.subtotal?.toLocaleString('id-ID')}</b></p>
      <p style="margin:3px 0">Ongkir (${order.courier?.toUpperCase()} ${order.courier_service}): <b>Rp ${order.shipping_cost?.toLocaleString('id-ID')}</b></p>
      <p style="margin:8px 0;font-size:16px;font-weight:bold">TOTAL: Rp ${order.total?.toLocaleString('id-ID')}</p>
    </div>
    <div class="footer">
      <span>Highest World | highestworld.id</span>
      <span>${order.awb_number ? `Resi: ${order.awb_number} | ` : ''}${order.order_number}</span>
    </div>
  </body></html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.print();
};

export const handlePrintAWB = async (order, trackingNumber = '') => {
  const { data: trackingData } = await supabase
    .from('shipping_tracking').select('awb_number').eq('order_id', order.id).single();
  const awbNumber = trackingData?.awb_number || trackingNumber;
  if (!awbNumber) { toast.error('Nomor resi belum ada. Masukkan nomor resi dulu!'); return; }

  const courierLogo = order.courier?.toUpperCase() || 'KURIR';
  const html = `<html>
    <head>
      <title>AWB ${order.order_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @media print { body { margin: 0; } }
        body { font-family: 'Courier New', monospace; }
        .awb-label { width: 100mm; height: 150mm; padding: 8mm; border: 1px solid #333; margin: 0 auto; }
        .header { text-align: center; font-weight: bold; font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 4mm; margin-bottom: 6mm; }
        .barcode-section { text-align: center; margin: 8mm 0; padding: 4mm; border: 1px dashed #666; }
        .barcode { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
        .section { margin: 4mm 0; padding: 3mm; border: 1px solid #ddd; }
        .section-title { font-weight: bold; font-size: 9px; margin-bottom: 2mm; text-transform: uppercase; }
        .address { font-weight: bold; font-size: 11px; line-height: 1.3; }
        .package-info { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin: 4mm 0; }
        .info-box { border: 1px solid #ddd; padding: 2mm; text-align: center; }
        .info-label { font-size: 7px; color: #666; }
        .info-value { font-weight: bold; font-size: 10px; }
        .footer { text-align: center; font-size: 7px; color: #666; margin-top: 4mm; }
      </style>
    </head>
    <body>
      <div class="awb-label">
        <div class="header">${courierLogo}</div>
        <div class="barcode-section">
          <div class="section-title">TRACKING NUMBER</div>
          <div class="barcode">${awbNumber}</div>
        </div>
        <div class="section">
          <div class="section-title">PENGIRIM</div>
          <div class="address">HIGHEST WORLD<br/>Bigsize Fashion</div>
        </div>
        <div class="section">
          <div class="section-title">TUJUAN</div>
          <div class="address">${order.customer_name}<br/>${order.customer_phone}</div>
        </div>
        <div class="section">
          <div class="section-title">ALAMAT</div>
          <div class="address">${order.shipping_address}<br/>${order.shipping_city}, ${order.shipping_province}</div>
        </div>
        <div class="package-info">
          <div class="info-box"><div class="info-label">ORDER ID</div><div class="info-value">${order.order_number}</div></div>
          <div class="info-box"><div class="info-label">ITEM(S)</div><div class="info-value">${order.order_items?.length || 0}</div></div>
        </div>
        <div class="footer">Printed: ${new Date().toLocaleDateString('id-ID')} | Highest World</div>
      </div>
    </body>
  </html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.print();
  toast.success('Siap print label AWB!');
};

export const handleBatchPrintInvoice = (orders, selectedOrders) => {
  if (selectedOrders.size === 0) { toast.error('Pilih order dulu'); return; }
  const selectedOrdersData = orders.filter(o => selectedOrders.has(o.id));
  let allHTML = '<html><head><style>body{padding:20px;font-family:Arial}@media print{body{padding:0}}</style></head><body>';

  selectedOrdersData.forEach(order => {
    const items = order.order_items?.map(i =>
      `<tr><td style="padding:4px;border:1px solid #eee">${i.product_name}</td>
       <td style="padding:4px;border:1px solid #eee;text-align:center">${i.sku_variant || i.sku || i.color}/${i.size}</td>
       <td style="padding:4px;border:1px solid #eee;text-align:center">${i.qty}</td>
       <td style="padding:4px;border:1px solid #eee;text-align:right">Rp ${i.price?.toLocaleString('id-ID')}</td>
       <td style="padding:4px;border:1px solid #eee;text-align:right">Rp ${i.subtotal?.toLocaleString('id-ID')}</td></tr>`
    ).join('');
    allHTML += `
      <div style="page-break-after:always;padding:20px">
        <h2>HIGHEST WORLD</h2>
        <p style="color:#888">Big Size. Real Style.</p><hr/>
        <h3>Invoice ${order.order_number}</h3>
        <p><b>Customer:</b> ${order.customer_name} | <b>HP:</b> ${order.customer_phone}</p>
        <p><b>Alamat:</b> ${order.shipping_address}, ${order.shipping_city}</p>
        <table style="width:100%;border-collapse:collapse;margin:10px 0">
          <tr><th style="padding:4px;border:1px solid #eee;text-align:left">Produk</th><th style="padding:4px;border:1px solid #eee">Varian</th><th style="padding:4px;border:1px solid #eee">Qty</th><th style="padding:4px;border:1px solid #eee;text-align:right">Harga</th><th style="padding:4px;border:1px solid #eee;text-align:right">Subtotal</th></tr>
          ${items}
        </table>
        <div style="text-align:right">
          <p>Subtotal: Rp ${order.subtotal?.toLocaleString('id-ID')}</p>
          <p>Ongkir: Rp ${order.shipping_cost?.toLocaleString('id-ID')}</p>
          <h3>Total: Rp ${order.total?.toLocaleString('id-ID')}</h3>
        </div>
        <hr/><p style="color:#888;font-size:12px">Terima kasih!</p>
      </div>`;
  });

  allHTML += '</body></html>';
  const w = window.open('', '_blank');
  w.document.write(allHTML);
  w.document.close();
  w.print();
  toast.success(`Siap print ${selectedOrdersData.length} invoice!`);
};

export const handleBatchPrintAWB = async (orders, selectedOrders) => {
  if (selectedOrders.size === 0) { toast.error('Pilih order dulu'); return; }
  const selectedOrdersData = orders.filter(o => selectedOrders.has(o.id));
  const orderIds = selectedOrdersData.map(o => o.id);

  const { data: trackingData } = await supabase
    .from('shipping_tracking').select('order_id, awb_number').in('order_id', orderIds);

  const trackingMap = new Map(trackingData?.map(t => [t.order_id, t.awb_number]) || []);
  const ordersWithoutAWB = selectedOrdersData.filter(o => !trackingMap.has(o.id));
  if (ordersWithoutAWB.length > 0) {
    toast.error(`${ordersWithoutAWB.length} order belum ada nomor resi`);
    return;
  }

  let allHTML = '<html><head><style>@page{margin:0}body{margin:0;padding:0}</style></head><body>';
  selectedOrdersData.forEach(order => {
    const awbNumber = trackingMap.get(order.id);
    allHTML += `
      <div style="width:100mm;height:150mm;padding:8mm;border:1px solid #333;page-break-after:always;margin:0">
        <div style="text-align:center;font-weight:bold;font-size:18px;border-bottom:2px solid #333;padding-bottom:4mm;margin-bottom:6mm">${order.courier?.toUpperCase() || 'KURIR'}</div>
        <div style="text-align:center;margin:8mm 0;padding:4mm;border:1px dashed #666">
          <div style="font-size:8px;color:#666">TRACKING NUMBER</div>
          <div style="font-size:24px;font-weight:bold;letter-spacing:2px">${awbNumber}</div>
        </div>
        <div style="font-size:10px;line-height:1.4;margin:6mm 0;padding:4mm;border:1px solid #ddd">
          <div style="font-weight:bold;font-size:9px;margin-bottom:2mm;text-transform:uppercase;color:#333">TUJUAN</div>
          <div style="font-weight:bold;font-size:11px">${order.customer_name}</div>
          <div style="font-size:9px;margin-top:1mm">${order.customer_phone}</div>
          <div style="font-weight:bold;font-size:11px;margin-top:2mm">${order.shipping_address}</div>
          <div>${order.shipping_city}, ${order.shipping_province}</div>
        </div>
        <div style="text-align:center;font-size:7px;color:#666;margin-top:4mm">Printed: ${new Date().toLocaleDateString('id-ID')} | Highest World</div>
      </div>`;
  });

  allHTML += '</body></html>';
  const w = window.open('', '_blank');
  w.document.write(allHTML);
  w.document.close();
  w.print();
  toast.success(`Siap print ${selectedOrdersData.length} label AWB!`);
};

export const handleExportCSV = (filtered, getStatusInfo) => {
  const csv = [
    ['No Order','Tanggal','Customer','HP','Total','Status','Kurir'].join(','),
    ...filtered.map(o => [
      o.order_number,
      new Date(o.created_at).toLocaleDateString('id-ID'),
      o.customer_name,
      o.customer_phone,
      o.total,
      getStatusInfo(o.status).label,
      `${o.courier?.toUpperCase()} ${o.courier_service}`,
    ].join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  toast.success('Export berhasil!');
};
