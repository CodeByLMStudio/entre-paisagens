'use client';

import dynamic from 'next/dynamic';
import type { MapContainerProps } from '../types';
import { MapFallback } from './MapFallback';

/**
 * Carrega o Leaflet apenas no cliente, evitando erros de SSR
 * (`window is not defined`).
 */
const MapCore = dynamic(() => import('./MapCore'), {
  ssr: false,
  loading: () => <MapFallback />,
});

export function MapContainer(props: MapContainerProps) {
  return <MapCore {...props} />;
}
