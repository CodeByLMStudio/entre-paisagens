import type { LatLng } from '@/domain/types';

/**
 * Bounding box municipal de Fortaleza (CE).
 * Usada tanto no cliente (interação no mapa) quanto na camada de validação.
 */
export const FORTALEZA_BOUNDS = {
  minLat: -3.88,
  maxLat: -3.7,
  minLng: -38.64,
  maxLng: -38.42,
} as const;

export const FORTALEZA_CENTER: LatLng = { lat: -3.7319, lng: -38.5276 };

export const FORTALEZA_DEFAULT_ZOOM = 13;
export const FORTALEZA_PIN_ZOOM = 15;

export function isWithinFortaleza(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= FORTALEZA_BOUNDS.minLat &&
    lat <= FORTALEZA_BOUNDS.maxLat &&
    lng >= FORTALEZA_BOUNDS.minLng &&
    lng <= FORTALEZA_BOUNDS.maxLng
  );
}
