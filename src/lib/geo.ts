import type { LatLng } from '@/domain/types';

/**
 * Bounding box do território brasileiro (inclui ilhas oceânicas).
 * Usada tanto no cliente (interação no mapa) quanto na camada de validação.
 */
export const BRAZIL_BOUNDS = {
  minLat: -33.75,
  maxLat: 5.3,
  minLng: -74.0,
  maxLng: -28.5,
} as const;

export const FORTALEZA_CENTER: LatLng = { lat: -3.7319, lng: -38.5276 };

export const FORTALEZA_DEFAULT_ZOOM = 13;
export const FORTALEZA_PIN_ZOOM = 15;

/** Valida se a coordenada pertence ao território brasileiro. */
export function isWithinBrazil(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= BRAZIL_BOUNDS.minLat &&
    lat <= BRAZIL_BOUNDS.maxLat &&
    lng >= BRAZIL_BOUNDS.minLng &&
    lng <= BRAZIL_BOUNDS.maxLng
  );
}
