/**
 * Demarcação territorial do município de Fortaleza (CE).
 *
 * A malha municipal vem da API pública do IBGE:
 *   https://servicodados.ibge.gov.br/api/v2/malhas/{codigo}?formato=application/vnd.geo+json&qualidade=intermediaria
 *
 * Fortaleza possui o código IBGE 2304400. A resposta é uma FeatureCollection
 * (CRS EPSG:4674 = SIRGAS 2000, compatível com WGS84 usado pelo Leaflet).
 *
 * Os anéis do polígono são mantidos em cache (singleton em memória) para que a
 * verificação de "ponto dentro da área" possa ser feita de forma síncrona nos
 * handlers do mapa, do GPS e da submissão do relato.
 */

const IBGE_MUNICIPALITY_CODE = '2304400';

const MALHAS_URL = `https://servicodados.ibge.gov.br/api/v2/malhas/${IBGE_MUNICIPALITY_CODE}?formato=application/vnd.geo+json&qualidade=intermediaria`;

/** Anel de polígono = lista de [lng, lat]. */
export type Ring = Array<[number, number]>;

interface BoundaryCache {
  geojson: unknown | null;
  rings: Ring[] | null;
  promise: Promise<unknown | null> | null;
}

const cache: BoundaryCache = { geojson: null, rings: null, promise: null };

function extractRings(geojson: unknown): Ring[] {
  const rings: Ring[] = [];
  if (!geojson || typeof geojson !== 'object') return rings;

  const fc = geojson as { features?: unknown[] };
  if (!Array.isArray(fc.features)) return rings;

  for (const feature of fc.features) {
    if (!feature || typeof feature !== 'object') continue;
    const geom = (feature as { geometry?: { type?: string; coordinates?: unknown } })
      .geometry;
    if (!geom || !geom.coordinates) continue;

    // Polygon: coords = [ ring, ... ]
    // MultiPolygon: coords = [ [ ring, ... ], ... ]
    const type = geom.type;
    const coords = geom.coordinates as unknown;

    const collectPolygon = (polygon: unknown) => {
      if (!Array.isArray(polygon) || polygon.length === 0) return;
      // exterior ring (first)
      const exterior = polygon[0];
      if (Array.isArray(exterior)) {
        const ring: Ring = exterior
          .filter((pt): pt is [number, number] | number[] => Array.isArray(pt))
          .map((pt) => [Number(pt[0]), Number(pt[1])] as [number, number]);
        if (ring.length >= 3) rings.push(ring);
      }
    };

    if (type === 'Polygon') {
      collectPolygon(coords);
    } else if (type === 'MultiPolygon') {
      if (Array.isArray(coords)) {
        for (const polygon of coords) collectPolygon(polygon);
      }
    }
  }

  return rings;
}

/** GeoJSON cru de Fortaleza (FeatureCollection). */
export async function fetchFortalezaBoundary(): Promise<unknown | null> {
  if (cache.geojson) return cache.geojson;
  if (cache.promise) return cache.promise;

  cache.promise = fetch(MALHAS_URL, { cache: 'force-cache' })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      cache.geojson = data;
      cache.rings = extractRings(data);
      cache.promise = null;
      return data;
    })
    .catch(() => {
      cache.promise = null;
      return null;
    });

  return cache.promise;
}

/** Anéis do polígono (vazio se ainda não carregado). */
export function getFortalezaRings(): Ring[] {
  return cache.rings ?? [];
}

/** Teste de ponto-em-polígono (ray casting). */
export function pointInRing(lat: number, lng: number, ring: Ring): boolean {  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]![0];
    const yi = ring[i]![1];
    const xj = ring[j]![0];
    const yj = ring[j]![1];

    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Verifica se o ponto está dentro de qualquer anel do município. */
export function pointInFortaleza(lat: number, lng: number): boolean {
  const rings = getFortalezaRings();
  if (rings.length === 0) return false;
  for (const ring of rings) {
    if (pointInRing(lat, lng, ring)) return true;
  }
  return false;
}

/**
 * Garante que a malha de Fortaleza está carregada e verifica se o ponto está
 * dentro da área demarcada. Await da busca quando necessário (primeira chamada).
 */
export async function isWithinFortalezaBoundary(
  lat: number,
  lng: number,
): Promise<boolean> {
  if (getFortalezaRings().length === 0) {
    await fetchFortalezaBoundary();
  }
  return pointInFortaleza(lat, lng);
}
