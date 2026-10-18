'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showClose?: boolean;
  /** Quando falso, o conteúdo controla a própria rolagem (ex.: rodapé fixo). */
  scrollable?: boolean;
  bodyClassName?: string;
}

/**
 * Modal base acessível: fecha com Escape, bloqueia o scroll do body,
 * foca o painel ao abrir e ignora cliques no overlay quando disparados
 * de dentro do conteúdo.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  showClose = true,
  scrollable = true,
  bodyClassName,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Mantém a referência mais recente de `onClose` sem re-executar o efeito.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    // Impede que um drawer por baixo também reaja à tecla Escape.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopImmediatePropagation();
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Foco inicial no painel — apenas na abertura (quando `open` transita para
    // true), jamais a cada re-render do conteúdo.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          'flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl border-2 border-sand bg-paper shadow-2xl outline-none',
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {title && (
          <header className="flex shrink-0 items-center justify-between border-b border-sand bg-paper2 px-4 py-3">
            <div id={titleId} className="type-label text-sm text-ink">
              {title}
            </div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-ink transition-colors hover:bg-sand/50"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            )}
          </header>
        )}
        {scrollable ? (
          <div className={cn('flex-1 overflow-y-auto', bodyClassName)}>{children}</div>
        ) : (
          <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden', bodyClassName)}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
