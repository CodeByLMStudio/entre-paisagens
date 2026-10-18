'use client';

interface MapCompassProps {
  onReset: () => void;
}

export function MapCompass({ onReset }: MapCompassProps) {
  return (
    <div className="absolute left-4 top-4 z-[1000] flex flex-col items-center">
      <button
        type="button"
        onClick={onReset}
        title="Bússola - Norte para cima. Clique para recentralizar"
        className="group relative flex h-12 w-12 flex-col items-center justify-center rounded-xl border border-sand bg-white/95 text-ink shadow-md backdrop-blur-md transition-all hover:bg-paper active:scale-95"
      >
        <span className="mb-0.5 text-[10px] font-black leading-none tracking-tighter text-clay">
          N
        </span>
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
          aria-hidden="true"
        >
          {/* Ponteiro norte (vermelho) apontando para cima. */}
          <path d="M12 2.5 16.5 14 12 11.4 7.5 14 12 2.5Z" fill="#A36437" />
          {/* Ponteiro sul (neutro). */}
          <path d="M12 21.5 7.5 10 12 12.6 16.5 10 12 21.5Z" fill="#D9CBB9" />
        </svg>
      </button>
    </div>
  );
}
