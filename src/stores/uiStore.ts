'use client';

import { create } from 'zustand';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

interface UiState {
  toast: ToastState | null;
  contactOpen: boolean;
  tutorialOpen: boolean;

  showToast: (message: string, type?: ToastType) => void;
  dismissToast: () => void;
  setContactOpen: (open: boolean) => void;
  setTutorialOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  toast: null,
  contactOpen: false,
  tutorialOpen: false,

  showToast: (message, type = 'error') =>
    set({ toast: { id: Date.now(), message, type } }),

  dismissToast: () => set({ toast: null }),
  setContactOpen: (open) => set({ contactOpen: open }),
  setTutorialOpen: (open) => set({ tutorialOpen: open }),
}));
