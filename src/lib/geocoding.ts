/**
 * Geocodificação via Nominatim (OpenStreetMap).
 *
 * - Define `User-Agent` (exigido pela política de uso do Nominatim).
 * - Possui timeout e fallback elegante: em caso de falha, devolve as
 *   coordenadas formatadas em vez de lançar erro.
 */

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'EntrePaisagens/0.2 (mapeamento participativo; contato: dev@example.com)';
const TIMEOUT_MS = 6000;

export interface ReverseGeocodeResult {
  streetName: string;
  /** Bairro/subúrbio do local (quando identificado). */
  neighborhood?: string;
  ok: boolean;
}

/** Resultado individual de uma busca de endereço (geocodificação direta). */
export interface ForwardGeocodeResult {
  /** Rótulo amigável para exibição (nome + bairro/subúrbio + cidade). */
  label: string;
  lat: number;
  lng: number;
  /** Nome do logradouro/via, quando disponível (q pode ser ruas). */
  streetName?: string;
}

export async function reverseGeocode(
  lat: number,
  lng: number,
  externalSignal?: AbortSignal,
): Promise<ReverseGeocodeResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const url = `${NOMINATIM_ENDPOINT}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

  try {
    const response = await fetch(url, {
      signal: externalSignal ?? controller.signal,
      headers: {
        'Accept-Language': 'pt-BR',
        'User-Agent': USER_AGENT,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Nominatim responded with ${response.status}`);
    }

    const data: unknown = await response.json();

    if (data && typeof data === 'object' && 'address' in data) {
      const address = (data as { address?: Record<string, unknown> }).address;
      if (address) {
        const road =
          (address.road as string | undefined) ??
          (address.pedestrian as string | undefined) ??
          (address.suburb as string | undefined) ??
          (address.neighbourhood as string | undefined) ??
          ((data as { name?: string }).name as string | undefined);

        const neighborhood =
          (address.suburb as string | undefined) ??
          (address.neighbourhood as string | undefined) ??
          (address.city_district as string | undefined);

        if (road) {
          return { streetName: String(road), neighborhood, ok: true };
        }
      }
    }
  } catch {
    /* falha de rede / timeout: tratado como fallback */
  } finally {
    clearTimeout(timeout);
  }

  return {
    streetName: `Coordenadas (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    ok: false,
  };
}

/**
 * Busca de endereços (geocodificação direta) restrita ao município de
 * Fortaleza (CE). A busca é feita com `viewbox` e `bounded=1` para priorizar
 * resultados dentro dos limites da cidade. Retorna uma lista vazia em caso de
 * erro (fallback elegante).
 */
export async function searchAddresses(
  query: string,
  externalSignal?: AbortSignal,
): Promise<ForwardGeocodeResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const params = new URLSearchParams({
    format: 'jsonv2',
    q: query,
    countrycodes: 'br',
    addressdetails: '1',
    limit: '8',
    // viewbox = minLng, maxLat, maxLng, minLat (Fortaleza)
    viewbox: '-38.64,-3.70,-38.42,-3.88',
    bounded: '1',
  });

  try {
    const response = await fetch(`${NOMINATIM_ENDPOINT}/search?${params.toString()}`, {
      signal: externalSignal ?? controller.signal,
      headers: {
        'Accept-Language': 'pt-BR',
        'User-Agent': USER_AGENT,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) return [];

    const results: ForwardGeocodeResult[] = [];

    for (const item of data) {
      if (!item || typeof item !== 'object') continue;
      const entry = item as {
        display_name?: string;
        lat?: string;
        lon?: string;
        address?: Record<string, unknown>;
      };

      const lat = Number.parseFloat(entry.lat ?? '');
      const lng = Number.parseFloat(entry.lon ?? '');
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

      const address = entry.address ?? {};
      const streetName =
        (address.road as string | undefined) ??
        (address.pedestrian as string | undefined);
      const suburb =
        (address.suburb as string | undefined) ??
        (address.neighbourhood as string | undefined);

      const labelParts = [streetName, suburb].filter(Boolean);
      const label =
        labelParts.length > 0
          ? labelParts.join(', ')
          : (entry.display_name ?? 'Endereço encontrado');

      results.push({
        label,
        lat,
        lng,
        streetName,
      });
    }

    return results;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
