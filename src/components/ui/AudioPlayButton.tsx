'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayButtonProps {
  src: string;
  className?: string;
  ariaLabel?: string;
  /** Tooltip exibido ao passar o mouse (por padrão, o mesmo texto do aria-label). */
  title?: string;
}

/** Botão compacto de reprodução/pausa de um áudio, usado em tabelas e listas. */
export function AudioPlayButton({
  src,
  className,
  ariaLabel = 'Reproduzir áudio',
  title,
}: AudioPlayButtonProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(false);
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pausar áudio' : ariaLabel}
        title={
          title ?? (playing ? 'Pausar áudio' : 'Clique aqui para ouvir o áudio do relato')
        }
        className={cn(
          'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sand bg-paper text-clay transition-colors hover:bg-paper2',
          className,
        )}
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </>
  );
}
