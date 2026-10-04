import type { LandscapeDimension, LatLng, MapPoint } from '@/domain/types';

export interface MapContainerProps {
  points: MapPoint[];
  selectedPointId: string | null;
  onSelectPoint: (pointId: string | null) => void;
  onMapClick?: (lat: number, lng: number) => void;
  pendingCoord?: LatLng | null;
  onClearPendingCoord?: () => void;
  /** Dimensões selecionadas no filtro (define o visual dos marcadores). */
  activeDimensions: LandscapeDimension[];
}
