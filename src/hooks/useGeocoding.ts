'use client';

import { useCallback, useState } from 'react';
import { reverseGeocode, type ReverseGeocodeResult } from '@/lib/geocoding';

type GeocodingStatus = 'idle' | 'loading' | 'error';

/**
 * Encapsula a geocodificação reversa (Nominatim) com estado de carregamento
 * e tratamento elegante de erros. Retorna o logradouro e o bairro detectados.
 */
export function useGeocoding() {
  const [status, setStatus] = useState<GeocodingStatus>('idle');

  const lookup = useCallback(
    async (lat: number, lng: number): Promise<ReverseGeocodeResult> => {
      setStatus('loading');
      const result = await reverseGeocode(lat, lng);
      setStatus(result.ok ? 'idle' : 'error');
      return result;
    },
    [],
  );

  return { lookup, status };
}
