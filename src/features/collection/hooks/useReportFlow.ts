'use client';

import { useCallback } from 'react';
import type { LatLng } from '@/domain/types';
import { useGeocoding } from '@/hooks/useGeocoding';
import { FORTALEZA_CENTER } from '@/lib/geo';
import { useCollectionStore } from '@/stores/collectionStore';
import { hasAcceptedTerms, useConsentStore } from '@/stores/consentStore';

/**
 * Orquestra o início de um novo relato: resolve a geocodificação reversa da
 * coordenada inicial e abre o modal de coleta no passo 1.
 *
 * O cadastro só é iniciado após o aceite dos Termos de Uso e da Política de
 * Privacidade. Sem o aceite, a pessoa permanece em modo de visualização.
 */
export function useReportFlow() {
  const resetDraft = useCollectionStore((s) => s.resetDraft);
  const open = useCollectionStore((s) => s.open);
  const { lookup } = useGeocoding();

  const beginRegistration = useCallback(
    async (coord?: LatLng) => {
      const target = coord ?? FORTALEZA_CENTER;
      const result = await lookup(target.lat, target.lng);
      resetDraft(target, result.streetName, result.neighborhood);
      open();
    },
    [lookup, open, resetDraft],
  );

  const startRegistration = useCallback(
    (coord?: LatLng) => {
      if (!hasAcceptedTerms()) {
        useConsentStore.getState().openConsent(() => {
          void beginRegistration(coord);
        });
        return;
      }
      void beginRegistration(coord);
    },
    [beginRegistration],
  );

  return { startRegistration };
}
