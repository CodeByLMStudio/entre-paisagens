'use client';

import { useCallback, useState } from 'react';
import { getAccuratePosition } from '@/lib/geolocation';
import { isWithinBrazil } from '@/lib/geo';
import { useCollectionStore } from '@/stores/collectionStore';
import { useUiStore } from '@/stores/uiStore';
import { useGeocoding } from './useGeocoding';

/**
 * Serviços de localização usados no fluxo de relato:
 * - "Usar GPS atual": geolocalização + validação de área + geocodificação.
 */
export function useLocationServices() {
  const updateForm = useCollectionStore((s) => s.updateForm);
  const showToast = useUiStore((s) => s.showToast);
  const { lookup } = useGeocoding();
  const [isLocating, setIsLocating] = useState(false);

  const getCurrentLocation = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      showToast('Geolocalização não suportada neste navegador.');
      return null;
    }

    setIsLocating(true);
    try {
      const position = await getAccuratePosition();

      const { latitude: lat, longitude: lng } = position.coords;

      if (!isWithinBrazil(lat, lng)) {
        showToast('Sua localização atual está fora do território brasileiro.');
        return null;
      }

      const result = await lookup(lat, lng);
      updateForm({
        lat,
        lng,
        streetName: result.streetName,
        locationNeighborhood: result.neighborhood ?? '',
      });
      return result.streetName;
    } catch {
      showToast('Não foi possível obter sua localização atual.');
      return null;
    } finally {
      setIsLocating(false);
    }
  }, [lookup, showToast, updateForm]);

  return { getCurrentLocation, isLocating };
}
