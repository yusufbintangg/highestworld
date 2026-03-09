import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { BANK_INFO } from '../../lib/config';
import { generatePaymentConfirmationWAMessage, formatPhoneNumber } from '../../lib/utils';

const paymentSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  whatsapp: z.string().min(10, 'Nomor WhatsApp tidak valid'),
  orderNumber: z.string().min(3, 'Nomor order tidak valid'),
  bank: z.string().min(1, 'Pilih bank pengirim'),
  amount: z.string().min(1, 'Masukkan jumlah transfer'),
  date: z.string().min(1, 'Pilih tanggal transfer'),
  notes: z.string().optional(),
});

export const PaymentConfirmationPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(paymentSchema),
  });

  const selectedBank = watch('bank');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      setUploadedFile(file);
      toast.success('File berhasil diunggah');
    }
  };

  const onSubmit = (data) => {
    if (!uploadedFile) {
      toast.error('Mohon upload bukti transfer');
      return;
    }

    const formattedData = {
      ...data,
      whatsapp: formatPhoneNumber(data.whatsapp),
      amount: parseInt(data.amount.replace(/\D/g, ''))
    };

    const waUrl = generatePaymentConfirmationWAMessage(formattedData);
    window.open(waUrl, '_blank');
    toast.success('Membuka WhatsApp...');
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = new Intl.NumberFormat('id-ID').format(value);
    setValue('amount', formatted);
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl tracking-[0.1em] mb-4">
              KONFIRMASI PEMBAYARAN
            </h1>
            <div className="w-24 h-1 bg-accent-gold mx-auto mb-6"></div>
            <p className="text-muted-foreground">
              Konfirmasikan pembayaran Anda untuk mempercepat proses pengiriman
            </p>
          </div>

          {/* Bank Info */}
          <div className="bg-secondary border border-border rounded-lg p-6 mb-8">
            <h2 className="font-subheading text-xl uppercase tracking-wider mb-4">
              Informasi Rekening
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BANK_INFO.accounts.map((account, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Bank {account.bank}</p>
                  <p className="font-mono text-lg font-bold text-accent-gold mb-1">
                    {account.number}
                  </p>
                  <p className="text-sm">{account.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-lg p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Masukkan nama lengkap"
                  className="mt-2"
                />
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="whatsapp">Nomor WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  {...register('whatsapp')}
                  placeholder="08123456789"
                  className="mt-2"
                />
                {errors.whatsapp && (
                  <p className="text-destructive text-sm mt-1">{errors.whatsapp.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="orderNumber">Nomor Order / Kode Pesanan *</Label>
                <Input
                  id="orderNumber"
                  {...register('orderNumber')}
                  placeholder="HW-001234"
                  className="mt-2"
                />
                {errors.orderNumber && (
                  <p className="text-destructive text-sm mt-1">{errors.orderNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="bank">Bank Pengirim *</Label>
                <Select onValueChange={(value) => setValue('bank', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Pilih bank pengirim" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="BRI">BRI</SelectItem>
                    <SelectItem value="BNI">BNI</SelectItem>
                    <SelectItem value="Mandiri">Mandiri</SelectItem>
                    <SelectItem value="BSI">BSI</SelectItem>
                    <SelectItem value="DANA">DANA</SelectItem>
                    <SelectItem value="GoPay">GoPay</SelectItem>
                    <SelectItem value="OVO">OVO</SelectItem>
                    <SelectItem value="ShopeePay">ShopeePay</SelectItem>
                  </SelectContent>
                </Select>
                {errors.bank && (
                  <p className="text-destructive text-sm mt-1">{errors.bank.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Jumlah Transfer *</Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id="amount"
                    {...register('amount')}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="pl-10 font-mono"
                  />
                </div>
                {errors.amount && (
                  <p className="text-destructive text-sm mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="date">Tanggal Transfer *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date')}
                  className="mt-2"
                />
                {errors.date && (
                  <p className="text-destructive text-sm mt-1">{errors.date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="proof">Upload Bukti Transfer *</Label>
                <div className="mt-2">
                  <label
                    htmlFor="proof"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent-gold transition-colors"
                  >
                    {uploadedFile ? (
                      <div className="text-center">
                        <p className="text-sm text-foreground mb-1">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Klik untuk upload bukti transfer
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Format: JPG, PNG (Maks. 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      id="proof"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Tambahkan catatan jika diperlukan..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-accent-gold hover:bg-accent-gold-light text-background font-subheading uppercase"
              >
                KIRIM KONFIRMASI
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
