import React from 'react';
import { Link } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatPrice, calculateDiscount } from '../../../lib/utils';

export const ProductCard = ({ product }) => {
  const discount = calculateDiscount(product.original_price, product.price);
  const badges = product.badges || [];
  const images = product.images || [];

  return (
    <Link to={`/produk/${product.slug}`} className="group">
      <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-accent-gold/50">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {images[0] ? (
            <img
              src={images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
              No Image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {badges.includes('New') && (
              <Badge className="bg-accent-gold text-background font-subheading uppercase">
                NEW
              </Badge>
            )}
            {badges.includes('Best Seller') && (
              <Badge className="bg-destructive text-white font-subheading uppercase">
                BEST SELLER
              </Badge>
            )}
            {badges.includes('Sale') && discount > 0 && (
              <Badge className="bg-accent-red text-white font-subheading uppercase">
                SALE -{discount}%
              </Badge>
            )}
          </div>

          {/* Hover Button */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button className="w-full bg-accent-gold hover:bg-accent-gold-light text-background font-subheading uppercase">
              LIHAT DETAIL
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-body font-medium text-foreground mb-2 line-clamp-2 group-hover:text-accent-gold transition-colors">
            {product.name}
          </h3>

          {/* Category */}
          {product.categories?.name && (
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
              {product.categories.name}
            </p>
          )}

          {/* Price */}
          <div className="flex flex-col md:flex-row md:items-baseline gap-0.5 md:gap-2">
            <span className="font-mono text-lg font-bold text-accent-gold">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="font-mono text-sm text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};