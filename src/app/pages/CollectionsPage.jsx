import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabase';

export const CollectionsPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [lightbox, setLightbox]     = useState(null); // index of open image

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        if (data) setCategories(data);
        setLoading(false);
      });
  }, []);

  // Keyboard navigation
  const handleKey = useCallback((e) => {
    if (lightbox === null) return;
    if (e.key === 'Escape')      setLightbox(null);
    if (e.key === 'ArrowRight')  setLightbox(i => Math.min(i + 1, categories.length - 1));
    if (e.key === 'ArrowLeft')   setLightbox(i => Math.max(i - 1, 0));
  }, [lightbox, categories.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Lock scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  const openLightbox  = (i) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const prev = () => setLightbox(i => Math.max(i - 1, 0));
  const next = () => setLightbox(i => Math.min(i + 1, categories.length - 1));

  return (
    <div className="min-h-screen bg-white text-black pb-24">

      {/* ── Page Header ── */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-8 pt-10 pb-8 border-b border-black/8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] tracking-[0.4em] uppercase text-gray-300 mb-2 font-medium">
              Highest World — Look
            </p>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
              The Collection
            </h1>
          </div>
          <p className="hidden lg:block text-[10px] tracking-[0.25em] uppercase text-gray-400 text-right">
            {loading ? '—' : `${categories.length} Items`}<br />
            <span className="text-gray-300">Click to expand</span>
          </p>
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="max-w-[1600px] mx-auto px-5 lg:px-8 pt-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[2px]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto px-5 lg:px-8 pt-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[2px]">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group relative aspect-[3/4] bg-gray-100 overflow-hidden cursor-pointer"
                onClick={() => openLightbox(i)}
              >
                {/* Image */}
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-300 text-xs tracking-widest uppercase">No image</span>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                {/* Number badge */}
                <div className="absolute top-4 left-4">
                  <span className="text-[11px] font-bold tabular-nums text-white/80 tracking-wider">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Name — slides up on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-[11px] tracking-[0.2em] uppercase font-bold text-white">
                    {cat.name}
                  </p>
                </div>

                {/* Expand icon */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-7 h-7 bg-white/90 flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5 text-black" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Shop CTA below grid */}
          <div className="flex items-center justify-between py-8 border-t border-black/8 mt-[2px]">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400">
              {categories.length} Categories Available
            </p>
              <Link
                to="/products"
                className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase font-bold border border-black px-5 py-3 hover:bg-black hover:text-white transition-all duration-300 group"
              >
              Shop All
              <ArrowUpRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox !== null && categories[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-5 text-[10px] tracking-[0.3em] uppercase text-white/40 z-10">
              {String(lightbox + 1).padStart(2, '0')} / {String(categories.length).padStart(2, '0')}
            </div>

            {/* Prev */}
            {lightbox > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 lg:left-8 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-2xl w-full mx-16 lg:mx-24"
              onClick={(e) => e.stopPropagation()}
            >
              {categories[lightbox].image ? (
                <img
                  src={categories[lightbox].image}
                  alt={categories[lightbox].name}
                  className="w-full max-h-[85vh] object-contain"
                />
              ) : (
                <div className="aspect-[3/4] bg-gray-900 flex items-center justify-center">
                  <span className="text-gray-600 text-xs tracking-widest uppercase">No image</span>
                </div>
              )}

              {/* Caption */}
              <div className="flex items-center justify-between mt-4 px-1">
                <div>
                  <p className="text-[11px] tracking-[0.25em] uppercase font-bold text-white">
                    {categories[lightbox].name}
                  </p>
                  {categories[lightbox].description && (
                    <p className="text-[10px] text-white/40 mt-1 tracking-wide">
                      {categories[lightbox].description}
                    </p>
                  )}
                </div>

                <Link
                  to={`/products?category=${categories[lightbox].slug}`}
                  onClick={closeLightbox}
                  className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase font-bold text-white border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all duration-200 shrink-0 ml-4"
                >
                  Shop <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>

            {/* Next */}
            {lightbox < categories.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 lg:right-8 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};