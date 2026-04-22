import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import { MessageCircle, Mail, Clock, Instagram, Music, MapPin, ArrowUpRight, Send } from 'lucide-react';
import { toast } from 'sonner';
import { SITE_CONFIG } from '../../lib/config';
import { generateGeneralWAMessage } from '../../lib/utils';

const contactSchema = z.object({
  name:    z.string().min(2, 'Nama minimal 2 karakter'),
  email:   z.string().email('Email tidak valid'),
  phone:   z.string().min(10, 'Nomor telepon tidak valid'),
  message: z.string().min(10, 'Pesan minimal 10 karakter'),
});

const inputClass = `
  w-full bg-transparent border-b border-black/15 py-3 text-sm text-black
  placeholder:text-gray-300 outline-none
  focus:border-black transition-colors duration-200
  tracking-wide
`.trim();

export const ContactPage = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data) => {
    const message = `Halo Highest World!\n\nNama: ${data.name}\nEmail: ${data.email}\nNo. HP: ${data.phone}\n\nPesan:\n${data.message}`;
    window.open(`https://wa.me/${SITE_CONFIG.phone}?text=${encodeURIComponent(message)}`, '_blank');
    toast.success('Membuka WhatsApp...');
    reset();
  };

  const socials = [
    { icon: Instagram, label: 'Instagram', handle: SITE_CONFIG.instagram, url: `https://instagram.com/${SITE_CONFIG.instagram.replace('@', '')}` },
    { icon: Music,     label: 'TikTok',    handle: SITE_CONFIG.tiktok,    url: `https://tiktok.com/@highestbigsizeofficial` },
  ];

  return (
    <div className="min-h-screen bg-white text-black pb-24">

      {/* ── Header ── */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-8 pt-12 pb-12 border-b border-black/8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[9px] tracking-[0.4em] uppercase text-gray-300 mb-4 font-medium">
            Highest World — Contact
          </p>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-none">
            Let's Talk
          </h1>
        </motion.div>
      </div>

      {/* ── Main grid ── */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-8 grid lg:grid-cols-5 gap-16 py-16">

        {/* ── LEFT: Form (3/5) ── */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[9px] tracking-[0.35em] uppercase text-gray-300 mb-8 font-semibold">
            Send a Message
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <input
                {...register('name')}
                placeholder="Nama Lengkap"
                className={inputClass}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1 tracking-wide">{errors.name.message}</p>}
            </div>
            <div>
              <input
                {...register('email')}
                type="email"
                placeholder="Email"
                className={inputClass}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1 tracking-wide">{errors.email.message}</p>}
            </div>
            <div>
              <input
                {...register('phone')}
                placeholder="Nomor WhatsApp"
                className={inputClass}
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1 tracking-wide">{errors.phone.message}</p>}
            </div>
            <div>
              <textarea
                {...register('message')}
                placeholder="Pesan Anda..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
              {errors.message && <p className="text-red-400 text-xs mt-1 tracking-wide">{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase font-bold bg-black text-white px-8 py-4 hover:bg-gray-900 transition-colors group"
            >
              Kirim via WhatsApp
              <Send className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </form>
        </motion.div>

        {/* ── RIGHT: Info (2/5) ── */}
        <motion.div
          className="lg:col-span-2 space-y-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Contact info */}
          <div>
            <p className="text-[9px] tracking-[0.35em] uppercase text-gray-300 mb-6 font-semibold">
              Contact Info
            </p>
            <div className="space-y-6">
              {[
                {
                  icon: MessageCircle,
                  label: 'WhatsApp',
                  value: `+${SITE_CONFIG.phone}`,
                  href: generateGeneralWAMessage(),
                },
                {
                  icon: Mail,
                  label: 'Email',
                  value: SITE_CONFIG.email,
                  href: `mailto:${SITE_CONFIG.email}`,
                },
                {
                  icon: Clock,
                  label: 'Jam Operasional',
                  value: `Sen–Jum ${SITE_CONFIG.operationalHours.weekdays}\nSab–Min ${SITE_CONFIG.operationalHours.weekend}`,
                  href: null,
                },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-8 h-8 border border-black/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.3em] uppercase text-gray-300 mb-1 font-semibold">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-black transition-colors whitespace-pre-line"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-600 whitespace-pre-line">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Socials */}
          <div>
            <p className="text-[9px] tracking-[0.35em] uppercase text-gray-300 mb-6 font-semibold">
              Follow Us
            </p>
            <div className="space-y-3">
              {socials.map(({ icon: Icon, label, handle, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between border border-black/8 px-4 py-3 hover:border-black transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                    <div>
                      <p className="text-[10px] tracking-widest uppercase font-bold text-black">{label}</p>
                      <p className="text-[10px] text-gray-400 tracking-wide">{handle}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-black transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick WA CTA */}
          <a
            href={generateGeneralWAMessage()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full border border-black/8 px-5 py-4 hover:border-black hover:bg-black hover:text-white transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4" />
              <span className="text-[11px] tracking-[0.2em] uppercase font-bold">Chat Langsung</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          {/* Maps */}
          
        </motion.div>
      </div>
      <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-16 border-t border-black/8">
            <p className="text-[9px] tracking-[0.35em] uppercase text-gray-300 mb-4 font-semibold flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Lokasi Toko
            </p>
            <div className="overflow-hidden border border-black/8 h-180">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.523469764618!2d110.4003815!3d-7.1042166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7088e767bb481b%3A0x5c07527a968091ed!2sHighest%20World!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(30%)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Highest World"
              />
            </div>
            <a
              href="https://www.google.com/maps/place/Highest+World/@-7.1042166,110.4003815,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] tracking-widest uppercase text-gray-400 hover:text-black transition-colors mt-2"
            >
              Buka di Google Maps <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
    </div>
  );
};