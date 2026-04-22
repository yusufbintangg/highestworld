import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import { generateGeneralWAMessage } from '../../lib/utils';

const values = [
  {
    num: '01',
    title: 'Inklusivitas',
    desc: 'Fashion adalah hak semua orang. Kami menyediakan ukuran lengkap 2XL hingga 8XL tanpa kompromi pada gaya.',
  },
  {
    num: '02',
    title: 'Kualitas',
    desc: 'Material premium, jahitan rapi, dan quality control ketat. Setiap produk adalah representasi komitmen kami.',
  },
  {
    num: '03',
    title: 'Gaya',
    desc: 'Mengikuti tren terkini dengan desain yang timeless. Stylish bukan tentang ukuran, tapi tentang sikap.',
  },
];

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white text-black pb-24">

      {/* ── Hero ── */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-12 pb-16 border-b border-black/8"
        >
          <p className="text-[9px] tracking-[0.4em] uppercase text-gray-300 mb-4 font-medium">
            Highest World — Our Story
          </p>
          <h1 className="text-5xl lg:text-[7rem] font-black tracking-tighter uppercase leading-none mb-8">
            Big Size.<br />
            <span className="text-black/15">Real Style.</span>
          </h1>
          <div className="max-w-xl">
            <p className="text-sm lg:text-base text-gray-500 leading-relaxed">
              Highest World lahir dari keyakinan sederhana namun kuat: setiap pria, terlepas dari 
              ukuran tubuhnya, berhak tampil stylish, percaya diri, dan merasa eksklusif.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Story paragraphs ── */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 py-16 border-b border-black/8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[9px] tracking-[0.35em] uppercase text-gray-300 mb-6 font-semibold">
              The Beginning
            </p>
            <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
              Kami memahami bahwa menemukan pakaian berkualitas dalam ukuran bigsize bukan hanya 
              tentang ukuran — ini tentang kepercayaan diri, kenyamanan, dan ekspresi diri. 
              Dengan pengalaman bertahun-tahun di industri fashion, kami hadir untuk mengisi 
              kekosongan itu.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-[9px] tracking-[0.35em] uppercase text-gray-300 mb-6 font-semibold">
              Our Mission
            </p>
            <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
              Setiap produk kami dipilih dengan teliti, menggunakan material premium dan desain 
              yang mengikuti tren fashion terkini. Dari 2XL hingga 8XL — koleksi kami dirancang 
              untuk kenyamanan dan gaya yang tak pernah kompromi.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Values ── */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-16 border-b border-black/8">
        <p className="text-[9px] tracking-[0.4em] uppercase text-gray-300 mb-12 font-semibold">
          Our Values
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-black/8">
          {values.map((v, i) => (
            <motion.div
              key={v.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 lg:p-10"
            >
              <span className="text-[10px] font-bold tracking-[0.3em] text-gray-200 block mb-6">
                {v.num}
              </span>
              <h3 className="text-xl font-black tracking-tight uppercase mb-4">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Quote ── */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-20 border-b border-black/8">
        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-2xl lg:text-5xl font-black tracking-tight uppercase leading-tight text-black max-w-4xl mx-auto mb-8">
            "Big size bukan penghalang untuk tampil stylish dan percaya diri"
          </p>
          <cite className="text-[10px] tracking-[0.3em] uppercase text-gray-300 font-medium not-italic">
            — Founder, Highest World
          </cite>
        </motion.blockquote>
      </div>

      {/* ── CTA ── */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
        >
          <div>
            <p className="text-[9px] tracking-[0.4em] uppercase text-gray-300 mb-3 font-medium">
              Ready to shop?
            </p>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
              Mulai Perjalanan<br />Gaya Anda
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={generateGeneralWAMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-bold bg-black text-white px-7 py-4 hover:bg-gray-900 transition-colors group"
            >
              Chat WhatsApp
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <Link
              to="/products"
              className="flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-bold border border-black px-7 py-4 hover:bg-black hover:text-white transition-all duration-300 group"
            >
              Lihat Produk
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
};