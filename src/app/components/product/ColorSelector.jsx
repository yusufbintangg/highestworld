import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export const ColorSelector = ({ colors, selectedColor, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => (
        <TooltipProvider key={color.name}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => color.available && onSelect(color.name)}
                disabled={!color.available}
                className={cn(
                  'relative w-10 h-10 rounded-full border-2 transition-all',
                  selectedColor === color.name
                    ? 'border-accent-gold scale-110 shadow-lg'
                    : 'border-border hover:border-accent-gold/50',
                  !color.available && 'opacity-40 cursor-not-allowed'
                )}
                style={{ backgroundColor: color.hex }}
              >
                {selectedColor === color.name && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-accent-gold flex items-center justify-center">
                      <Check className="w-4 h-4 text-background" />
                    </div>
                  </div>
                )}
                
                {!color.available && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-[2px] bg-destructive rotate-45" />
                  </div>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{color.name} {!color.available && '(Habis)'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};
