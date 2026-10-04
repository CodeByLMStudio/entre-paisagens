'use client';

import { useEffect, useState } from 'react';
import { NEIGHBORHOODS_FALLBACK } from '@/domain/constants';

/**
 * Bairros de Fortaleza via Overpass API (OpenStreetMap).
 *
 * Consulta os bairros (`place=suburb` / `place=neighbourhood`) contidos na
 * área do município de Fortaleza (admin_level=8). É um web service aberto,
 * gratuito e sem chave. Em caso de falha (indisponibilidade/timeout), usa a
 * lista estática de fallback.
 */

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

const OVERPASS_QUERY = `
[out:json][timeout:25];
area["admin_level"="8"]["name"="Fortaleza"]->.a;
(
  relation["place"="suburb"](area.a);
  relation["place"="neighbourhood"](area.a);
);
out tags;
`;

export function useNeighborhoods() {
  const [neighborhoods, setNeighborhoods] = useState<string[]>(
    NEIGHBORHOODS_FALLBACK,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch(OVERPASS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Overpass ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (!active) return;

        const elements = (
          data as {
            elements?: Array<{ tags?: Record<string, string> }>;
          }
        ).elements;

        if (Array.isArray(elements) && elements.length > 0) {
          const names = elements
            .map((el) => el.tags?.name)
            .filter((name): name is string => typeof name === 'string')
            .map((name) => name.trim())
            .filter(
              (name) => name.length > 0 && name.toLowerCase() !== 'fortaleza',
            );

          if (names.length > 0) {
            const merged = Array.from(new Set(names)).sort();
            setNeighborhoods(merged);
          }
        }
      })
      .catch(() => {
        /* mantém o fallback */
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { neighborhoods, loading };
}
