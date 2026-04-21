import { ProductCard } from './ProductCard';

/**
 * ProductGrid — Neighborhood style
 * 6 kolom di desktop, 2 di mobile, 3 di tablet
 * Gap minimal (2px) kayak referensi
 */
export const ProductGrid = ({ products = [] }) => {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-[11px] tracking-widest uppercase text-gray-400">
          No products found
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 gap-1">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );

};