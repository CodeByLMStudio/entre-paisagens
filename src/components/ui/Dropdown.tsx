'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}

/**
 * Dropdown customizado de seleção única, com lista flutuante e arredondada —
 * mesmo padrão visual do Combobox ("Onde Mora"). Suporta teclado e a11y.
 */
export function Dropdown({
  id,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className,
  buttonClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listboxId = id ? `${id}-listbox` : undefined;

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = query
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
    if (!q) return options;
    return options.filter((option) =>
      option.label
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes(q),
    );
  }, [options, query]);

  /**
   * Posiciona a lista como um painel fixo sobre a página. Assim ela não é
   * cortada pelo container com scroll do formulário e não altera o layout.
   */
  const updateMenuPosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setOpen(false);
      return;
    }

    const gap = 4;
    const viewportPadding = 12;
    const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
    const spaceAbove = rect.top - gap - viewportPadding;
    const openUp = spaceBelow < 240 && spaceAbove > spaceBelow;
    const available = openUp ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(140, Math.min(320, available));
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
  }, []);

  // Mantém o painel alinhado ao campo durante rolagem/redimensionamento.
  useEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }

    updateMenuPosition();
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [open, updateMenuPosition]);

  // Fecha ao clicar fora (considerando também o painel renderizado no portal).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const insideTrigger = rootRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideTrigger && !insideMenu) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [open]);

  // Reseta o realce ao mudar as opções filtradas.
  useEffect(() => {
    setHighlighted(0);
  }, [filtered.length]);

  const selectOption = (option: DropdownOption) => {
    onChange(option.value);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[highlighted];
      if (option) selectOption(option);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setOpen(true);
  };

  return (
    <div className={cn('relative', className)} ref={rootRef}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex w-full items-center justify-between rounded-xl border-2 border-sand bg-white px-3.5 py-3 text-left text-sm text-ink transition-colors focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20',
          buttonClassName,
        )}
      >
        <span className={cn('truncate', !selected && 'text-inkMuted/60')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 text-inkMuted transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open &&
        menuStyle &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="flex flex-col overflow-hidden rounded-xl border-2 border-sand bg-white shadow-lg"
          >
            <div className="shrink-0 border-b border-paper2 p-2">
              <input
                type="text"
                value={query}
                onChange={handleSearchChange}
                placeholder="Buscar..."
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setHighlighted((h) => Math.max(h - 1, 0));
                  } else if (event.key === 'Enter') {
                    event.preventDefault();
                    const option = filtered[highlighted];
                    if (option) selectOption(option);
                  } else if (event.key === 'Escape') {
                    setOpen(false);
                    setQuery('');
                  }
                }}
                className="w-full rounded-lg border border-sand bg-paper px-3 py-2 text-sm text-ink focus:border-clay focus:outline-none"
              />
            </div>
            <ul
              id={listboxId}
              role="listbox"
              className="min-h-0 flex-1 overflow-y-auto"
            >
              {filtered.length > 0 ? (
                filtered.map((option, index) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={option.value === value}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectOption(option);
                    }}
                    onMouseEnter={() => setHighlighted(index)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-sm text-ink',
                      index === highlighted && 'bg-paper2',
                      option.value === value && 'font-bold text-clay',
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.value === value && (
                      <Check size={16} className="shrink-0 text-clay" />
                    )}
                  </li>
                ))
              ) : (
                <li className="px-3.5 py-3 text-xs text-inkMuted">
                  Nenhuma opção encontrada.
                </li>
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
