import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

// Mapping metode ke enabledPayments Midtrans
export const PAYMENT_METHODS = [
  {
    id: 'qris',
    label: 'QRIS',

    enabledPayments: ['other_qris'],
    logo: (
        <img src="https://res.cloudinary.com/dopr9tvnv/image/upload/v1776859990/695e3a709eccbe055c311aac6b25729d_canx9h.jpg" alt="OVO" className="h-8 w-auto" />
    ),
  },
  {
    id: 'ovo',
    label: 'OVO',

    enabledPayments: ['ovo'],
    logo: (
        <img src="https://res.cloudinary.com/dopr9tvnv/image/upload/v1776860057/GKL14_OVO_-_Koleksilogo.com_oun8yg.jpg" alt="OVO" className="h-8 w-auto" />
    ),

  },
  {
    id: 'va',
    label: 'Virtual Account',

    enabledPayments: ['bca_va', 'bni_va', 'bri_va', 'permata_va', 'other_va'],
    logo: (
      <span className="text-gray-700 font-bold text-sm tracking-wide">Virtual Account</span>
    ),
  },
  {
    id: 'alfamart',
    label: 'Alfamart',

    enabledPayments: ['alfamart', 'indomaret'],
    logo: (
        <img src="https://res.cloudinary.com/dopr9tvnv/image/upload/v1776859979/ALFAMART_LOGO_BARU_sx4wj1.png" alt="Alfamart" className="h-8 w-auto" />
    ),
  },
  {
    id: 'akulaku',
    label: 'Akulaku',

    enabledPayments: ['akulaku'],
    logo: (
        <img src="https://res.cloudinary.com/dopr9tvnv/image/upload/v1776877359/_bjGT4LXUDvlKg6ySYU_Q_image_nlwqlk.webp" alt="Akulaku" className="h-16 w-auto" />
    ),
  },
  {
    id: 'cc',
    label: 'Kartu Kredit / Debit',

    enabledPayments: ['credit_card'],
    logo: (
      <span className="text-gray-700 font-bold text-sm tracking-wide">Kartu Kredit/Debit</span>
    ),
  },
];

export const PaymentMethodModal = ({ open, onClose, selected, onSelect }) => {
  const [localSelected, setLocalSelected] = useState(selected?.id || null);

  const handleConfirm = () => {
    const method = PAYMENT_METHODS.find(m => m.id === localSelected);
    if (method) {
      onSelect(method);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 h-full cursor-pointer"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2
             md:-translate-x-1/2 md:w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 tracking-wide">Metode Pembayaran</h3>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options */}
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {/* Featured — QRIS */}
              {PAYMENT_METHODS.filter(m => m.id === 'qris').map(method => (
                <button
                  key={method.id}
                  onClick={() => setLocalSelected(method.id)}
                  className={`w-full flex items-center justify-center px-4 py-3.5 rounded-xl border-2 transition-all duration-150 ${
                    localSelected === method.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-center gap-3">
                    <div className="w-auto flex justify-center">{method.logo}</div>
                  </div>
                  {localSelected === method.id && (
                    <div className="">
                    </div>
                  )}
                </button>
              ))}

              {/* Separator */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] tracking-widest uppercase text-gray-300 font-medium">Metode Lainnya</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Grid options */}
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.filter(m => m.id !== 'qris').map(method => (
                  <button
                    key={method.id}
                    onClick={() => setLocalSelected(method.id)}
                    className={`flex flex-col items-center justify-center px-3 py-4 rounded-xl border-2 transition-all duration-150 gap-1.5 ${
                      localSelected === method.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="h-8 flex items-center">{method.logo}</div>
                    {localSelected === method.id && (
                      <div className="">
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-5 pt-2">
              <button
                onClick={handleConfirm}
                disabled={!localSelected}
                className="w-full py-3.5 bg-black text-white text-xs tracking-[0.2em] uppercase font-bold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Konfirmasi
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};