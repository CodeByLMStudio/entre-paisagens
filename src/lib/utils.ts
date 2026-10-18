/**
 * Utilitários gerais.
 */

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Monta o texto de referência de um endereço. O número não é mais coletado
 * nem exibido; mantém-se apenas a observação/ponto de referência e o campo
 * legado `streetNumberOrObs`.
 */
export function formatAddressDetail(
  experience: {
    streetReference?: string;
    streetNumberOrObs?: string;
  },
): string {
  const reference = experience.streetReference?.trim();
  if (reference) return reference;
  return experience.streetNumberOrObs?.trim() ?? '';
}
