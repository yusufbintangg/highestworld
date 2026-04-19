import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { SHIPPING_INFO } from '../../../../lib/config';

export const ProductMeta = ({ product }) => {
  return (
    <div>
      {/* Description */}
      {product.description && (
        <p className="text-[11px] text-gray-600 leading-relaxed mb-5 whitespace-pre-line">
          {product.description}
          <span className="block mt-2 text-gray-400">Berat: {product.weight}g</span>
        </p>
      )}

      {/* Size Chart Image — langsung tampil kalau ada */}
      {product.size_chart_image && (
        <img
          src={product.size_chart_image}
          alt="Size Chart"
          className="w-full object-contain mb-5"
        />
      )}

      <div className="border-t border-gray-200 mb-4" />

      {/* Shipping Accordion */}
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="shipping" className="border-b border-gray-200">
          <AccordionTrigger className="text-[10px] tracking-[0.2em] uppercase py-3 hover:no-underline font-medium text-gray-700">
            Pengiriman
          </AccordionTrigger>
          <AccordionContent className="text-[11px] text-gray-500 leading-relaxed pb-4 space-y-1">
            <p>Estimasi: {SHIPPING_INFO.estimatedDays}</p>
            <p>Kurir: {SHIPPING_INFO.couriers.join(', ')}</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
