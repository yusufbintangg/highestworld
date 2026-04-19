import { CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../../../lib/utils';

export const CourierCard = ({ rate, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`px-4 py-3 border-b last:border-b-0 cursor-pointer transition-all flex items-center justify-between gap-3 hover:bg-gray-50 ${selected ? 'bg-gray-50' : ''}`}
  >
    <div className="flex items-center gap-3 min-w-0">
      {selected
        ? <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
        : <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
      }
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{rate.courier_name}</p>
        <p className="text-xs text-gray-500">{rate.courier_service_name} • Est. {rate.duration}</p>
      </div>
    </div>
    <p className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(rate.price)}</p>
  </div>
);
