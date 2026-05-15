import { ProductCard } from './ProductCard';

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
    // divide-x divide-y = garis abu tipis antar card, tanpa bg abu di belakang
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[1px] bg-gray-200">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};