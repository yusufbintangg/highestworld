import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabaseAdmin';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export const STATUS_ORDER = [
  { value: 'waiting_payment',  label: 'Pending',    color: 'text-red-500 border-red-500/30 bg-red-500/10' },
  { value: 'payment_confirmed',label: 'Paid',       color: 'text-blue-500 border-blue-500/30 bg-blue-500/10' },
  { value: 'processing',       label: 'Diproses',   color: 'text-purple-500 border-purple-500/30 bg-purple-500/10' },
  { value: 'shipped',          label: 'Dikirim',    color: 'text-cyan-500 border-cyan-500/30 bg-cyan-500/10' },
  { value: 'completed',        label: 'Selesai',    color: 'text-green-500 border-green-500/30 bg-green-500/10' },
  { value: 'cancelled',        label: 'Dibatalkan', color: 'text-red-500 border-red-500/30 bg-red-500/10' },
];

export const getStatusInfo = (status) =>
  STATUS_ORDER.find(s => s.value === status) || { label: status, color: 'text-muted-foreground' };

export const useOrders = () => {
  const queryClient = useQueryClient();

  // Fetch orders with React Query
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      console.log('Fetching orders from admin client...');
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error response:', {
          message: error.message,
          code: error.code,
          status: error.status,
          details: error.details
        });
        throw error;
      }
      console.log('Orders fetched successfully:', data?.length || 0);
      return data || [];
    },
  });

  // Local state for filters and UI
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [updateData, setUpdateData] = useState({ status: '', trackingNumber: '', notes: '' });

  // Multi-select
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [showBatchUpdateDialog, setShowBatchUpdateDialog] = useState(false);
  const [showBatchBiteshipDialog, setShowBatchBiteshipDialog] = useState(false);
  const [batchStatus, setBatchStatus] = useState('');

  // Biteship
  const [pushingBiteship, setPushingBiteship] = useState(false);
  const [batchBiteshipProgress, setBatchBiteshipProgress] = useState({ done: 0, total: 0, errors: [] });

  // ── Filter & Stats ──────────────────────────────────────────────
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

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'waiting_payment').length,
    paid: orders.filter(o => o.status === 'payment_confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders
      .filter(o => ['payment_confirmed','processing','shipped','completed'].includes(o.status))
      .reduce((sum, o) => sum + (o.total || 0), 0),
  };

  // ── Single Order Handlers ───────────────────────────────────────
  const handleOpenUpdateDialog = async (order) => {
    const { data: itemsData } = await supabase
      .from('order_items').select('*').eq('order_id', order.id);
    setSelectedOrder({ ...order, order_items: itemsData || [] });
    setUpdateData({ status: order.status, trackingNumber: order.tracking_number || '', notes: order.notes || '' });
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    const { error } = await supabase
      .from('orders')
      .update({ status: updateData.status, notes: updateData.notes, updated_at: new Date().toISOString() })
      .eq('id', selectedOrder.id);
    if (error) { toast.error('Gagal update order'); return; }

    if (updateData.trackingNumber) {
      await supabase.from('shipping_tracking').upsert({
        order_id: selectedOrder.id,
        awb_number: updateData.trackingNumber,
        courier: selectedOrder.courier,
        status: 'shipped',
      }, { onConflict: 'order_id' });
    }

    await supabase.from('order_status_history').insert({
      order_id: selectedOrder.id,
      status: updateData.status,
      notes: updateData.notes,
      changed_by: 'admin',
    });

    toast.success('Order berhasil diupdate!');
    setSelectedOrder(null);
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
  };

  // ── Push Biteship (single) ──────────────────────────────────────
  const handlePushBiteship = async (orderId) => {
    setPushingBiteship(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/biteship-create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      toast.success(`Order dipush ke Biteship! AWB: ${data.awb_number || 'Pending'}`);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder(prev => ({ ...prev, biteship_order_id: data.biteship_order_id, awb_number: data.awb_number }));
    } catch (error) {
      toast.error('Gagal push ke Biteship: ' + error.message);
    } finally {
      setPushingBiteship(false);
    }
  };

  // ── Push Biteship Massal ────────────────────────────────────────
  const handleBatchPushBiteship = async () => {
    const orderIds = Array.from(selectedOrders);
    const eligibleOrders = orders.filter(o =>
      orderIds.includes(o.id) &&
      ['payment_confirmed', 'processing'].includes(o.status) &&
      !o.biteship_order_id
    );

    if (eligibleOrders.length === 0) {
      toast.error('Tidak ada order yang eligible (harus Paid/Diproses dan belum di-push)');
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    setBatchBiteshipProgress({ done: 0, total: eligibleOrders.length, errors: [] });
    setShowBatchBiteshipDialog(true);

    const errors = [];
    for (let i = 0; i < eligibleOrders.length; i++) {
      const order = eligibleOrders[i];
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/biteship-create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
          body: JSON.stringify({ order_id: order.id }),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
      } catch (err) {
        errors.push({ orderNumber: order.order_number, error: err.message });
      }
      setBatchBiteshipProgress({ done: i + 1, total: eligibleOrders.length, errors: [...errors] });
    }

    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    setSelectedOrders(new Set());

    if (errors.length === 0) {
      toast.success(`${eligibleOrders.length} order berhasil dipush ke Biteship!`);
    } else {
      toast.error(`${errors.length} order gagal dipush. Cek detail di dialog.`);
    }
  };

  // ── Batch Status Update ─────────────────────────────────────────
  const handleBatchUpdateStatus = async () => {
    if (selectedOrders.size === 0) { toast.error('Pilih order dulu'); return; }
    const orderIds = Array.from(selectedOrders);
    for (const orderId of orderIds) {
      await supabase.from('orders')
        .update({ status: batchStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      await supabase.from('order_status_history')
        .insert({ order_id: orderId, status: batchStatus, changed_by: 'admin' });
    }
    toast.success(`${orderIds.length} order diupdate!`);
    setSelectedOrders(new Set());
    setShowBatchUpdateDialog(false);
    setBatchStatus('');
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
  };

  // ── Select Helpers ──────────────────────────────────────────────
  const toggleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    newSelected.has(orderId) ? newSelected.delete(orderId) : newSelected.add(orderId);
    setSelectedOrders(newSelected);
  };

  const toggleSelectAll = () => {
    setSelectedOrders(
      selectedOrders.size === filtered.length && filtered.length > 0
        ? new Set()
        : new Set(filtered.map(o => o.id))
    );
  };

  return {
    // data
    orders, filtered, loading: isLoading, stats,
    selectedOrder, setSelectedOrder,
    updateData, setUpdateData,
    dateRange, setDateRange,
    filters, setFilters,
    // multi select
    selectedOrders, setSelectedOrders,
    showBatchUpdateDialog, setShowBatchUpdateDialog,
    showBatchBiteshipDialog, setShowBatchBiteshipDialog,
    batchStatus, setBatchStatus,
    batchBiteshipProgress,
    // biteship
    pushingBiteship,
    // handlers
    handleOpenUpdateDialog,
    handleUpdateOrder,
    handlePushBiteship,
    handleBatchPushBiteship,
    handleBatchUpdateStatus,
    toggleSelectOrder,
    toggleSelectAll,
  };
};
