import { CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../../../lib/utils';

export const COURIER_LOGOS = {
  sicepat: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1776880838/copy_of_logo-sicepat-1536x1152_pw8nkw_c72b18.png',
  jnt: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1776860046/Logo_J_T_Merah_Square_pldeu4.jpg',
  jne: 'https://res.cloudinary.com/dopr9tvnv/image/upload/v1776880345/New_Logo_JNE_pdsxka.png',
  jek: 'https://logo.clearbit.com/jnt.co.id'
};

export const CourierCard = ({ rate, selected, onClick }) => {
  const logoSrc = COURIER_LOGOS[rate.courier_code];

  return (
    <div
      onClick={onClick}
      className={`px-2 py-2 border-b last:border-b-0 cursor-pointer transition-all flex items-center justify-between gap-3 hover:bg-gray-50 ${selected ? 'bg-gray-50' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {selected
          ? <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
          : <div className="w-4 h-4 rounded-full border-2 shrink-0" />
        }
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            
            {logoSrc ? (
              
              <img 
                src={logoSrc} 
                alt={rate.courier_name} 
                className="h-12 w-12 object-contain flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : null}
            <p className="text-xs justify-center text-gray-500">{rate.courier_service_name} • Est. {rate.duration}</p>
          </div>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(rate.price)}</p>
    </div>
  );
};
