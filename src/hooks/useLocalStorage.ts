'use client';

import { useCallback, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

/**
 * Hook genérico de persistência em localStorage, com hidratação pós-mount
 * (evita divergência de SSR) e serialização JSON segura.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = storage.get(key);
    if (raw !== null) {
      try {
        setValue(JSON.parse(raw) as T);
      } catch {
        /* mantém valor inicial em caso de JSON corrompido */
      }
    }
    setHydrated(true);
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        storage.set(key, JSON.stringify(resolved));
        return resolved;
      });
    },
    [key],
  );

  return [value, set, hydrated] as const;
}
