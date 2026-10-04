'use client';

import { useEffect } from 'react';
import { fetchFortalezaBoundary } from '@/lib/boundary';
import { storage } from '@/lib/storage';
import { useExperienceStore } from '@/stores/experienceStore';
import { useUiStore } from '@/stores/uiStore';

const TUTORIAL_SEEN_KEY = 'entre_paisagens_tutorial_seen';

/**
 * Efeitos de inicialização que precisam rodar apenas no cliente:
 *  - Hidratação do store de experiências (leitura do localStorage).
 *  - Exibição do tutorial na primeira visita.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Limpa dados antigos (v1) de campanhas anteriores de teste.
    storage.remove('entre-paisagens.experiences.v1');

    // Pré-carrega a malha de Fortaleza (usada na validação de área).
    void fetchFortalezaBoundary();

    useExperienceStore.getState().hydrate();

    if (!storage.get(TUTORIAL_SEEN_KEY)) {
      useUiStore.getState().setTutorialOpen(true);
    }
  }, []);

  return <>{children}</>;
}
