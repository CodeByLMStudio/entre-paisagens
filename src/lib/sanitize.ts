/**
 * Utilitários de sanitização de entrada de usuários.
 *
 * O React já escapa texto renderizado por padrão, portanto o principal vetor
 * de XSS é:
 *  1. URLs usadas em `src`/`href` (ex.: `javascript:`).
 *  2. HTML injetado via `dangerouslySetInnerHTML` ou `divIcon.html` do Leaflet.
 *
 * Regras deste módulo:
 *  - Nunca interpolamos texto do usuário em HTML (os marcadores do Leaflet usam
 *    apenas constantes seguras — cores/ícones).
 *  - URLs de mídia são validadas contra uma lista de protocolos permitidos.
 */

import type { Experience } from '@/domain/types';

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeText(value: string | null | undefined, maxLength = 2000): string {
  if (!value) return '';
  return value
    .replace(CONTROL_CHARS, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'blob:']);

/**
 * Valida URL de mídia. Permite apenas http/https/blob e data URLs de imagem
 * ou áudio. Retorna `null` caso inválida (impede `javascript:` e afins).
 */
export function sanitizeMediaUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();

  if (trimmed.startsWith('data:')) {
    return trimmed.startsWith('data:image/') || trimmed.startsWith('data:audio/')
      ? trimmed
      : null;
  }

  try {
    const parsed = new URL(trimmed);
    return ALLOWED_PROTOCOLS.has(parsed.protocol) ? trimmed : null;
  } catch {
    return null;
  }
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

export function sanitizeExperience(experience: Experience): Experience {
  return {
    ...experience,
    streetName: experience.streetName
      ? sanitizeText(experience.streetName, 160)
      : undefined,
    locationNeighborhood: experience.locationNeighborhood
      ? sanitizeText(experience.locationNeighborhood, 120)
      : undefined,
    streetNumber: experience.streetNumber
      ? sanitizeText(experience.streetNumber, 20)
      : undefined,
    streetReference: experience.streetReference
      ? sanitizeText(experience.streetReference, 240)
      : undefined,
    streetNumberOrObs: experience.streetNumberOrObs
      ? sanitizeText(experience.streetNumberOrObs, 240)
      : undefined,
    relationOther: experience.relationOther
      ? sanitizeText(experience.relationOther, 500)
      : '',
    proposal: sanitizeText(experience.proposal, 2000),
    photoUrl: sanitizeMediaUrl(experience.photoUrl),
    audioUrl: sanitizeMediaUrl(experience.audioUrl),
    mediaUrl: sanitizeMediaUrl(experience.mediaUrl),
    profile: {
      ...experience.profile,
      name: sanitizeText(experience.profile.name, 80),
      neighborhood: sanitizeText(experience.profile.neighborhood, 80),
      state: sanitizeText(experience.profile.state, 40),
      city: sanitizeText(experience.profile.city, 120),
      sensoryMobilityNotes: sanitizeText(experience.profile.sensoryMobilityNotes, 500),
    },
  };
}
