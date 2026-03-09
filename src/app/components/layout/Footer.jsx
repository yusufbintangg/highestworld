import React from 'react';
import { Link } from 'react-router';
import { Instagram, MessageCircle, ShoppingBag, Music } from 'lucide-react';
import { Separator } from '../ui/separator';
import { SITE_CONFIG } from '../../../lib/config';
import { categories } from '../../../data/categories';
import { generateGeneralWAMessage } from '../../../lib/utils';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: `https://instagram.com/${SITE_CONFIG.instagram.replace('@', '')}` },
    { name: 'TikTok', icon: Music, url: `https://tiktok.com/${SITE_CONFIG.tiktok.replace('@', '')}` },
    { name: 'WhatsApp', icon: MessageCircle, url: generateGeneralWAMessage() },
    { name: 'Shopee', icon: ShoppingBag, url: `https://shopee.co.id/${SITE_CONFIG.shopee}` },
  ];

  const quickLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Produk', path: '/produk' },
    { name: 'Tentang Kami', path: '/tentang' },
    { name: 'Kontak', path: '/kontak' },
    { name: 'Konfirmasi Pembayaran', path: '/konfirmasi-pembayaran' },
  ];

  return (
    <footer className="bg-card border-t border-border-accent mt-20">
      <Separator className="bg-accent-gold h-[1px]" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <h3 className="font-display text-2xl tracking-[0.15em] text-accent-gold mb-3">
              HIGHEST WORLD
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {SITE_CONFIG.description}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-border hover:border-accent-gold hover:bg-accent-gold/10 flex items-center justify-center transition-all group"
                  >
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-accent-gold transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-subheading text-lg uppercase tracking-wider mb-4">
              Navigasi
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-accent-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-subheading text-lg uppercase tracking-wider mb-4">
              Kategori
            </h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/koleksi/${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-accent-gold transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-subheading text-lg uppercase tracking-wider mb-4">
              Info Toko
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="block text-foreground font-medium mb-1">Email</span>
                <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-accent-gold transition-colors">
                  {SITE_CONFIG.email}
                </a>
              </li>
              <li>
                <span className="block text-foreground font-medium mb-1">WhatsApp</span>
                <a href={generateGeneralWAMessage()} className="hover:text-accent-gold transition-colors">
                  +{SITE_CONFIG.phone}
                </a>
              </li>
              <li>
                <span className="block text-foreground font-medium mb-1">Jam Operasional</span>
                <p>Senin - Jumat: {SITE_CONFIG.operationalHours.weekdays}</p>
                <p>Sabtu - Minggu: {SITE_CONFIG.operationalHours.weekend}</p>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>
            © {currentYear} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p className="font-subheading uppercase tracking-wider">
            <span className="text-accent-gold">Big Size.</span> Real Style.
          </p>
        </div>
      </div>
    </footer>
  );
};
