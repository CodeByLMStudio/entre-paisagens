'use client';

import { useMemo } from 'react';
import { MapPin, X } from 'lucide-react';
import { LANDSCAPE_DIMENSIONS_LIST } from '@/domain/constants';
import type { LandscapeDimension } from '@/domain/types';
import { useGeocoding } from '@/hooks/useGeocoding';
import { isWithinBrazil } from '@/lib/geo';
import { useCollectionStore } from '@/stores/collectionStore';
import { requireTermsAcceptance } from '@/stores/consentStore';
import { useMapPoints, useExperienceStore } from '@/stores/experienceStore';
import { useMapStore } from '@/stores/mapStore';
import { useUiStore } from '@/stores/uiStore';
import { ExperienceDetailPanel } from './ExperienceDetailPanel';
import { FilterSidebar } from './FilterSidebar';
import { MapContainer } from './MapContainer';

export function DashboardView() {
  const allPoints = useMapPoints();
  const experiences = useExperienceStore((s) => s.experiences);

  const selectedPointId = useMapStore((s) => s.selectedPointId);
  const setSelectedPointId = useMapStore((s) => s.setSelectedPointId);
  const activeEixo = useMapStore((s) => s.activeEixo);
  const activeDimensions = useMapStore((s) => s.activeDimensions);
  const pendingCoord = useMapStore((s) => s.pendingCoord);
  const setPendingCoord = useMapStore((s) => s.setPendingCoord);
  const pickingMode = useMapStore((s) => s.pickingMode);
  const setPickingMode = useMapStore((s) => s.setPickingMode);
  const filterDrawerOpen = useMapStore((s) => s.filterDrawerOpen);
  const setFilterDrawerOpen = useMapStore((s) => s.setFilterDrawerOpen);

  const updateForm = useCollectionStore((s) => s.updateForm);
  const openCollection = useCollectionStore((s) => s.open);

  const showToast = useUiStore((s) => s.showToast);
  const { lookup } = useGeocoding();

  const filtered = useMemo(
    () =>
      allPoints.filter((point) => {
        const exps = point.experiences;
        const matchesEixo =
          activeEixo === 'ALL' || exps.some((exp) => exp.eixo === activeEixo);
        const matchesDimension =
          activeDimensions.length === 0 ||
          // Qualquer uma das dimensões selecionadas (antes, todas eram exigidas
          // no mesmo relato e os pontos filtrados desapareciam do mapa).
          exps.some((exp) =>
            activeDimensions.some((d) => exp.dimensions.includes(d)),
          );
        return matchesEixo && matchesDimension;
      }),
    [allPoints, activeEixo, activeDimensions],
  );

  const selectedPoint = useMemo(
    () => allPoints.find((p) => p.pointId === selectedPointId) ?? null,
    [allPoints, selectedPointId],
  );

  // Contagem de experiências por dimensão paisagística (respeitando o filtro
  // de eixo ativo, para manter coerência com a lista filtrada).
  const dimensionCounts = useMemo(() => {
    const counts = {} as Record<LandscapeDimension, number>;
    for (const dim of LANDSCAPE_DIMENSIONS_LIST) counts[dim] = 0;

    for (const exp of experiences) {
      if (activeEixo !== 'ALL' && exp.eixo !== activeEixo) continue;
      for (const dim of exp.dimensions) {
        counts[dim] = (counts[dim] ?? 0) + 1;
      }
    }
    return counts;
  }, [experiences, activeEixo]);

  const handleMapClick = async (lat: number, lng: number) => {
    if (!isWithinBrazil(lat, lng)) {
      showToast('Selecione um ponto dentro do território brasileiro.', 'error');
      return;
    }

    setPendingCoord({ lat, lng });
    const result = await lookup(lat, lng);
    updateForm({
      lat,
      lng,
      streetName: result.streetName,
      locationNeighborhood: result.neighborhood ?? '',
      locationSource: 'map',
      isOnSite: false,
    });

    if (pickingMode) {
      setPickingMode(false);
      openCollection();
    }
  };

  const cancelPicking = () => {
    setPickingMode(false);
    openCollection();
  };

  // "Registrar neste local": abre o fluxo a partir do ponto selecionado.
  const handleRegisterAtPoint = () => {
    if (!selectedPoint) return;

    requireTermsAcceptance(() => {
      const { resetDraft, open } = useCollectionStore.getState();
      resetDraft(
        { lat: selectedPoint.lat, lng: selectedPoint.lng },
        selectedPoint.streetName,
        selectedPoint.locationNeighborhood,
      );
      // Pré-preenche número/referência e o pointId para incrementar o histórico.
      const { updateForm } = useCollectionStore.getState();
      updateForm({
        streetReference: selectedPoint.streetReference ?? '',
        // Novo ponto: registros no mesmo local são agrupados pela coordenada,
        // enquanto o histórico é unificado pelo logradouro.
        pointId: undefined,
        locationSource: 'map',
        isOnSite: false,
      });
      open();
    });
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-paper md:flex-row">
      {pickingMode && (
        <div className="absolute left-1/2 top-4 z-[2000] flex -translate-x-1/2 items-center gap-3 rounded-full border-2 border-paper bg-ink px-6 py-3 text-paper shadow-2xl">
          <MapPin size={20} />
          <span className="text-sm font-bold">Clique no mapa para escolher o local</span>
          <button
            type="button"
            onClick={cancelPicking}
            className="ml-2 rounded-full bg-white/10 p-1 transition-colors hover:bg-white/20"
            title="Voltar para o formulário"
            aria-label="Voltar para o formulário"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <FilterSidebar
        filteredCount={filtered.length}
        dimensionCounts={dimensionCounts}
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      />

      <div className="relative z-0 min-h-[400px] flex-1">
        <MapContainer
          points={filtered}
          selectedPointId={selectedPointId}
          onSelectPoint={setSelectedPointId}
          onMapClick={handleMapClick}
          pendingCoord={pendingCoord}
          onClearPendingCoord={() => setPendingCoord(null)}
          activeDimensions={activeDimensions}
        />
      </div>

      <ExperienceDetailPanel
        point={selectedPoint}
        allPoints={allPoints}
        onClose={() => setSelectedPointId(null)}
        onRegisterAtPoint={handleRegisterAtPoint}
      />
    </div>
  );
}
