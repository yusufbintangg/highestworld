import { Loader2, MessageCircle, Printer, Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { formatPrice } from '../../../lib/utils';
import { STATUS_ORDER } from '../../hooks/useOrders';

export const OrderDetailDialog = ({
  selectedOrder,
  onClose,
  updateData,
  setUpdateData,
  onUpdate,
  onWhatsApp,
  onPrintInvoice,
  onPrintAWB,
  onPushBiteship,
  pushingBiteship,
}) => {
  return (
    <Dialog open={!!selectedOrder} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail & Update Order</DialogTitle>
          <DialogDescription>
            {selectedOrder?.order_number} — {selectedOrder?.customer_name} —{' '}
            {selectedOrder?.awb_number ? `Resi: ${selectedOrder.awb_number}` : 'Belum ada resi'}
          </DialogDescription>
        </DialogHeader>

        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Produk ({selectedOrder.order_items?.length || 0})</h3>
              {selectedOrder.order_items?.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg text-center">Tidak ada item.</p>
              ) : (
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                        {item.variant_images?.length > 0
                          ? <img src={item.variant_images[0]} alt={item.product_name} className="w-full h-full object-cover" />
                          : <span className="text-xs text-muted-foreground flex items-center justify-center h-full">No img</span>
                        }
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.sku_variant || item.sku || item.color} • {item.size} • {item.qty}x
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
                <div><p className="text-muted-foreground text-xs">Nama</p><p className="font-semibold">{selectedOrder.customer_name}</p></div>
                <div><p className="text-muted-foreground text-xs">Email</p><p className="font-semibold">{selectedOrder.customer_email || '-'}</p></div>
                <div><p className="text-muted-foreground text-xs">Telepon</p><p className="font-semibold">{selectedOrder.customer_phone}</p></div>
                <div><p className="text-muted-foreground text-xs">Metode Pembayaran</p><p className="font-semibold capitalize">{selectedOrder.payment_method}</p></div>
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
                  <Label>Status Order</Label>
                  <Select value={updateData.status} onValueChange={(v) => setUpdateData({ ...updateData, status: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                    <SelectContent>
                      {STATUS_ORDER.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Catatan</Label>
                  <Input
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
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">{formatPrice(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ongkir</span><span className="font-semibold">{formatPrice(selectedOrder.shipping_cost)}</span></div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-accent-gold text-lg">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="outline" onClick={() => onWhatsApp(selectedOrder)}>
            <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
          </Button>
          <Button variant="outline" onClick={() => onPrintInvoice(selectedOrder)}>
            <Printer className="w-4 h-4 mr-2" /> Print Invoice
          </Button>
          <Button variant="outline" onClick={() => onPrintAWB(selectedOrder, updateData.trackingNumber)}>
            <Truck className="w-4 h-4 mr-2" /> Print AWB
          </Button>
          {['payment_confirmed', 'processing'].includes(selectedOrder?.status) && (
            <Button
              onClick={() => onPushBiteship(selectedOrder.id)}
              disabled={pushingBiteship || !!selectedOrder?.biteship_order_id}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {pushingBiteship
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Memproses...</>
                : selectedOrder?.biteship_order_id
                  ? <><Truck className="w-4 h-4 mr-2" />Sudah di Biteship</>
                  : <><Truck className="w-4 h-4 mr-2" />Push ke Biteship</>
              }
            </Button>
          )}
          <Button onClick={onUpdate} className="bg-accent-gold hover:bg-accent-gold-light text-accent-gold-foreground">
            Simpan Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
