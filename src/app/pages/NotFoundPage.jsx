import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-9xl md:text-[12rem] tracking-[0.1em] text-accent-gold">
          404
        </h1>
        <h2 className="font-display text-3xl md:text-4xl tracking-[0.1em] mb-4">
          LOST IN THE STYLE
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Halaman yang Anda cari tidak ditemukan. Mungkin sudah dipindahkan atau tidak pernah ada.
        </p>
        <Button asChild size="lg" className="bg-accent-gold hover:bg-accent-gold-light text-background font-subheading uppercase">
          <Link to="/">KEMBALI KE BERANDA</Link>
        </Button>
      </div>
    </div>
  );
};
