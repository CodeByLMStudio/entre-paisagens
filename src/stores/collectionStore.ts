'use client';

import { create } from 'zustand';
import type { ExperienceDraft, LatLng, UserProfile } from '@/domain/types';
import { INITIAL_PROFILE } from '@/domain/constants';
import { FORTALEZA_CENTER } from '@/lib/geo';
import { generateId } from '@/lib/utils';

function createExperienceDraft(
  coord?: LatLng,
  streetName = '',
  locationNeighborhood = '',
): ExperienceDraft {
  const { lat, lng } = coord ?? FORTALEZA_CENTER;
  return {
    id: generateId(),
    pointId: undefined,
    lat,
    lng,
    locationNeighborhood,
    streetName,
    streetNumber: '',
    streetReference: '',
    eixo: 'PERCEBER',
    photoUrl: null,
    audioUrl: null,
    relation: 'Moro próximo',
    proposal: '',
    date: new Date().toISOString(),
    dimensions: [],
    facilitators: [],
    difficulties: [],
  };
}

function cloneInitialProfile(): UserProfile {
  return {
    ...INITIAL_PROFILE,
    influencingFactors: [...INITIAL_PROFILE.influencingFactors],
  };
}

interface CollectionState {
  isOpen: boolean;
  step: number;
  profile: UserProfile;
  form: ExperienceDraft;
  isSubmitting: boolean;

  open: () => void;
  close: () => void;
  setStep: (step: number) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  updateForm: (patch: Partial<ExperienceDraft>) => void;
  resetDraft: (coord?: LatLng, streetName?: string, locationNeighborhood?: string) => void;
  setIsSubmitting: (value: boolean) => void;
}

export const useCollectionStore = create<CollectionState>()((set) => ({
  isOpen: false,
  step: 1,
  profile: cloneInitialProfile(),
  form: createExperienceDraft(),
  isSubmitting: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setStep: (step) => set({ step }),

  updateProfile: (patch) =>
    set((state) => ({ profile: { ...state.profile, ...patch } })),

  updateForm: (patch) =>
    set((state) => ({ form: { ...state.form, ...patch } })),

  resetDraft: (coord, streetName, locationNeighborhood) =>
    set({
      profile: cloneInitialProfile(),
      form: createExperienceDraft(coord, streetName, locationNeighborhood),
      step: 1,
      isSubmitting: false,
    }),

  setIsSubmitting: (value) => set({ isSubmitting: value }),
}));
