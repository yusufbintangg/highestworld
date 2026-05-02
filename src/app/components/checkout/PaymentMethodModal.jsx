import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const PAYMENT_METHODS = [
  {
    id: 'qris',
    label: 'QRIS',
    coreApi: true,
    enabledPayments: ['other_qris'],
    logo: (
      <img
        src="https://res.cloudinary.com/dopr9tvnv/image/upload/v1776859990/695e3a709eccbe055c311aac6b25729d_canx9h.jpg"
        alt="QRIS"
        className="h-8 w-auto"
      />
    ),
  },
  {
    id: 'va',
    label: 'Virtual Account',
    coreApi: true,
    enabledPayments: ['bca_va', 'bni_va', 'bri_va', 'permata_va', 'other_va'],
    logo: (
      <span className="text-gray-700 font-bold text-sm tracking-wide">Virtual Account</span>
    ),
  },
];

export const VA_BANKS = [
  { id: 'mandiri', label: 'Mandiri', note: 'Hanya menerima dari Mandiri',
    logo: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1777711468/i7e1nwbzexqfjaqdlelt.png' },
  { id: 'bri',     label: 'BRI',     note: 'Hanya menerima dari BRI',
    logo: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1777711447/0f7fdf08-32f9-4266-bd89-89f6a8b1c416.png' },
  { id: 'bni',     label: 'BNI',     note: 'Menerima dari semua bank',
    logo: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1777710112/Bank_Negara_Indonesia_logo__2004.svg_d7jlic.png' },
  { id: 'permata', label: 'Permata', note: 'Menerima dari semua bank',
    logo: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1777711488/pkqlpxcmdpaj49acarxf.png' },
];
/**
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {function} props.onClose
 * @param {object}   props.selected       – method object saat ini
 * @param {string}   props.selectedBank   – bank id saat ini (kalau VA)
 * @param {function} props.onSelect       – (method, bank | null) => void
 */
export const PaymentMethodModal = ({ open, onClose, selected, selectedBank: initialBank, onSelect }) => {
  const [localSelected, setLocalSelected] = useState(selected?.id || null);
  const [localBank, setLocalBank]         = useState(initialBank || null);
  const [vaExpanded, setVaExpanded]       = useState(selected?.id === 'va');

  const handleSelectMethod = (methodId) => {
    setLocalSelected(methodId);
    if (methodId === 'va') {
      setVaExpanded(true);
    } else {
      setVaExpanded(false);
      setLocalBank(null);
    }
  };

  const handleConfirm = () => {
    const method = PAYMENT_METHODS.find((m) => m.id === localSelected);
    if (!method) return;
    if (method.id === 'va' && !localBank) return; // wajib pilih bank
    onSelect(method, localBank || null);
    onClose();
  };

  const confirmDisabled = !localSelected || (localSelected === 'va' && !localBank);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 inset-x-4 top-1/2 -translate-y-1/2
              md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[420px]
              bg-white rounded-2xl shadow-2xl overflow-hidden"
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

            {/* Scroll area */}
            <div className="p-4 space-y-2 max-h-[65vh] overflow-y-auto">

              {/* QRIS — featured full-width */}
              {PAYMENT_METHODS.filter((m) => m.id === 'qris').map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleSelectMethod(method.id)}
                  className={`w-full flex items-center justify-center px-4 py-3.5 rounded-xl border-2 transition-all duration-150 ${
                    localSelected === method.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {method.logo}
                </button>
              ))}

              {/* Separator */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] tracking-widest uppercase text-gray-300 font-medium">
                  Metode Lainnya
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Grid: OVO, Alfamart, Akulaku, CC */}
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.filter((m) => m.id !== 'qris' && m.id !== 'va').map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleSelectMethod(method.id)}
                    className={`flex flex-col items-center justify-center px-3 py-4 rounded-xl border-2 transition-all duration-150 gap-1.5 ${
                      localSelected === method.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="h-8 flex items-center">{method.logo}</div>
                  </button>
                ))}
              </div>

              {/* Virtual Account — full width + collapsible bank list */}
              <div
                className="rounded-xl border-2 overflow-hidden transition-colors duration-150"
                style={{ borderColor: localSelected === 'va' ? '#000' : '#e5e7eb' }}
              >
                {/* VA header row */}
                <button
                  onClick={() => {
                    if (localSelected === 'va') {
                      setVaExpanded((prev) => !prev);
                    } else {
                      handleSelectMethod('va');
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 transition-colors ${
                    localSelected === 'va' ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-gray-700 font-bold text-sm tracking-wide">Virtual Account</span>
                  {vaExpanded
                    ? <ChevronUp className="w-4 h-4 text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />
                  }
                </button>

                {/* Bank list */}
                <AnimatePresence initial={false}>
                  {vaExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-gray-100"
                    >
                      <div className="p-2 space-y-1">
                        {VA_BANKS.map((bank) => {
                          const isActive = localBank === bank.id && localSelected === 'va';
                          return (
                            <button
                              key={bank.id}
                              onClick={() => {
                                setLocalBank(bank.id);
                                setLocalSelected('va');
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 ${
                                isActive
                                  ? 'bg-black text-white'
                                  : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <img src={bank.logo} alt={bank.label} className="h-10 w-24 object-contain" />
                                <span className={`text-[11px] ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                                  {bank.note}
                                </span>
                              </div>
                              {isActive && (
                                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                  <div className="w-2 h-2 rounded-full bg-black" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-5 pt-2">
              <button
                onClick={handleConfirm}
                disabled={confirmDisabled}
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