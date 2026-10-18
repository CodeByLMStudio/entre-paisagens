'use client';

import { create } from 'zustand';
import { storage } from '@/lib/storage';

export const CONSENT_STORAGE_KEY = 'entre-paisagens.consent.v1';

/** Versão dos documentos aceitos. Deve ser alterada quando os termos mudarem. */
const CONSENT_VERSION = '1.0';

interface ConsentRecord {
  accepted: boolean;
  version: string;
  acceptedAt: string;
}

export function hasAcceptedTerms(): boolean {
  const raw = storage.get(CONSENT_STORAGE_KEY);
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    return parsed.accepted === true && parsed.version === CONSENT_VERSION;
  } catch {
    return false;
  }
}

export function registerTermsAcceptance(): void {
  const record: ConsentRecord = {
    accepted: true,
    version: CONSENT_VERSION,
    acceptedAt: new Date().toISOString(),
  };
  storage.set(CONSENT_STORAGE_KEY, JSON.stringify(record));
}

interface ConsentState {
  isOpen: boolean;
  pendingAction: (() => void) | null;
  openConsent: (action?: () => void) => void;
  closeConsent: (accepted?: boolean) => void;
}

export const useConsentStore = create<ConsentState>()((set, get) => ({
  isOpen: false,
  pendingAction: null,

  openConsent: (action) =>
    set({ isOpen: true, pendingAction: action ?? null }),

  closeConsent: (accepted = false) => {
    const action = get().pendingAction;
    set({ isOpen: false, pendingAction: null });
    if (accepted) action?.();
  },
}));

/**
 * Executa a ação imediatamente se os termos já foram aceitos. Caso contrário,
 * abre o consentimento e retoma a ação depois do aceite.
 */
export function requireTermsAcceptance(action: () => void): void {
  if (hasAcceptedTerms()) {
    action();
    return;
  }
  useConsentStore.getState().openConsent(action);
}
