'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { searchAddresses, type ForwardGeocodeResult } from '@/lib/geocoding';
import { cn } from '@/lib/utils';
import { inputClass } from '../ui/Field';

interface AddressAutocompleteProps {
  id?: string;
  value: string;
  onSelect: (result: { label: string; lat: number; lng: number; streetName?: string }) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Campo de busca de endereço com autocomplete em tempo real (Nominatim).
 * Ao digitar, sugere possíveis endereços de Fortaleza; ao selecionar um,
 * devolve o rótulo e as coordenadas correspondentes.
 */
export function AddressAutocomplete({
  id,
  value,
  onSelect,
  placeholder = 'Digite o endereço...',
  className,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [suggestions, setSuggestions] = useState<ForwardGeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const runSearch = useMemo(
    () => (term: string) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      searchAddresses(term, controller.signal)
        .then((results) => {
          setSuggestions(results);
          setHighlighted(0);
        })
        .finally(() => setLoading(false));
    },
    [],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setQuery(term);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (term.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(term), 350);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const selectResult = (result: ForwardGeocodeResult) => {
    onSelect({
      label: result.label,
      lat: result.lat,
      lng: result.lng,
      streetName: result.streetName,
    });
    setQuery(result.label);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selected = suggestions[highlighted];
      if (selected) selectResult(selected);
    } else if (event.key === 'Escape') {
      setOpen(false);
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
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        className={cn(inputClass, 'pr-10')}
      />
      <Search
        size={16}
        className={cn(
          'pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-inkMuted',
          loading && 'animate-pulse text-clay',
        )}
      />

      {open && (suggestions.length > 0 || loading) && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border-2 border-sand bg-white shadow-lg">
          {loading && suggestions.length === 0 ? (
            <div className="px-3.5 py-3 text-xs text-inkMuted">Buscando...</div>
          ) : (
            <ul id={listboxId} role="listbox" className="max-h-56 overflow-y-auto">
              {suggestions.map((result, index) => (
                <li
                  key={`${result.lat}-${result.lng}-${index}`}
                  role="option"
                  aria-selected={false}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectResult(result);
                  }}
                  onMouseEnter={() => setHighlighted(index)}
                  className={cn(
                    'cursor-pointer px-3.5 py-2.5 text-sm text-ink',
                    index === highlighted && 'bg-paper2',
                  )}
                >
                  {result.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
