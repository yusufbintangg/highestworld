import { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../../ui/carousel';

export const ProductImages = ({ images, productName, badges, discount, isMobile, onShare }) => {
  const [carouselApi, setCarouselApi] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomedIndex, setZoomedIndex] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!carouselApi) return;
    const handleSelect = () => setSelectedImage(carouselApi.selectedScrollSnap());
    carouselApi.on('select', handleSelect);
    return () => carouselApi.off('select', handleSelect);
  }, [carouselApi]);

  const handleShare = () => {
    onShare();
  };

  if (isMobile) {
    return (
      <div className="w-screen relative left-[calc(-50vw+50%)] space-y-2">
        <div className="relative aspect-square overflow-hidden">
          <Carousel
            className="w-full h-full"
            opts={{ loop: false, dragFree: false, align: 'center' }}
            setApi={setCarouselApi}
          >
            <CarouselContent className="h-full">
              {images.map((img, i) => (
                <CarouselItem key={i} className="basis-full">
                  <div className="relative w-full aspect-square">
                    <img
                      src={img}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                      {badges.includes('New') && (
                        <span className="bg-black text-white text-[9px] tracking-widest px-1.5 py-0.5 uppercase">New</span>
                      )}
                      {badges.includes('Best Seller') && (
                        <span className="bg-red-600 text-white text-[9px] tracking-widest px-1.5 py-0.5 uppercase">Best</span>
                      )}
                      {badges.includes('Sale') && discount > 0 && (
                        <span className="bg-gray-800 text-white text-[9px] tracking-widest px-1.5 py-0.5 uppercase">-{discount}%</span>
                      )}
                    </div>
                    <button
                      onClick={handleShare}
                      className="absolute top-3 right-3 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white z-10"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full opacity-80 hover:opacity-100 z-20" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full opacity-80 hover:opacity-100 z-20" />
          </Carousel>
        </div>
        {/* Counter - dalam container normal */}
        <div className="px-4 flex gap-1 pb-1 justify-center">
          <span className="text-[11px] font-mono text-gray-500">
            {selectedImage + 1} / {images.length}
          </span>
        </div>
      </div>
    );
  }

  // Desktop: vertical stack with zoom on cursor
  return (
    <div className="flex-1 space-y-[3px]">
      {images.map((img, i) => (
        <div
          key={i}
          className="relative overflow-hidden bg-gray-50"
          style={{ cursor: zoomedIndex === i ? 'zoom-out' : 'zoom-in' }}
          onClick={() => setZoomedIndex(zoomedIndex === i ? null : i)}
          onMouseMove={(e) => {
            if (zoomedIndex !== i) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setMousePos({ x, y });
          }}
          onMouseLeave={() => setMousePos({ x: 50, y: 50 })}
        >
          <img
            src={img}
            alt={`${productName} ${i + 1}`}
            className="w-full object-cover transition-transform duration-200"
            style={{
              transform: zoomedIndex === i ? 'scale(2)' : 'scale(1)',
              transformOrigin: zoomedIndex === i ? `${mousePos.x}% ${mousePos.y}%` : 'center center',
            }}
          />
          {i === 0 && (
            <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
              {badges.includes('New') && (
                <span className="bg-black text-white text-[9px] tracking-widest px-2 py-1 uppercase">New</span>
              )}
              {badges.includes('Best Seller') && (
                <span className="bg-red-600 text-white text-[9px] tracking-widest px-2 py-1 uppercase">Best Seller</span>
              )}
              {badges.includes('Sale') && discount > 0 && (
                <span className="bg-gray-700 text-white text-[9px] tracking-widest px-2 py-1 uppercase">Sale -{discount}%</span>
              )}
            </div>
          )}
          {i === 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onShare(); }}
              className="absolute top-4 right-4 w-8 h-8 bg-white/90 flex items-center justify-center hover:bg-white transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
