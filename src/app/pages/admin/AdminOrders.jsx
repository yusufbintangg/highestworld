import { motion } from 'motion/react';
import { Search, Download, Truck, CheckCircle, Printer, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DateRangePicker } from '../../components/admin/DateRangePicker';
import { formatPrice } from '../../../lib/utils';

import { useOrders, STATUS_ORDER, getStatusInfo } from '../../hooks/useOrders';
import { OrderDetailDialog } from '../../components/admin/OrderDetailDialog';
import { BatchStatusDialog, BatchBiteshipDialog } from '../../components/admin/BatchDialogs';
import {
  handleWhatsApp,
  handlePrintInvoice,
  handlePrintAWB,
  handleBatchPrintInvoice,
  handleBatchPrintAWB,
  handleExportCSV,
} from '../../hooks/orderActions';

export const AdminOrders = () => {
  const {
    orders, filtered, loading, stats,
    selectedOrder, setSelectedOrder,
    updateData, setUpdateData,
    dateRange, setDateRange,
    filters, setFilters,
    selectedOrders, setSelectedOrders,
    showBatchUpdateDialog, setShowBatchUpdateDialog,
    showBatchBiteshipDialog, setShowBatchBiteshipDialog,
    batchStatus, setBatchStatus,
    batchBiteshipProgress,
    pushingBiteship,
    handleOpenUpdateDialog,
    handleUpdateOrder,
    handlePushBiteship,
    handleBatchPushBiteship,
    handleBatchUpdateStatus,
    toggleSelectOrder,
    toggleSelectAll,
  } = useOrders();

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
                <CheckCircle className="w-4 h-4" /> Update {selectedOrders.size}
              </Button>
              <Button variant="outline" onClick={() => handleBatchPrintInvoice(orders, selectedOrders)} className="gap-2">
                <Printer className="w-4 h-4" /> Print Invoice
              </Button>
              <Button variant="outline" onClick={() => handleBatchPrintAWB(orders, selectedOrders)} className="gap-2">
                <Truck className="w-4 h-4" /> Print AWB
              </Button>
              <Button
                onClick={() => setShowBatchBiteshipDialog(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
              >
                <Truck className="w-4 h-4" /> Push Biteship ({selectedOrders.size})
              </Button>
            </>
          )}
          <Button onClick={() => handleExportCSV(filtered, getStatusInfo)} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        {[
          { label: 'Total Order', value: stats.total, color: '' },
          { label: 'Pending',     value: stats.pending,    color: 'text-red-500' },
          { label: 'Paid',        value: stats.paid,       color: 'text-blue-500' },
          { label: 'Diproses',    value: stats.processing, color: 'text-blue-500' },
          { label: 'Dikirim',     value: stats.shipped,    color: 'text-purple-500' },
          { label: 'Selesai',     value: stats.completed,  color: 'text-green-500' },
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
            <Button variant="outline" onClick={() => {
              setFilters({ status: 'all', search: '' });
              setDateRange(null);
              setSelectedOrders(new Set());
            }}>
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Order ({filtered.length})</CardTitle>
          <CardDescription>Klik checkbox untuk memilih, klik Detail untuk lihat & update</CardDescription>
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
              {/* Header */}
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
                      <p className="text-accent-gold text-sm">{order.awb_number ? `Resi: ${order.awb_number}` : 'Belum ada resi'}</p>
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
                      <p className="text-xs text-muted-foreground line-clamp-1">{order.order_items?.[0]?.product_name}</p>
                    </div>
                    <div className="col-span-1">
                      <p className="font-bold text-accent-gold text-sm">{formatPrice(order.total)}</p>
                    </div>
                    <div className="col-span-1">
                      <Badge variant="outline" className={statusInfo.color}>{statusInfo.label}</Badge>
                    </div>
                    <div className="col-span-3 flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => handleOpenUpdateDialog(order)} className="text-xs h-8">Detail</Button>
                      <Button size="sm" variant="outline" onClick={() => handlePrintInvoice(order)} className="text-xs h-8" title="Print Invoice">
                        <Printer className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handlePrintAWB(order)} className="text-xs h-8" title="Print AWB">
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

      {/* ── Dialogs ── */}
      <OrderDetailDialog
        selectedOrder={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        updateData={updateData}
        setUpdateData={setUpdateData}
        onUpdate={handleUpdateOrder}
        onWhatsApp={handleWhatsApp}
        onPrintInvoice={handlePrintInvoice}
        onPrintAWB={handlePrintAWB}
        onPushBiteship={handlePushBiteship}
        pushingBiteship={pushingBiteship}
      />

      <BatchStatusDialog
        open={showBatchUpdateDialog}
        onOpenChange={setShowBatchUpdateDialog}
        selectedCount={selectedOrders.size}
        batchStatus={batchStatus}
        setBatchStatus={setBatchStatus}
        onConfirm={handleBatchUpdateStatus}
      />

      <BatchBiteshipDialog
        open={showBatchBiteshipDialog}
        onOpenChange={setShowBatchBiteshipDialog}
        selectedCount={selectedOrders.size}
        progress={batchBiteshipProgress}
        onConfirm={handleBatchPushBiteship}
      />
    </div>
  );
};
