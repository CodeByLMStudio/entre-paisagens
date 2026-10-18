'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inputClass } from './Field';

interface ComboboxProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  /** Limite de itens renderizados por vez (a busca continua em toda a lista). */
  maxResults?: number;
  emptyMessage?: string;
}

/** Normaliza removendo acentos e caixa, para busca tolerante ("jose" → "José"). */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Campo de busca com sugestões (combobox) acessível por teclado.
 * Filtra as opções por "contém" (case/acento insensível).
 */
export function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder,
  className,
  maxResults = 100,
  emptyMessage = 'Nenhuma opção encontrada.',
}: ComboboxProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return options;
    return options.filter((option) => normalize(option).includes(q));
  }, [options, query]);

  const visible = useMemo(
    () => filtered.slice(0, maxResults),
    [filtered, maxResults],
  );

  // Mantém o texto sincronizado quando o valor é alterado externamente.
  useEffect(() => {
    setQuery(value);
    setHighlighted(0);
  }, [value]);

  const selectOption = (option: string) => {
    onChange(option);
    setQuery(option);
    setOpen(false);
    setHighlighted(0);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setOpen(true);
    setHighlighted(0);
  };

  const handleFocus = () => {
    setOpen(true);
    // Seleciona o texto para facilitar a troca do bairro.
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const handleBlur = () => {
    setOpen(false);
    setQuery(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setHighlighted((h) => Math.min(h + 1, visible.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selected = open ? visible[highlighted] : undefined;
      if (selected) selectOption(selected);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setQuery(value);
    }
  };

  const listboxId = id ? `${id}-listbox` : undefined;

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={listboxId}
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(inputClass, 'pr-10')}
      />
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-inkMuted"
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border-2 border-sand bg-white shadow-lg">
          {filtered.length > 0 ? (
            <ul
              id={listboxId}
              role="listbox"
              className="max-h-48 overflow-y-auto"
            >
              {visible.map((option, index) => (
                <li
                  key={option}
                  role="option"
                  aria-selected={option === value}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectOption(option);
                  }}
                  onMouseEnter={() => setHighlighted(index)}
                  className={cn(
                    'cursor-pointer px-3.5 py-2.5 text-sm text-ink',
                    index === highlighted && 'bg-paper2',
                    option === value && 'font-bold text-clay',
                  )}
                >
                  {option}
                </li>
              ))}
              {filtered.length > visible.length && (
                <li className="border-t border-paper2 px-3.5 py-2 text-[10px] font-semibold text-inkMuted">
                  {filtered.length - visible.length} resultados ocultos. Digite para
                  refinar a busca.
                </li>
              )}
            </ul>
          ) : (
            <div className="px-3.5 py-3 text-xs text-inkMuted">{emptyMessage}</div>
          )}
        </div>
      )}
    </div>
  );
}
