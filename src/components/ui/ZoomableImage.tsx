'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
  triggerClassName?: string;
  /** Tooltip do gatilho (ex.: "Clique para visualizar a imagem"). */
  triggerTitle?: string;
  children?: React.ReactNode;
}

/**
 * Imagem que abre em um lightbox (popup) ao ser clicada.
 * Fecha com Escape, clique no backdrop ou no botão de fechar.
 * Aceita um gatilho customizado via `children`.
 */
export function ZoomableImage({
  src,
  alt,
  className,
  triggerClassName,
  triggerTitle,
  children,
}: ZoomableImageProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'cursor-zoom-in',
          !children && 'block w-full',
          triggerClassName,
        )}
        aria-label={`Ampliar imagem: ${alt}`}
        title={triggerTitle ?? `Ampliar imagem: ${alt}`}
      >
        {children ?? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className={className} />
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2600] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/40"
            aria-label="Fechar imagem"
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
