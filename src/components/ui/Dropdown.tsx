'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const rootRef = useRef<HTMLDivElement>(null);
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

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
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

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border-2 border-sand bg-white shadow-lg">
          <div className="border-b border-paper2 p-2">
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
                }
              }}
              className="w-full rounded-lg border border-sand bg-paper px-3 py-2 text-sm text-ink focus:border-clay focus:outline-none"
            />
          </div>
          <ul id={listboxId} role="listbox" className="max-h-56 overflow-y-auto">
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
                  {option.value === value && <Check size={16} className="shrink-0 text-clay" />}
                </li>
              ))
            ) : (
              <li className="px-3.5 py-3 text-xs text-inkMuted">
                Nenhuma opção encontrada.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
