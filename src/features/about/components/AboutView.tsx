'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { EixoInfoModal } from '@/components/modals/EixoInfoModal';
import { EIXOS, EIXO_COLORS, EIXO_DESCRIPTIONS } from '@/domain/constants';
import type { Eixo } from '@/domain/types';

export function AboutView() {
  const [infoEixo, setInfoEixo] = useState<Eixo | null>(null);

  return (
    <div className="flex-1 overflow-y-auto bg-paper p-6 md:p-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl border-2 border-sand bg-white p-8 shadow-xl md:p-12">
        <div className="flex items-center justify-between border-b border-paper2 pb-4">
          <div>
            <span className="type-label text-xs text-clay">
              Metodologia &amp; Projeto
            </span>
            <h1 className="type-display text-3xl text-ink">Sobre o Entre Paisagens</h1>
          </div>
          <Link
            href="/mapa"
            className="rounded-xl border border-sand bg-paper px-4 py-2 text-xs font-bold text-ink hover:bg-paper2"
          >
            Voltar ao Mapa
          </Link>
        </div>

        <div className="flex flex-col gap-4 text-sm leading-relaxed text-ink">
          <p className="font-medium">
            O <strong>Entre Paisagens</strong> é uma plataforma de mapeamento
            participativo e leitura urbana focada em Fortaleza. O projeto busca dar
            visibilidade à experiência cotidiana dos cidadãos, mapeando dimensões
            ambientais, sensoriais, sociais e espaciais.
          </p>

          <h3 className="type-display mt-2 text-lg text-ink">
            Os Quatro Eixos Cartográficos
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {EIXOS.map((eixo) => (
              <div
                key={eixo}
                className="relative flex flex-col gap-2 rounded-2xl border border-sand bg-paper p-4"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-black uppercase"
                    style={{ color: EIXO_COLORS[eixo] }}
                  >
                    {eixo}
                  </span>
                  <button
                    type="button"
                    onClick={() => setInfoEixo(eixo)}
                    className="flex items-center gap-1 rounded-lg border border-sand bg-white p-1.5 text-[10px] font-bold text-clay transition-colors hover:bg-paper2"
                  >
                    <Info size={14} /> Detalhes
                  </button>
                </div>
                <p className="text-xs text-inkMuted">{EIXO_DESCRIPTIONS[eixo]}</p>
              </div>
            ))}
          </div>

          <h3 className="type-display mt-2 text-lg text-ink">Objetivo</h3>
          <p className="font-medium">
            Subsidiary políticas públicas, diagnósticos urbanos e ações comunitárias
            através da coleta de relatos qualitativos diretamente de moradores e
            visitantes por toda a cidade de Fortaleza.
          </p>
        </div>
      </div>

      <EixoInfoModal eixo={infoEixo} onClose={() => setInfoEixo(null)} />
    </div>
  );
}
