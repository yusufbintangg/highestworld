import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MessageCircle, Mail, Phone, Instagram, Music, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { SITE_CONFIG } from '../../lib/config';
import { generateGeneralWAMessage } from '../../lib/utils';

const contactSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon tidak valid'),
  message: z.string().min(10, 'Pesan minimal 10 karakter'),
});

export const ContactPage = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data) => {
    const message = `Halo Highest World!

Nama: ${data.name}
Email: ${data.email}
No. HP: ${data.phone}

Pesan:
${data.message}`;

    const waUrl = `https://wa.me/${SITE_CONFIG.phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    toast.success('Membuka WhatsApp...');
    reset();
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl md:text-6xl tracking-[0.1em] mb-4">
            HUBUNGI KAMI
          </h1>
          <div className="w-24 h-1 bg-accent-gold mx-auto mb-6"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Punya pertanyaan? Ingin konsultasi ukuran? Tim kami siap membantu Anda. 
            Hubungi kami melalui formulir atau kontak langsung di bawah ini.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-card border border-border rounded-lg p-8">
            <h2 className="font-subheading text-2xl uppercase tracking-wider mb-6">
              Kirim Pesan
            </h2>

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
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@example.com"
                  className="mt-2"
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Nomor WhatsApp *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="08123456789"
                  className="mt-2"
                />
                {errors.phone && (
                  <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="message">Pesan *</Label>
                <Textarea
                  id="message"
                  {...register('message')}
                  placeholder="Tuliskan pesan Anda di sini..."
                  rows={5}
                  className="mt-2"
                />
                {errors.message && (
                  <p className="text-destructive text-sm mt-1">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-accent-gold hover:bg-accent-gold-light text-accent-gold font-subheading uppercase"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                KIRIM VIA WHATSAPP
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-subheading text-2xl uppercase tracking-wider mb-6">
                Info Kontak
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-gold/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-accent-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">WhatsApp</h3>
                    <a
                      href={generateGeneralWAMessage()}
                      className="text-muted-foreground hover:text-accent-gold transition-colors"
                    >
                      +{SITE_CONFIG.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-gold/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-accent-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a
                      href={`mailto:${SITE_CONFIG.email}`}
                      className="text-muted-foreground hover:text-accent-gold transition-colors"
                    >
                      {SITE_CONFIG.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-gold/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-accent-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Jam Operasional</h3>
                    <p className="text-muted-foreground text-sm">
                      Senin - Jumat: {SITE_CONFIG.operationalHours.weekdays}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Sabtu - Minggu: {SITE_CONFIG.operationalHours.weekend}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-subheading text-xl uppercase tracking-wider mb-4">
                Sosial Media
              </h3>
              <div className="flex gap-4">
                {[
                  { icon: Instagram, url: `https://instagram.com/${SITE_CONFIG.instagram.replace('@', '')}`, name: 'Instagram' },
                  { icon: Music, url: `https://tiktok.com/${SITE_CONFIG.tiktok.replace('@', '')}`, name: 'TikTok' },
                ].map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-full border-2 border-border hover:border-accent-gold flex items-center justify-center transition-all group"
                    >
                      <Icon className="w-6 h-6 text-muted-foreground group-hover:text-accent-gold transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Chat Now Button */}
            <Button
              asChild
              size="lg"
              className="w-full bg-accent-gold hover:bg-accent-gold-light text-accent-gold font-subheading uppercase"
            >
              <a href={generateGeneralWAMessage()}>
                <MessageCircle className="w-5 h-5 mr-2" />
                CHAT WHATSAPP LANGSUNG
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
