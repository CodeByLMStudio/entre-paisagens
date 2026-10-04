'use client';

import { create } from 'zustand';
import type {
  EixoFilter,
  LandscapeDimension,
  LatLng,
} from '@/domain/types';

interface MapState {
  /** Ponto (local) selecionado no mapa, representado pelo seu `pointId`. */
  selectedPointId: string | null;
  activeEixo: EixoFilter;
  /** Dimensões paisagísticas selecionadas (multisseleção). */
  activeDimensions: LandscapeDimension[];
  pendingCoord: LatLng | null;
  pickingMode: boolean;
  filterDrawerOpen: boolean;

  setSelectedPointId: (pointId: string | null) => void;
  setActiveEixo: (eixo: EixoFilter) => void;
  toggleDimension: (dimension: LandscapeDimension) => void;
  clearDimensions: () => void;
  setPendingCoord: (coord: LatLng | null) => void;
  setPickingMode: (active: boolean) => void;
  setFilterDrawerOpen: (open: boolean) => void;
}

export const useMapStore = create<MapState>()((set) => ({
  selectedPointId: null,
  activeEixo: 'ALL',
  activeDimensions: [],
  pendingCoord: null,
  pickingMode: false,
  filterDrawerOpen: false,

  setSelectedPointId: (pointId) => set({ selectedPointId: pointId }),
  setActiveEixo: (eixo) => set({ activeEixo: eixo }),
  toggleDimension: (dimension) =>
    set((state) => ({
      activeDimensions: state.activeDimensions.includes(dimension)
        ? state.activeDimensions.filter((d) => d !== dimension)
        : [...state.activeDimensions, dimension],
    })),
  clearDimensions: () => set({ activeDimensions: [] }),
  setPendingCoord: (coord) => set({ pendingCoord: coord }),
  setPickingMode: (active) => set({ pickingMode: active }),
  setFilterDrawerOpen: (open) => set({ filterDrawerOpen: open }),
}));
