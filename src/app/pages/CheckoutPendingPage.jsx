import React from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Clock, Package, ArrowRight, Home, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { SITE_CONFIG, WHATSAPP_NUMBER } from '../../lib/config';

export const CheckoutPendingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  const handleContactWhatsApp = () => {
    const message = `Halo, saya ingin menanyakan status pembayaran saya dengan Order ID: ${orderId}`;
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="min-h-screen mt-20 bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/20 rounded-full mb-6">
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
          
          <h1 className="font-display text-3xl lg:text-4xl tracking-wider mb-3">
            PEMBAYARAN TERTUNDA
          </h1>
          
          <p className="text-muted-foreground mb-2">
            Pesanan Anda sedang menunggu konfirmasi pembayaran
          </p>
          
          {orderId && (
            <div className="inline-block mt-4 px-4 py-2 bg-secondary border border-border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Order ID</p>
              <p className="font-mono text-sm font-medium text-accent-gold">{orderId}</p>
            </div>
          )}
        </div>

        <div className="bg-secondary p-6 rounded-lg border border-border mb-6">
          <div className="flex items-start gap-4 mb-6">
            <Package className="w-6 h-6 text-accent-gold shrink-0 mt-1" />
            <div>
              <h2 className="font-subheading text-lg uppercase tracking-wider mb-2">
                Status Pesanan
              </h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold">•</span>
                  <span>Pesanan Anda telah kami terima</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold">•</span>
                  <span>Silakan selesaikan pembayaran Anda</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold">•</span>
                  <span>Pesanan akan diproses setelah pembayaran dikonfirmasi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold">•</span>
                  <span>Anda akan menerima email konfirmasi setelah pembayaran berhasil</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
            <p className="text-xs text-yellow-600 dark:text-yellow-500">
              <strong>Penting:</strong> Jika Anda telah menyelesaikan pembayaran namun status belum berubah, 
              mohon hubungi kami melalui WhatsApp atau email.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button
            onClick={handleContactWhatsApp}
            className="flex-1 bg-accent-gold hover:bg-accent-gold-light text-accent-gold font-subheading uppercase"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Hubungi via WhatsApp
          </Button>
          <Button
            onClick={() => navigate('/konfirmasi-pembayaran')}
            variant="outline"
            className="flex-1 font-subheading uppercase"
          >
            Konfirmasi Pembayaran
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/produk')}
            variant="ghost"
            className="flex-1 font-subheading uppercase"
          >
            Lanjut Belanja
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="flex-1 font-subheading uppercase"
          >
            Ke Beranda
          </Button>
        </div>

        <div className="mt-8 text-center bg-secondary p-4 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-2">
            <strong>Butuh bantuan?</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            WhatsApp: {SITE_CONFIG.phone} | Email: {SITE_CONFIG.email}
          </p>
        </div>
      </div>
    </div>
  );
};
