'use client';

import { create } from 'zustand';
import type { Experience, MapPoint } from '@/domain/types';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import { groupExperiencesByPoint, resolvePointId } from '@/lib/points';

interface ExperienceState {
  experiences: Experience[];
  /** Indica que a hidratação (leitura do localStorage) já ocorreu no cliente. */
  hydrated: boolean;
  addExperience: (experience: Experience) => void;
  hydrate: () => void;
}

export const useExperienceStore = create<ExperienceState>()((set, get) => ({
  experiences: [],
  hydrated: false,

  addExperience: (experience) => {
    set((state) => {
      // Garante que a nova experiência entre no ponto correto (mesmo endereço
      // ou coordenada já existente), incrementando o histórico do ponto.
      const existing = state.experiences;
      const pointId =
        experience.pointId || resolvePointId(experience, existing);

      const withPoint = { ...experience, pointId };
      const next = [withPoint, ...existing];
      experienceRepository.save(next);
      return { experiences: next };
    });
  },

  hydrate: () => {
    const stored = experienceRepository.load();
    set({
      experiences: stored,
      hydrated: true,
    });
  },
}));

/** Deriva os pontos do mapa a partir das experiências (agrupados por local). */
export function useMapPoints(): MapPoint[] {
  const experiences = useExperienceStore((s) => s.experiences);
  return groupExperiencesByPoint(experiences);
}

/** Acesso imperativo (fora de componentes/hooks), para o fluxo de submit. */
export function getExperienceState() {
  return useExperienceStore.getState();
}
