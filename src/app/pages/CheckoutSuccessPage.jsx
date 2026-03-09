import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { SITE_CONFIG } from '../../lib/config';

export const CheckoutSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Confetti or celebration animation could be added here
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          
          <h1 className="font-display text-3xl lg:text-4xl tracking-wider mb-3">
            PEMBAYARAN BERHASIL!
          </h1>
          
          <p className="text-muted-foreground mb-2">
            Terima kasih telah berbelanja di Highest World
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
                Langkah Selanjutnya
              </h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold">1.</span>
                  <span>Kami akan memproses pesanan Anda dalam 1x24 jam</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold">2.</span>
                  <span>Konfirmasi pembayaran akan dikirim ke email Anda</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold">3.</span>
                  <span>Anda akan menerima nomor resi untuk tracking pengiriman</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold">4.</span>
                  <span>Estimasi pengiriman 1-3 hari kerja</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-background p-4 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-2">
              <strong>Butuh bantuan?</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Hubungi kami via WhatsApp di {SITE_CONFIG.phone} atau email di {SITE_CONFIG.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate('/produk')}
            className="flex-1 bg-accent-gold hover:bg-accent-gold-light text-accent-gold font-subheading uppercase"
          >
            <Package className="w-4 h-4 mr-2" />
            Lanjut Belanja
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex-1 font-subheading uppercase"
          >
            <Home className="w-4 h-4 mr-2" />
            Ke Beranda
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Simpan order ID Anda untuk referensi di masa mendatang
          </p>
        </div>
      </div>
    </div>
  );
};
