import React from 'react';
import { cn } from '../../../lib/utils';

export const SizeSelector = ({ sizes, availableSizes, selectedSize, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const isAvailable = availableSizes.includes(size);
        const isSelected = selectedSize === size;

        return (
          <button
            key={size}
            onClick={() => isAvailable && onSelect(size)}
            disabled={!isAvailable}
            className={cn(
              'px-4 py-2 min-w-[60px] border-2 rounded-lg font-subheading font-semibold transition-all',
              isSelected
                ? 'bg-accent-gold border-accent-gold text-muted-foreground'
                : isAvailable
                ? 'border-border hover:border-accent-gold text-foreground'
                : 'border-border opacity-40 cursor-not-allowed text-muted-foreground',
              !isAvailable && 'relative'
            )}
          >
            {size}
            {!isAvailable && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-[2px] bg-destructive/60 rotate-45" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
