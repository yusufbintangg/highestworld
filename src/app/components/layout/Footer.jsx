import React from 'react';
import { Link } from 'react-router';
import { Instagram, MessageCircle, ShoppingBag, Music, ArrowUpRight } from 'lucide-react';
import { SITE_CONFIG } from '../../../lib/config';
import { generateGeneralWAMessage } from '../../../lib/utils';
import { supabase } from '../../../lib/supabase';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name')
      .limit(5)
      .then(({ data }) => { if (data) setCategories(data); });
  }, []);

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: `https://instagram.com/${SITE_CONFIG.instagram.replace('@', '')}` },
    { name: 'TikTok',    icon: Music,         url: `https://tiktok.com/@highestbigsizeofficial` },
    { name: 'WhatsApp',  icon: MessageCircle, url: generateGeneralWAMessage() },
    { name: 'Shopee',    icon: ShoppingBag,   url: `https://shopee.co.id/${SITE_CONFIG.shopee}` },
  ];

  const quickLinks = [
    { name: 'Shop',     path: '/produk' },
    { name: 'Look',     path: '/tentang' },
    { name: 'Dealers',  path: '/kontak' },
  //{ name: 'Konfirmasi Pembayaran', path: '/konfirmasi-pembayaran' },
  ];

  return (
    <footer className="bg-black text-white mt-24">

      {/* ── Big tagline banner ── */}
      <div className="border-b border-white/10 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-14 lg:py-20 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-white/30 mb-3 font-medium">Est. Jakarta, Indonesia</p>
            <div className="flex items-center gap-6 lg:gap-10">
            <img
              src="/favicon.png"
              alt="Highest World"
              className="h-16 lg:h-28 w-auto opacity-80"
            />
            <h2 className="text-5xl lg:text-8xl font-black tracking-tighter uppercase leading-none text-white">
              Highest<br />
              <span className="text-white/20">World</span>
            </h2>
          </div>
          </div>
          <div className="lg:text-right max-w-xs">
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              {SITE_CONFIG.description}
            </p>
            <a
              href={generateGeneralWAMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase font-bold border border-white/20 px-5 py-3 hover:bg-white hover:text-black transition-all duration-300 group"
            >
              Hubungi Kami
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-14 grid grid-cols-2 lg:grid-cols-4 gap-10 border-b border-white/10">

        {/* Quick Links */}
        <div>
          <p className="text-[9px] tracking-[0.35em] uppercase text-white/30 mb-5 font-semibold">Menu</p>
          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="group flex items-center gap-1.5 text-[12px] tracking-[0.12em] uppercase font-medium text-white/50 hover:text-white transition-colors duration-200"
                >
                  <span className="w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-3" />
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <p className="text-[9px] tracking-[0.35em] uppercase text-white/30 mb-5 font-semibold">Kategori</p>
          <ul className="space-y-3">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/produk?category=${cat.slug}`}
                  className="group flex items-center gap-1.5 text-[12px] tracking-[0.12em] uppercase font-medium text-white/50 hover:text-white transition-colors duration-200"
                >
                  <span className="w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-3" />
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-[9px] tracking-[0.35em] uppercase text-white/30 mb-5 font-semibold">Kontak</p>
          <ul className="space-y-4">
            <li>
              <p className="text-[9px] tracking-widest uppercase text-white/20 mb-1">Email</p>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="text-[12px] tracking-wide text-white/60 hover:text-white transition-colors duration-200"
              >
                {SITE_CONFIG.email}
              </a>
            </li>
            <li>
              <p className="text-[9px] tracking-widest uppercase text-white/20 mb-1">WhatsApp</p>
              <a
                href={generateGeneralWAMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] tracking-wide text-white/60 hover:text-white transition-colors duration-200"
              >
                +{SITE_CONFIG.phone}
              </a>
            </li>
            <li>
              <p className="text-[9px] tracking-widest uppercase text-white/20 mb-1">Jam Operasional</p>
              <p className="text-[12px] text-white/60 leading-relaxed">
                Sen–Jum: {SITE_CONFIG.operationalHours.weekdays}<br />
                Sab–Min: {SITE_CONFIG.operationalHours.weekend}
              </p>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <p className="text-[9px] tracking-[0.35em] uppercase text-white/30 mb-5 font-semibold">Follow Us</p>
          <div className="space-y-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-[12px] tracking-[0.12em] uppercase font-medium text-white/50 hover:text-white transition-colors duration-200"
                >
                  <span className="flex items-center justify-center w-7 h-7 border border-white/10 group-hover:border-white/40 transition-colors duration-200">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  {social.name}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[10px] tracking-[0.2em] uppercase text-white/20">
          © {currentYear} {SITE_CONFIG.name}. All rights reserved.
        </p>
        <p className="text-[10px] tracking-[0.25em] uppercase font-bold text-white/20">
          Big Size. <span className="text-white/40">Real Style.</span>
        </p>
      </div>

    </footer>
  );
};