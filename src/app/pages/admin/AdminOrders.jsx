
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Download, Truck, CheckCircle, Printer, MessageCircle, X, Check , Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { DateRangePicker } from '../../components/admin/DateRangePicker';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { formatPrice } from '../../../lib/utils';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const STATUS_ORDER = [
  { value: 'waiting_payment', label: 'Pending', color: 'text-red-500 border-red-500/30 bg-red-500/10' },
  { value: 'payment_confirmed', label: 'Paid', color: 'text-blue-500 border-blue-500/30 bg-blue-500/10' },
  { value: 'processing', label: 'Diproses', color: 'text-purple-500 border-purple-500/30 bg-purple-500/10' },
  { value: 'shipped', label: 'Dikirim', color: 'text-cyan-500 border-cyan-500/30 bg-cyan-500/10' },
  { value: 'completed', label: 'Selesai', color: 'text-green-500 border-green-500/30 bg-green-500/10' },
  { value: 'cancelled', label: 'Dibatalkan', color: 'text-red-500 border-red-500/30 bg-red-500/10' },
];

const getStatusInfo = (status) =>
  STATUS_ORDER.find(s => s.value === status) || { label: status, color: 'text-muted-foreground' };

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [updateData, setUpdateData] = useState({
    status: '',
    trackingNumber: '',
    notes: ''
  });
  
  // State untuk multi-select
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [showBatchUpdateDialog, setShowBatchUpdateDialog] = useState(false);
  const [batchStatus, setBatchStatus] = useState('');

  const [pushingBiteship, setPushingBiteship] = useState(false);

  const handlePushBiteship = async (orderId) => {
    setPushingBiteship(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/biteship-create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ order_id: orderId }),
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.error);

      toast.success(`Order berhasil dipush ke Biteship! AWB: ${data.awb_number || 'Pending'}`);
      fetchOrders();
      setSelectedOrder(prev => ({ ...prev, biteship_order_id: data.biteship_order_id, awb_number: data.awb_number }));
    } catch (error) {
      toast.error('Gagal push ke Biteship: ' + error.message);
    } finally {
      setPushingBiteship(false);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  // Handler untuk membuka dialog update
  const handleOpenUpdateDialog = async (order) => {
    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);
    
    const orderWithItems = {
      ...order,
      order_items: itemsData || []
    };
    
    setSelectedOrder(orderWithItems);
    setUpdateData({
      status: order.status,
      trackingNumber: order.tracking_number || '',
      notes: order.notes || ''
    });
  };

  // Handler untuk update order
  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: updateData.status,
        notes: updateData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedOrder.id);

    if (orderError) {
      toast.error('Gagal update order');
      return;
    }

    if (updateData.trackingNumber) {
      await supabase
        .from('shipping_tracking')
        .upsert({
          order_id: selectedOrder.id,
          awb_number: updateData.trackingNumber,
          courier: selectedOrder.courier,
          status: 'shipped'
        }, { onConflict: 'order_id' });
    }

    await supabase
      .from('order_status_history')
      .insert({
        order_id: selectedOrder.id,
        status: updateData.status,
        notes: updateData.notes,
        changed_by: 'admin'
      });

    toast.success('Order berhasil diupdate!');
    setSelectedOrder(null);
    fetchOrders();
  };

  // Handler untuk batch update status
  const handleBatchUpdateStatus = async () => {
    if (selectedOrders.size === 0) {
      toast.error('Pilih order dulu');
      return;
    }

    const orderIds = Array.from(selectedOrders);
    
    for (const orderId of orderIds) {
      await supabase
        .from('orders')
        .update({
          status: batchStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: batchStatus,
          changed_by: 'admin'
        });
    }

    toast.success(`${orderIds.length} order diupdate!`);
    setSelectedOrders(new Set());
    setShowBatchUpdateDialog(false);
    setBatchStatus('');
    fetchOrders();
  };

  // Toggle select single order
  const toggleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedOrders.size === filtered.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filtered.map(o => o.id)));
    }
  };

  const handleWhatsApp = (order) => {
    const msg = encodeURIComponent(
      `Halo ${order.customer_name}, pesanan Anda (${order.order_number}) sedang kami proses. Terima kasih sudah berbelanja di Highest World! 🙏`
    );
    window.open(`https://wa.me/${order.customer_phone?.replace(/^0/, '62')}?text=${msg}`, '_blank');
  };

  const handlePrintInvoice = (order) => {
  const items = order.order_items?.map(i =>
    `<tr style="font-size:12px">
      <td style="padding:1px;border:1px solid #ddd">${i.product_name}</td>
      <td style="padding:1px;border:1px solid #ddd;text-align:center">${i.color} / ${i.size}</td>
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

    <!-- Header -->
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

    <!-- Resi Box -->
    ${order.awb_number ? `
    <div style="background:#f5f5f5;border-left:4px solid #111;padding:8px 12px;margin-bottom:12px;border-radius:4px">
      <div style="font-size:11px;color:#666">Nomor Resi</div>
      <div style="font-size:20px;font-weight:bold;letter-spacing:3px;margin:2px 0">${order.awb_number}</div>
      <div style="font-size:11px;color:#666">${order.courier?.toUpperCase()} ${order.courier_service}</div>
    </div>` : `
    <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:8px 12px;margin-bottom:12px;border-radius:4px">
      <span style="font-size:11px;color:#856404">⚠ Nomor resi belum tersedia — push ke Biteship terlebih dahulu</span>
    </div>`}

    <!-- Customer Info -->
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

    <!-- Items Table -->
    <table style="margin-bottom:10px">
      <thead>
        <tr>
          <th>Produk</th>
          <th style="text-align:center">Varian</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Harga</th>
        </tr>
      </thead>
      <tbody>${items}</tbody>
    </table>

    <!-- Total -->
    <div style="text-align:right;font-size:12px;margin-bottom:16px">
      <p style="margin:3px 0">Subtotal: <b>Rp ${order.subtotal?.toLocaleString('id-ID')}</b></p>
      <p style="margin:3px 0">Ongkir (${order.courier?.toUpperCase()} ${order.courier_service}): <b>Rp ${order.shipping_cost?.toLocaleString('id-ID')}</b></p>
      <p style="margin:8px 0;font-size:16px;font-weight:bold">TOTAL: Rp ${order.total?.toLocaleString('id-ID')}</p>
    </div>

    <!-- Footer -->
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

  // Print AWB Label
  const handlePrintAWB = async (order) => {
    // Fetch tracking number
    const { data: trackingData } = await supabase
      .from('shipping_tracking')
      .select('awb_number')
      .eq('order_id', order.id)
      .single();
    
    const awbNumber = trackingData?.awb_number || updateData.trackingNumber;
    
    if (!awbNumber) {
      toast.error('Nomor resi belum ada. Masukkan nomor resi dulu!');
      return;
    }

    const courierLogo = order.courier?.toUpperCase() || 'KURIR';
    const html = `
      <html>
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
      </html>
    `;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
    toast.success('Siap print label AWB!');
  };


  // Print Invoice Massal
  const handleBatchPrintInvoice = () => {
    if (selectedOrders.size === 0) {
      toast.error('Pilih order dulu');
      return;
    }

    const selectedOrdersData = orders.filter(o => selectedOrders.has(o.id));
    let allHTML = '<html><head><style>body{padding:20px;font-family:Arial}@media print{body{padding:0}}</style></head><body>';
    
    selectedOrdersData.forEach(order => {
      const items = order.order_items?.map(i =>
        `<tr><td style="padding:4px;border:1px solid #eee">${i.product_name}</td><td style="padding:4px;border:1px solid #eee;text-align:center">${i.color}/${i.size}</td><td style="padding:4px;border:1px solid #eee;text-align:center">${i.qty}</td><td style="padding:4px;border:1px solid #eee;text-align:right">Rp ${i.price?.toLocaleString('id-ID')}</td><td style="padding:4px;border:1px solid #eee;text-align:right">Rp ${i.subtotal?.toLocaleString('id-ID')}</td></tr>`
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
        </div>
      `;
    });

    allHTML += '</body></html>';
    const w = window.open('', '_blank');
    w.document.write(allHTML);
    w.document.close();
    w.print();
    toast.success(`Siap print ${selectedOrdersData.length} invoice!`);
  };

  // Print AWB Massal
  const handleBatchPrintAWB = async () => {
    if (selectedOrders.size === 0) {
      toast.error('Pilih order dulu');
      return;
    }

    const selectedOrdersData = orders.filter(o => selectedOrders.has(o.id));
    
    // Fetch semua tracking numbers
    const orderIds = selectedOrdersData.map(o => o.id);
    const { data: trackingData } = await supabase
      .from('shipping_tracking')
      .select('order_id, awb_number')
      .in('order_id', orderIds);
    
    const trackingMap = new Map(trackingData?.map(t => [t.order_id, t.awb_number]) || []);
    
    // Cek mana yang belum ada resi
    const ordersWithoutAWB = selectedOrdersData.filter(o => !trackingMap.has(o.id));
    if (ordersWithoutAWB.length > 0) {
      toast.error(`${ordersWithoutAWB.length} order belum ada nomor resi`);
      return;
    }

    let allHTML = '<html><head><style>@page{margin:0}body{margin:0;padding:0}</style></head><body>';
    
    selectedOrdersData.forEach(order => {
      const awbNumber = trackingMap.get(order.id);
      const courierLogo = order.courier?.toUpperCase() || 'KURIR';
      
      allHTML += `
        <div style="width:100mm;height:150mm;padding:8mm;border:1px solid #333;page-break-after:always;margin:0;position:relative">
          <div style="text-align:center;font-weight:bold;font-size:18px;border-bottom:2px solid #333;padding-bottom:4mm;margin-bottom:6mm">${courierLogo}</div>
          <div style="text-align:center;margin:8mm 0;padding:4mm;border:1px dashed #666">
            <div style="font-size:8px;color:#666">TRACKING NUMBER</div>
            <div style="font-size:24px;font-weight:bold;letter-spacing:2px">${awbNumber}</div>
          </div>
          <div style="font-size:10px;line-height:1.4;margin:6mm 0;padding:4mm;border:1px solid #ddd">
            <div style="font-weight:bold;font-size:9px;margin-bottom:2mm;text-transform:uppercase;color:#333">TUJUAN</div>
            <div style="font-weight:bold;font-size:11px;line-height:1.3">${order.customer_name}</div>
            <div style="font-size:9px;margin-top:1mm">${order.customer_phone}</div>
            <div style="font-weight:bold;font-size:11px;line-height:1.3;margin-top:2mm">${order.shipping_address}</div>
            <div>${order.shipping_city}, ${order.shipping_province}</div>
          </div>
          <div style="text-align:center;font-size:7px;color:#666;margin-top:4mm">Printed: ${new Date().toLocaleDateString('id-ID')} | Highest World</div>
        </div>
      `;
    });

    allHTML += '</body></html>';
    const w = window.open('', '_blank');
    w.document.write(allHTML);
    w.document.close();
    w.print();
    toast.success(`Siap print ${selectedOrdersData.length} label AWB!`);
  };

  const handleExportCSV = () => {
    const csv = [
      ['No Order', 'Tanggal', 'Customer', 'HP', 'Total', 'Status', 'Kurir'].join(','),
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

  // Filter logic
  const filtered = orders.filter(o => {
    const matchSearch = !filters.search ||
      o.customer_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      o.order_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
      o.awb_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
      o.customer_phone?.includes(filters.search);
    const matchStatus = filters.status === 'all' || o.status === filters.status;
    const matchDate = !dateRange?.from || isWithinInterval(
      new Date(o.created_at),
      { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to || dateRange.from) }
    );
    return matchSearch && matchStatus && matchDate;
  });

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'waiting_payment').length,
    paid: orders.filter(o => o.status === 'payment_confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders.filter(o => ['payment_confirmed','processing','shipped','completed'].includes(o.status))
      .reduce((sum, o) => sum + (o.total || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wider mb-1">Order Management</h1>
          <p className="text-muted-foreground text-sm">Kelola semua order dengan mudah dan efisien</p>
        </div>

        <div className="flex gap-2">
          {selectedOrders.size > 0 && (
            <>
              <Button variant="outline" onClick={() => setShowBatchUpdateDialog(true)} className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Update {selectedOrders.size}
              </Button>
              <Button variant="outline" onClick={handleBatchPrintInvoice} className="gap-2">
                <Printer className="w-4 h-4" />
                Print Invoice
              </Button>
              <Button variant="outline" onClick={handleBatchPrintAWB} className="gap-2">
                <Truck className="w-4 h-4" />
                Print AWB
              </Button>
            </>
          )}
          <Button onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Total Order', value: stats.total, color: '' },
          { label: 'Pending', value: stats.pending, color: 'text-red-500' },
          { label: 'Paid', value: stats.paid, color: 'text-blue-500' },
          { label: 'Diproses', value: stats.processing, color: 'text-blue-500' },
          { label: 'Dikirim', value: stats.shipped, color: 'text-purple-500' },
          { label: 'Selesai', value: stats.completed, color: 'text-green-500' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Revenue</p>
            <p className="text-lg font-bold text-accent-gold">{formatPrice(stats.revenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari order, customer, HP..."
                value={filters.search}
                onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
                className="pl-9"
              />
            </div>
            <Select value={filters.status} onValueChange={(v) => setFilters(p => ({ ...p, status: v }))}>
              <SelectTrigger><SelectValue placeholder="Status Order" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {STATUS_ORDER.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            <Button variant="outline" onClick={() => { setFilters({ status: 'all', search: '' }); setDateRange(null); setSelectedOrders(new Set()); }}>
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Order ({filtered.length})</CardTitle>
          <CardDescription>Klik checkbox untuk memilih, klik baris untuk detail</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Tidak ada order ditemukan</p>
            </div>
          ) : (
            <div className="space-y-3">

              {/* Header with select all */}
              <div className="grid grid-cols-12 gap-4 p-3 rounded-lg bg-muted/50 font-medium text-sm">
                <div className="col-span-1 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedOrders.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="col-span-2">Order</div>
                <div className="col-span-2">Customer</div>
                <div className="col-span-2">Items</div>
                <div className="col-span-1">Total</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-3 text-center">Aksi</div>
              </div>
              
              {filtered.map((order, index) => {
                const statusInfo = getStatusInfo(order.status);
                const isSelected = selectedOrders.has(order.id);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`grid grid-cols-12 gap-4 p-3 rounded-lg border border-border hover:border-accent-gold hover:bg-secondary transition-all items-center ${isSelected ? 'bg-accent-gold/5 border-accent-gold' : ''}`}
                  >
                    <div className="col-span-1 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </div>
                    <div className="col-span-2">
                      <p className="font-bold text-accent-gold text-sm">{order.order_number}</p>
                      <p className="text-accent-gold text-sm">
                        {order.awb_number ? `Resi: ${order.awb_number}` : 'Belum ada resi'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-semibold text-sm">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-semibold text-sm">{order.order_items?.length} produk</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {order.order_items?.[0]?.product_name}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <p className="font-bold text-accent-gold text-sm">{formatPrice(order.total)}</p>
                    </div>
                    <div className="col-span-1">
                      <Badge variant="outline" className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <div className="col-span-3 flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleOpenUpdateDialog(order)}
                        className="text-xs h-8"
                      >
                        Detail
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePrintInvoice(order)}
                        className="text-xs h-8"
                        title="Print Invoice"
                      >
                        <Printer className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePrintAWB(order)}
                        className="text-xs h-8"
                        title="Print AWB"
                      >
                        <Truck className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail & Update Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail & Update Order</DialogTitle>
            <DialogDescription>
              {selectedOrder?.order_number} — {selectedOrder?.customer_name} - {selectedOrder?.awb_number ? `Resi: ${selectedOrder.awb_number}` : 'Belum ada resi'}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Produk yang Dipesan ({selectedOrder.order_items?.length || 0})</h3>
                {(!selectedOrder.order_items || selectedOrder.order_items.length === 0) ? (
                  <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg text-center">
                    Tidak ada item.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedOrder.order_items?.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                          {item.variant_images?.length > 0 ? (
                            <img src={item.variant_images[0]} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center justify-center h-full">No img</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.color} • {item.size} • {item.qty}x
                          </p>
                        </div>
                        <p className="font-bold text-accent-gold">{formatPrice(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-3">Informasi Customer</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Nama</p>
                    <p className="font-semibold">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="font-semibold">{selectedOrder.customer_email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Telepon</p>
                    <p className="font-semibold">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Metode Pembayaran</p>
                    <p className="font-semibold capitalize">{selectedOrder.payment_method}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">Alamat Pengiriman</p>
                    <p className="font-semibold">{selectedOrder.shipping_address}, {selectedOrder.shipping_city}, {selectedOrder.shipping_province}</p>
                  </div>
                </div>
              </div>

              {/* Update Form */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Update Status Order</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status Order</Label>
                    <Select 
                      value={updateData.status} 
                      onValueChange={(value) => setUpdateData({ ...updateData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_ORDER.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Catatan</Label>
                    <Input
                      id="notes"
                      placeholder="Tambahkan catatan"
                      value={updateData.notes}
                      onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-secondary p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ongkir</span>
                    <span className="font-semibold">{formatPrice(selectedOrder.shipping_cost)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-accent-gold text-lg">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" onClick={() => handleWhatsApp(selectedOrder)}>
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </Button>
            <Button variant="outline" onClick={() => handlePrintInvoice(selectedOrder)}>
              <Printer className="w-4 h-4 mr-2" /> Print Invoice
            </Button>
            {selectedOrder?.status === 'payment_confirmed' || selectedOrder?.status === 'processing' ? (
              <Button
                onClick={() => handlePushBiteship(selectedOrder.id)}
                disabled={pushingBiteship || !!selectedOrder.biteship_order_id}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {pushingBiteship ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
                ) : selectedOrder.biteship_order_id ? (
                  <><Truck className="w-4 h-4 mr-2" /> Sudah di Biteship</>
                ) : (
                  <><Truck className="w-4 h-4 mr-2" /> Push ke Biteship</>
                )}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Update Dialog */}
      <Dialog open={showBatchUpdateDialog} onOpenChange={setShowBatchUpdateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Status Massal</DialogTitle>
            <DialogDescription>
              {selectedOrders.size} order dipilih
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label>Pilih Status Baru</Label>
            <Select value={batchStatus} onValueChange={setBatchStatus}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_ORDER.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchUpdateDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleBatchUpdateStatus}
              disabled={!batchStatus}
              className="bg-accent-gold hover:bg-accent-gold-light text-accent-gold-foreground font-subheading uppercase gap-2"
            >
              <Check className="w-4 h-4 mr-2" />
              Update Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

