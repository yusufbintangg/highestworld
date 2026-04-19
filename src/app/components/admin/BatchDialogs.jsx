import { Check, Loader2, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { STATUS_ORDER } from '../../hooks/useOrders';

// ── Batch Status Update Dialog ────────────────────────────────────
export const BatchStatusDialog = ({
  open,
  onOpenChange,
  selectedCount,
  batchStatus,
  setBatchStatus,
  onConfirm,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Update Status Massal</DialogTitle>
        <DialogDescription>{selectedCount} order dipilih</DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <Label>Pilih Status Baru</Label>
        <Select value={batchStatus} onValueChange={setBatchStatus}>
          <SelectTrigger className="mt-2"><SelectValue placeholder="Pilih status" /></SelectTrigger>
          <SelectContent>
            {STATUS_ORDER.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
        <Button
          onClick={onConfirm}
          disabled={!batchStatus}
          className="bg-accent-gold hover:bg-accent-gold-light text-accent-gold-foreground font-subheading uppercase gap-2"
        >
          <Check className="w-4 h-4" /> Update Sekarang
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// ── Batch Biteship Push Dialog ────────────────────────────────────
export const BatchBiteshipDialog = ({
  open,
  onOpenChange,
  selectedCount,
  progress,
  onConfirm,
}) => {
  const isRunning = progress.total > 0 && progress.done < progress.total;
  const isDone = progress.total > 0 && progress.done === progress.total;
  const successCount = isDone ? progress.total - progress.errors.length : 0;

  return (
    <Dialog open={open} onOpenChange={!isRunning ? onOpenChange : undefined}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Push Biteship Massal</DialogTitle>
          <DialogDescription>
            {progress.total === 0
              ? `${selectedCount} order dipilih. Hanya order berstatus Paid/Diproses yang belum di-push yang akan diproses.`
              : isRunning
              ? `Memproses ${progress.done} / ${progress.total}...`
              : `Selesai! ${successCount} berhasil, ${progress.errors.length} gagal.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Progress bar */}
          {progress.total > 0 && (
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{progress.done} / {progress.total}</span>
                <span>{Math.round((progress.done / progress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Status icons */}
          {isDone && (
            <div className="flex items-center gap-3">
              {successCount > 0 && (
                <div className="flex items-center gap-1.5 text-green-600 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{successCount} berhasil</span>
                </div>
              )}
              {progress.errors.length > 0 && (
                <div className="flex items-center gap-1.5 text-red-500 text-sm">
                  <XCircle className="w-4 h-4" />
                  <span>{progress.errors.length} gagal</span>
                </div>
              )}
            </div>
          )}

          {/* Error list */}
          {progress.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1 max-h-40 overflow-y-auto">
              <p className="text-xs font-semibold text-red-600 mb-2">Order yang gagal:</p>
              {progress.errors.map((e, i) => (
                <div key={i} className="text-xs text-red-500">
                  <span className="font-medium">{e.orderNumber}</span>: {e.error}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          {!isRunning && progress.total === 0 && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
              <Button onClick={onConfirm} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                <Truck className="w-4 h-4" /> Push Sekarang
              </Button>
            </>
          )}
          {isRunning && (
            <Button disabled className="gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
            </Button>
          )}
          {isDone && (
            <Button onClick={() => onOpenChange(false)}>Tutup</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
