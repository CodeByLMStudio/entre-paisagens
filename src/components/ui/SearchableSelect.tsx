'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Pilha de selects abertos (somente um pode ficar aberto por vez). */
const openSelects = new Set<() => void>();

interface SearchableSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  /** Opções exibidas (já filtradas pelo contexto, ex.: cidades do estado). */
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  /** Permite confirmar um texto livre quando a opção não está na lista. */
  allowCustomValue?: boolean;
  /** Formata o rótulo de cada opção na lista (ex.: ocultar o nome do estado). */
  formatOption?: (option: string) => string;
  /** Limite de itens renderizados por vez. */
  maxResults?: number;
  className?: string;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Remove o prefixo do estado ("Ceará - Fortaleza" → "Fortaleza"). */
function stripStatePrefix(option: string): string {
  const index = option.indexOf(' - ');
  return index < 0 ? option : option.slice(index + 3);
}

/**
 * Select com campo de busca. A lista abra em painel flutuante (portal +
 * `position: fixed`), sem empurrar o resto do formulário nem criar scroll
 * lateral; abre para cima quando não há espaço abaixo.
 */
export function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhuma opção encontrada.',
  disabled = false,
  allowCustomValue = false,
  formatOption,
  maxResults = 60,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const triggerId = id ?? `searchable-${generatedId}`;
  const listboxId = `${triggerId}-listbox`;

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setShowAll(false);
    openSelects.delete(close);
  }, []);

  // Fecha ao clicar fora (campo ou painel).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        close();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [open, close]);

  useEffect(() => {
    openSelects.add(close);
    return () => {
      openSelects.delete(close);
    };
  }, [close]);

  // Posiciona o painel: abaixo quando há espaço; acima quando necessário.
  const updateMenuPosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      close();
      return;
    }

    const gap = 4;
    const viewportPadding = 12;
    const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
    const spaceAbove = rect.top - gap - viewportPadding;
    const openUp = spaceBelow < 260 && spaceAbove > spaceBelow;
    const available = openUp ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(180, Math.min(340, available));
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      Math.max(viewportPadding, window.innerWidth - rect.width - viewportPadding),
    );

    setMenuStyle({
      position: 'fixed',
      left,
      width: rect.width,
      maxHeight,
      zIndex: 3000,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    });
  }, [close]);

  useEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }

    updateMenuPosition();
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [open, updateMenuPosition]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return options;
    return options.filter(
      (option) =>
        normalize(option).includes(q) || normalize(stripStatePrefix(option)).includes(q),
    );
  }, [options, query]);

  const visible = useMemo(() => {
    const list = showAll ? filtered : filtered.slice(0, maxResults);

    // Mantém a opção selecionada visível mesmo quando fora do recorte.
    if (value && !list.includes(value)) {
      const selected = filtered.find((option) => option === value);
      if (selected) return [selected, ...list];
    }
    return list;
  }, [filtered, showAll, maxResults, value]);
  const hidden = filtered.length - (showAll ? filtered.length : Math.min(filtered.length, maxResults));

  const toggle = () => {
    if (disabled) return;
    if (open) {
      close();
      return;
    }
    for (const closeOther of [...openSelects]) closeOther();
    setQuery('');
    setShowAll(false);
    setOpen(true);
  };

  const selectOption = (option: string) => {
    onChange(option);
    close();
  };

  const renderLabel = (option: string) => (formatOption ? formatOption(option) : option);

  const menu =
    open && menuStyle && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="flex flex-col overflow-hidden rounded-xl border-2 border-sand bg-white shadow-lg"
          >
            <div className="shrink-0 border-b border-paper2 p-2">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowAll(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    const first = visible[0];
                    if (first) selectOption(first);
                  } else if (event.key === 'Escape') {
                    close();
                  }
                }}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-sand bg-paper px-3 py-2 text-sm text-ink focus:border-clay focus:outline-none"
              />
            </div>

            <ul
              id={listboxId}
              role="listbox"
              aria-labelledby={triggerId}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              {visible.length > 0 ? (
                visible.map((option) => (
                  <li
                    key={option}
                    role="option"
                    aria-selected={option === value}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectOption(option);
                    }}
                    className={cn(
                      'cursor-pointer px-3.5 py-2.5 text-sm text-ink transition-colors hover:bg-paper2',
                      option === value && 'font-bold text-clay',
                    )}
                  >
                    {renderLabel(option)}
                  </li>
                ))
              ) : (
                <li className="px-3.5 py-3 text-xs text-inkMuted">{emptyMessage}</li>
              )}

              {allowCustomValue && query.trim().length >= 2 && (
                <li className="border-t border-paper2">
                  <button
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectOption(query.trim());
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-clay transition-colors hover:bg-paper2"
                  >
                    Usar &ldquo;{query.trim()}&rdquo;
                  </button>
                </li>
              )}

              {hidden > 0 && (
                <li className="border-t border-paper2 p-2">
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="w-full rounded-lg bg-paper2 px-3 py-2 text-[11px] font-bold text-ink transition-colors hover:bg-sand/60"
                  >
                    Mostrar mais {hidden} opções
                  </button>
                </li>
              )}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={cn('flex flex-col gap-1.5', className)} ref={rootRef}>
      <button
        ref={buttonRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
            event.preventDefault();
            if (!open) toggle();
          } else if (event.key === 'Escape') {
            close();
          }
        }}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl border-2 border-sand bg-white px-3.5 py-3 text-left text-sm text-ink transition-colors focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span className={cn('truncate', !value && 'text-inkMuted/60')}>
          {value ? renderLabel(value) : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 text-inkMuted transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {menu}
    </div>
  );
}
