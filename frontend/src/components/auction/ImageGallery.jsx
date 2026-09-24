import React, { useState } from 'react';

const ImageGallery = ({ images = [], productName = 'Luxury Piece' }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const imageList =
    images && images.length > 0
      ? images
      : [
          {
            url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80',
          },
        ];

  const currentImage = imageList[selectedImageIndex]?.url || imageList[0]?.url;

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Dominant Image with Optical Zoom */}
      <div
        className="relative aspect-square w-full rounded-2xl overflow-hidden bg-luxury-surface border border-luxury-border/80 cursor-crosshair group shadow-card-dark"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={currentImage}
          alt={productName}
          loading="lazy"
          className={`w-full h-full object-cover object-center transition-transform duration-200 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }
              : undefined
          }
        />
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-gray-400">
          HOVER TO ZOOM
        </div>
      </div>

      {/* Thumbnails Row */}
      {imageList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {imageList.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImageIndex(idx)}
              className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                selectedImageIndex === idx
                  ? 'border-luxury-gold shadow-luxury-gold'
                  : 'border-luxury-border/60 hover:border-gray-400 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
