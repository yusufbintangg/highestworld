import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { SITE_CONFIG } from '../../lib/config';
import { generateGeneralWAMessage } from '../../lib/utils';

export const AboutPage = () => {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="font-display text-5xl md:text-7xl tracking-[0.1em] mb-6">
            THE STORY OF <br />
            <span className="gold-shimmer">HIGHEST WORLD</span>
          </h1>
          <div className="w-24 h-1 bg-accent-gold mx-auto"></div>
        </motion.div>

        {/* Story */}
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-none"
          >
            <p className="text-muted-foreground text-lg leading-relaxed">
              Highest World lahir dari keyakinan sederhana namun kuat: setiap pria, terlepas dari ukuran tubuhnya, 
              berhak tampil stylish, percaya diri, dan merasa eksklusif. Kami memahami bahwa menemukan pakaian 
              berkualitas dalam ukuran bigsize bukan hanya tentang ukuran — ini tentang kepercayaan diri, 
              kenyamanan, dan ekspresi diri.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mt-6">
              Dengan pengalaman bertahun-tahun di industri fashion, kami menghadirkan koleksi pakaian bigsize 
              (2XL-8XL) yang tidak hanya pas di badan, tetapi juga di hati. Setiap produk kami dipilih dengan 
              teliti, menggunakan material premium dan desain yang mengikuti tren fashion terkini.
            </p>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl tracking-[0.1em] text-center mb-12">
              NILAI KAMI
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Inklusivitas',
                  description: 'Fashion adalah hak semua orang. Kami menyediakan ukuran lengkap 2XL hingga 8XL tanpa kompromi pada gaya.'
                },
                {
                  title: 'Kualitas',
                  description: 'Material premium, jahitan rapi, dan quality control ketat. Setiap produk adalah representasi komitmen kami.'
                },
                {
                  title: 'Gaya',
                  description: 'Mengikuti tren terkini dengan desain yang timeless. Stylish bukan tentang ukuran, tapi tentang sikap.'
                }
              ].map((value, index) => (
                <div
                  key={index}
                  className="text-center p-6 border border-border rounded-lg hover:border-accent-gold transition-all"
                >
                  <div className="w-16 h-1 bg-accent-gold mx-auto mb-4"></div>
                  <h3 className="font-subheading text-2xl uppercase tracking-wider mb-3 text-accent-gold">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quote */}
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-12 px-8 border-y-2 border-accent-gold"
          >
            <p className="font-display text-2xl md:text-3xl tracking-wide text-foreground mb-4">
              "BIG SIZE BUKAN PENGHALANG UNTUK TAMPIL STYLISH DAN PERCAYA DIRI"
            </p>
            <cite className="text-sm text-muted-foreground font-subheading uppercase tracking-wider">
              — Founder, Highest World
            </cite>
          </motion.blockquote>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-6"
          >
            <h2 className="font-display text-3xl md:text-4xl tracking-[0.1em]">
              MULAI PERJALANAN GAYA ANDA
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="border-2 border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-accent-gold font-subheading uppercase">
                <a href={generateGeneralWAMessage()}>CHAT WHATSAPP</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-accent-gold font-subheading uppercase">
                <a href="/produk">LIHAT PRODUK</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
