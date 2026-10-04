'use client';

import { useState } from 'react';
import { Filter, Info, X } from 'lucide-react';
import { EixoInfoModal } from '@/components/modals/EixoInfoModal';
import {
  EIXOS,
  EIXO_COLORS,
  LANDSCAPE_DIMENSIONS_LIST,
} from '@/domain/constants';
import type { Eixo, LandscapeDimension } from '@/domain/types';
import { DIMENSION_ICONS } from '@/lib/dimensionIcons';
import { cn } from '@/lib/utils';
import { useMapStore } from '@/stores/mapStore';

interface FilterSidebarProps {
  filteredCount: number;
  /** Contagem de experiências por dimensão paisagística. */
  dimensionCounts: Record<LandscapeDimension, number>;
  open: boolean;
  onClose: () => void;
}

export function FilterSidebar({
  filteredCount,
  dimensionCounts,
  open,
  onClose,
}: FilterSidebarProps) {
  const activeEixo = useMapStore((s) => s.activeEixo);
  const setActiveEixo = useMapStore((s) => s.setActiveEixo);
  const activeDimensions = useMapStore((s) => s.activeDimensions);
  const toggleDimension = useMapStore((s) => s.toggleDimension);
  const clearDimensions = useMapStore((s) => s.clearDimensions);
  const [infoEixo, setInfoEixo] = useState<Eixo | null>(null);

  return (
    <>
      {/* Backdrop do drawer (web e mobile) */}
      <div
        className={cn(
          'fixed inset-0 z-[1400] bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-[1500] flex w-80 shrink-0 flex-col gap-6 overflow-y-auto border-r border-sand bg-cream p-6 shadow-2xl transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-ink">
              <Filter size={19} className="stroke-[2.5]" />
              <h2 className="type-display text-[15px] text-ink">Filtros do Mapa</h2>
            </div>
            <p className="mt-1 text-xs font-semibold text-inkMuted">
              {filteredCount}{' '}
              {filteredCount === 1 ? 'ponto encontrado' : 'pontos encontrados'} em
              Fortaleza.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-sand bg-white/60 p-1.5 text-inkMuted hover:text-ink"
            aria-label="Fechar filtros"
          >
            <X size={20} />
          </button>
        </div>

        <div>
          <label className="type-label mb-3 block text-xs text-inkMuted">
            FILTRAR POR EIXO
          </label>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setActiveEixo('ALL')}
              className={cn(
                'w-full rounded-2xl px-4 py-3 text-center text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all',
                activeEixo === 'ALL'
                  ? 'bg-inkDark text-white shadow-md'
                  : 'border-2 border-sand bg-white text-ink hover:bg-paper2',
              )}
            >
              TODOS OS EIXOS
            </button>

            {EIXOS.map((eixo) => {
              const isSelected = activeEixo === eixo;
              return (
                <div key={eixo} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveEixo(eixo)}
                    className={cn(
                      'flex flex-1 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all',
                      isSelected
                        ? 'border-inkDark bg-inkDark text-white shadow-md'
                        : 'border-sand bg-white text-ink hover:bg-paper2',
                    )}
                  >
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: EIXO_COLORS[eixo] }}
                    />
                    <span>{eixo}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInfoEixo(eixo)}
                    className="rounded-2xl border-2 border-sand bg-white p-2.5 text-clay transition-colors hover:bg-paper2"
                    title={`Explicar eixo ${eixo}`}
                    aria-label={`Explicar eixo ${eixo}`}
                  >
                    <Info size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="type-label block text-xs text-inkMuted">
              DIMENSÃO PAISAGÍSTICA
            </label>
            {activeDimensions.length > 0 && (
              <button
                type="button"
                onClick={clearDimensions}
                className="text-[10px] font-bold text-clay underline hover:text-clayDark"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            {LANDSCAPE_DIMENSIONS_LIST.map((dimension) => {
              const Icon = DIMENSION_ICONS[dimension];
              const isSelected = activeDimensions.includes(dimension);
              const count = dimensionCounts[dimension] ?? 0;
              return (
                <button
                  key={dimension}
                  type="button"
                  onClick={() => toggleDimension(dimension)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left text-xs font-semibold transition-all',
                    isSelected
                      ? 'border-clay bg-clay text-paper shadow-sm'
                      : 'border-sand bg-white text-ink hover:bg-paper2',
                  )}
                >
                  <Icon
                    size={16}
                    className={cn('shrink-0', isSelected ? 'text-paper' : 'text-clay')}
                  />
                  <span className="flex-1 leading-tight">{dimension}</span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                      isSelected
                        ? 'bg-paper/20 text-paper'
                        : 'bg-paper2 text-inkMuted',
                    )}
                  >
                    {count}
                  </span>
                  {isSelected && <span className="text-sm leading-none">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <EixoInfoModal eixo={infoEixo} onClose={() => setInfoEixo(null)} />
    </>
  );
}
