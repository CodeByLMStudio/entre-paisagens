'use client';

import { Compass } from 'lucide-react';

interface MapCompassProps {
  onReset: () => void;
}

export function MapCompass({ onReset }: MapCompassProps) {
  return (
    <div className="absolute left-4 top-4 z-[1000] flex flex-col items-center">
      <button
        type="button"
        onClick={onReset}
        title="Bússola Cartográfica - Clique para recentralizar"
        className="group relative flex h-12 w-12 flex-col items-center justify-center overflow-hidden rounded-xl border border-sand bg-white/95 text-ink shadow-md backdrop-blur-md transition-all hover:bg-paper active:scale-95"
      >
        <div className="mb-0.5 text-[10px] font-black leading-none tracking-tighter text-clay">
          N
        </div>
        <div className="relative z-10 flex items-center justify-center">
          <Compass
            size={20}
            className="text-clay transition-transform duration-500 group-hover:rotate-45"
          />
        </div>
      </button>
    </div>
  );
}
