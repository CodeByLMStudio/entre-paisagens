import type { Experience, MapPoint } from '@/domain/types';
import { generateId } from './utils';

/**
 * Lógica de agrupamento de experiências por ponto do mapa.
 *
 * Um "ponto" representa uma marcação exata no mapa. Experiências são agrupadas
 * no mesmo ponto quando compartilham o mesmo `pointId` ou estão na mesma
 * coordenada. O histórico por logradouro é resolvido por `streetKey` (ver
 * `getExperiencesOnSameStreet`).
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

/**
 * Normaliza preservando os espaços entre palavras — diferenças como
 * "Av. Beira-Mar" e "Avenida Beira Mar" resultam na mesma chave.
 */
function normalizeWords(value: string | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_/.,;:()[\]'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Abreviações comuns de vias, normalizadas para a forma completa. */
const STREET_ABBREVIATIONS: Record<string, string> = {
  r: 'rua',
  av: 'avenida',
  aven: 'avenida',
  al: 'alameda',
  trav: 'travessa',
  tv: 'travessa',
  rod: 'rodovia',
  estr: 'estrada',
  pc: 'praca',
  pra: 'praca',
};

/**
 * Chave do logradouro (somente a rua, sem numeração). Usada para o histórico
 * por endereço: registros em pontos diferentes da mesma rua pertencem ao mesmo
 * histórico.
 */
export function streetKey(experience: { streetName?: string }): string {
  const raw = (experience.streetName ?? '').trim();
  if (!raw) return '';

  const words = normalizeWords(raw).split(' ').filter(Boolean);
  const expanded = words.map((word) => STREET_ABBREVIATIONS[word] ?? word);
  const key = expanded.join('');

  // Evita chaves ruins (ex.: "coordenadas-3-7319" geradas quando o endereço
  // não foi identificado pela geocodificação).
  if (!key || /^coordenadas\d*$/.test(key)) return '';
  return key;
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
    const key = exp.pointId
      ? `point:${exp.pointId}`
      : `coord:${coordKey(exp.lat, exp.lng)}`;

    const existing = points.get(key);
    if (existing) {
      existing.experiences.push(exp);
    } else {
      points.set(key, {
        pointId: key.startsWith('point:') ? key.slice(6) : generateId(),
        lat: exp.lat,
        lng: exp.lng,
        streetName: exp.streetName,
        streetReference: exp.streetReference,
        locationNeighborhood: exp.locationNeighborhood,
        experiences: [exp],
      });
    }
  }

  return Array.from(points.values());
}

/**
 * Resolve o `pointId` para uma nova experiência: reutiliza o ponto existente
 * quando a coordenada é a mesma; caso contrário, gera um novo ponto (a mesma
 * rua pode ter várias marcações, todas ligadas pelo histórico do logradouro).
 */
export function resolvePointId(
  draft: { streetName?: string; lat: number; lng: number },
  existing: Experience[],
): string {
  const cKey = coordKey(draft.lat, draft.lng);
  for (const exp of existing) {
    if (exp.pointId && coordKey(exp.lat, exp.lng) === cKey) return exp.pointId;
  }
  return generateId();
}

/**
 * Experiências registradas na mesma rua do ponto informado — inclusive as que
 * estão em outras marcações do mapa. Mais recentes primeiro.
 */
export function getExperiencesOnSameStreet(
  points: Iterable<MapPoint>,
  point: MapPoint,
): Experience[] {
  const key = streetKey(point);
  if (!key) return point.experiences;

  const related: Experience[] = [];
  for (const candidate of points) {
    if (streetKey(candidate) !== key) continue;
    related.push(...candidate.experiences);
  }

  // Ao menos os próprios relatos do ponto já estão incluídos em `related`.
  if (related.length === 0) return point.experiences;

  return related.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
