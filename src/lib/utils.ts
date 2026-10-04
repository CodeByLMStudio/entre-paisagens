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
 * Monta o texto de número/ponto de referência de um endereço a partir dos
 * campos estruturados, com compatibilidade com o campo legado
 * `streetNumberOrObs`.
 */
export function formatAddressDetail(
  experience: {
    streetNumber?: string;
    streetReference?: string;
    streetNumberOrObs?: string;
  },
): string {
  const number = experience.streetNumber?.trim();
  const reference = experience.streetReference?.trim();

  if (number && reference) return `${number} — ${reference}`;
  if (number) return number;
  if (reference) return reference;
  return experience.streetNumberOrObs?.trim() ?? '';
}
