'use client';

import { useState } from 'react';
import { Info, Layers } from 'lucide-react';
import { EixoInfoModal } from '@/components/modals/EixoInfoModal';
import { EIXOS, EIXO_COLORS } from '@/domain/constants';
import type { Eixo } from '@/domain/types';

export function MapLegend() {
  const [open, setOpen] = useState(true);
  const [infoEixo, setInfoEixo] = useState<Eixo | null>(null);

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col items-end">
      {open ? (
        <div className="w-72 rounded-2xl border-2 border-sand bg-paper/95 p-4 text-ink shadow-xl backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between border-b border-sand pb-2">
            {/* Título da legenda — Montserrat SemiBold, caixa alta, tracking 1,5–2pt */}
            <div className="type-label flex items-center gap-1.5 text-[10px]">
              <Layers size={14} className="text-clay" />
              <span>Legenda - Mapa</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-inkMuted hover:text-ink"
            >
              &times; Ocultar
            </button>
          </div>

          <div className="flex flex-col gap-3 text-xs font-medium">
            {EIXOS.map((eixo) => (
              <div key={eixo} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-paper"
                    style={{ backgroundColor: EIXO_COLORS[eixo] }}
                  />
                  <span className="font-bold text-ink">{eixo}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoEixo(eixo)}
                  className="type-alt flex items-center gap-1 rounded-full p-1 text-[10px] font-medium text-clay transition-colors hover:bg-paper2"
                  title={`Ver explicação do eixo ${eixo}`}
                >
                  <Info size={14} />
                  <span>Detalhes</span>
                </button>
              </div>
            ))}

            <div className="mt-1 flex flex-col gap-2 border-t border-sand pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 shrink-0 rounded-full border-t-4 border-moss" />
                <span className="text-ink">vias principais</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 shrink-0 border-t-2 border-clay" />
                <span className="text-ink">vias secundárias</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-8 shrink-0 rounded-[3px] border border-clay/30 bg-sand" />
                <span className="text-ink">edificações</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-8 shrink-0 rounded-[3px] bg-moss" />
                <span className="text-ink">áreas verdes</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="type-label flex items-center gap-2 rounded-xl border-2 border-sand bg-paper/95 px-3.5 py-2 text-[10px] text-ink shadow-lg backdrop-blur-md hover:bg-paper2"
        >
          <Layers size={14} className="text-clay" />
          <span>Legenda - Mapa</span>
        </button>
      )}

      <EixoInfoModal eixo={infoEixo} onClose={() => setInfoEixo(null)} />
    </div>
  );
}
