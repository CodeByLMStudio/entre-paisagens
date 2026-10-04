import type { Experience, MapPoint } from '@/domain/types';
import { generateId } from './utils';

/**
 * Lógica de agrupamento de experiências por ponto do mapa.
 *
 * Um "ponto" representa um local único. Experiências são agrupadas quando:
 *  1. compartilham o mesmo `pointId`; ou
 *  2. possuem o mesmo logradouro + numeração (normalizados); ou
 *  3. (fallback) estão na mesma coordenada aproximada.
 */

/** Normaliza texto para comparação (sem acentos/caixa/pontuação). */
function normalize(value: string | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
    .trim();
}

/** Chave de endereço (logradouro + número), usada para agrupar o histórico. */
export function addressKey(experience: {
  streetName?: string;
  streetNumber?: string;
}): string {
  const street = normalize(experience.streetName);
  const number = normalize(experience.streetNumber);
  return street ? `${street}|${number}` : '';
}

/** Chave de coordenada aproximada (para agrupar pontos sem endereço). */
export function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

/**
 * Agrupa uma lista de experiências em pontos do mapa.
 * A ordem das experiências dentro do ponto é preservada (mais recentes primeiro,
 * se a lista já vier ordenada).
 */
export function groupExperiencesByPoint(
  experiences: Experience[],
): MapPoint[] {
  const points = new Map<string, MapPoint>();

  for (const exp of experiences) {
    let key: string;

    if (exp.pointId) {
      key = `point:${exp.pointId}`;
    } else {
      const aKey = addressKey(exp);
      const hasNumber = Boolean(exp.streetNumber?.trim());
      // Agrupa por endereço somente quando há logradouro E número.
      key =
        aKey && hasNumber
          ? `addr:${aKey}`
          : `coord:${coordKey(exp.lat, exp.lng)}`;
    }

    const existing = points.get(key);
    if (existing) {
      existing.experiences.push(exp);
    } else {
      points.set(key, {
        pointId: key.startsWith('point:') ? key.slice(6) : generateId(),
        lat: exp.lat,
        lng: exp.lng,
        streetName: exp.streetName,
        streetNumber: exp.streetNumber,
        streetReference: exp.streetReference,
        locationNeighborhood: exp.locationNeighborhood,
        experiences: [exp],
      });
    }
  }

  return Array.from(points.values());
}

/**
 * Resolve o `pointId` para uma nova experiência: encontra um ponto existente
 * com o mesmo endereço completo (logradouro + número) ou, na ausência de
 * número, a mesma coordenada aproximada; caso não exista, gera um novo id.
 */
export function resolvePointId(
  draft: { streetName?: string; streetNumber?: string; lat: number; lng: number },
  existing: Experience[],
): string {
  const key = addressKey(draft);
  const hasNumber = Boolean(draft.streetNumber?.trim());

  // Merge por endereço apenas quando logradouro E número estão presentes.
  if (key && hasNumber) {
    for (const exp of existing) {
      if (exp.pointId && addressKey(exp) === key) return exp.pointId;
    }
  }

  // Fallback por coordenada aproximada.
  const cKey = coordKey(draft.lat, draft.lng);
  for (const exp of existing) {
    if (exp.pointId && coordKey(exp.lat, exp.lng) === cKey) return exp.pointId;
  }

  return generateId();
}
