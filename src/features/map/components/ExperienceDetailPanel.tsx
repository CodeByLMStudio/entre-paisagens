'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Building, Clock, History, MapPin, Mic, Plus, X } from 'lucide-react';
import { RegistrationBadge } from '@/components/ui/RegistrationBadge';
import { ZoomableImage } from '@/components/ui/ZoomableImage';
import { EIXO_COLORS } from '@/domain/constants';
import type { Experience, MapPoint } from '@/domain/types';
import { getExperienceMedia } from '@/lib/experienceMedia';
import { cn, formatAddressDetail, formatDate } from '@/lib/utils';
import { ExperienceHistoryModal } from './ExperienceHistoryModal';

/** Pilha de drawers de detalhamento (somente o mais recente fecha com Escape). */
const drawerStack: symbol[] = [];

interface ExperienceDetailPanelProps {
  /** Ponto selecionado; `null` mantém o drawer fechado. */
  point: MapPoint | null;
  allPoints: MapPoint[];
  onClose: () => void;
  onRegisterAtPoint: () => void;
}

/**
 * Detalhamento do ponto selecionado no mapa ("Relato da Comunidade"),
 * exibido como drawer lateral deslizante com animação de entrada/saída.
 */
export function ExperienceDetailPanel({
  point,
  allPoints,
  onClose,
  onRegisterAtPoint,
}: ExperienceDetailPanelProps) {
  const [renderedPoint, setRenderedPoint] = useState<MapPoint | null>(point);
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [drawerId] = useState(() => Symbol('drawer'));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Controla a animação de entrada e saída (mantém o conteúdo durante a saída).
  useEffect(() => {
    if (point) {
      setRenderedPoint(point);
      const frame = requestAnimationFrame(() => setOpen(true));
      return () => cancelAnimationFrame(frame);
    }

    setOpen(false);
    const timer = setTimeout(() => {
      setRenderedPoint(null);
      setHistoryOpen(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [point]);

  // Fecha com Escape e bloqueia o scroll de fundo enquanto o drawer está aberto.
  useEffect(() => {
    if (!open) return;

    drawerStack.push(drawerId);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (drawerStack[drawerStack.length - 1] !== drawerId) return;
      onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const index = drawerStack.lastIndexOf(drawerId);
      if (index >= 0) drawerStack.splice(index, 1);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, drawerId, onClose]);

  if (!renderedPoint) return null;

  const latest = renderedPoint.experiences[0];
  const color = latest ? EIXO_COLORS[latest.eixo] : '#A36437';
  const total = renderedPoint.experiences.length;

  const drawer = (
    <div
      className={cn(
        'fixed inset-0 z-[1900] flex justify-end bg-black/40 backdrop-blur-[2px] transition-opacity duration-300',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
      onClick={onClose}
      role="presentation"
    >
      <aside
        onClick={(event) => event.stopPropagation()}
        aria-label="Relato da Comunidade"
        className={cn(
          'flex h-full w-full flex-col border-l border-sand bg-white shadow-2xl transition-transform duration-300 ease-out sm:max-w-md',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-paper2 bg-paper p-4">
          <span className="type-display flex items-center gap-2 text-sm text-ink">
            <MapPin size={18} style={{ color }} />
            Relato da Comunidade
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-sand bg-white p-2 text-ink transition-colors hover:bg-paper2"
            aria-label="Fechar detalhes"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          {/* Cabeçalho do ponto com histórico */}
          <div className="rounded-2xl border border-sand bg-paper p-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-sand bg-paper2 text-lg font-black text-clay">
                {total}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-base font-semibold leading-tight text-ink">
                  {renderedPoint.streetName || 'Local no mapa'}
                </h3>
                {formatAddressDetail(renderedPoint) && (
                  <p className="text-xs text-inkMuted">
                    Referência: {formatAddressDetail(renderedPoint)}
                  </p>
                )}
                {renderedPoint.locationNeighborhood && (
                  <p className="text-xs font-semibold text-moss">
                    Bairro: {renderedPoint.locationNeighborhood}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-2 text-[11px] font-semibold text-inkMuted">
              {total === 1
                ? '1 experiência registrada neste local.'
                : `${total} experiências registradas neste local.`}
            </p>
            <button
              type="button"
              onClick={onRegisterAtPoint}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-clay px-3 py-2.5 text-xs font-bold text-paper shadow-sm transition-colors hover:bg-clayDark"
            >
              <Plus size={16} /> Registrar experiência neste local
            </button>
          </div>

          {/* Histórico de experiências do ponto */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="type-label text-[10px] text-inkMuted">Experiências</h3>
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-sand bg-paper px-2.5 py-1.5 text-[10px] font-bold text-clay transition-colors hover:bg-paper2"
              >
                <History size={13} /> Ver informações
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {renderedPoint.experiences.map((experience) => (
                <ExperienceEntry key={experience.id} experience={experience} />
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );

  // O histórico é renderizado fora do drawer (via portal no body) para ocupar
  // toda a largura/altura do dispositivo, e não apenas a área do painel.
  const history = (
    <ExperienceHistoryModal
      experiences={renderedPoint.experiences}
      point={renderedPoint}
      allPoints={allPoints}
      open={historyOpen}
      onClose={() => setHistoryOpen(false)}
    />
  );

  if (!mounted) {
    return (
      <>
        {drawer}
        {history}
      </>
    );
  }

  return (
    <>
      {createPortal(drawer, document.body)}
      {createPortal(history, document.body)}
    </>
  );
}

function ExperienceEntry({ experience }: { experience: Experience }) {
  const color = EIXO_COLORS[experience.eixo];
  const { photoUrl, audioUrl } = getExperienceMedia(experience);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-paper2 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-black text-white" style={{ backgroundColor: color }}>
          {experience.profile.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h4 className="font-display text-sm font-semibold text-ink">
            {experience.profile.name}
          </h4>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <div
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
            >
              {experience.eixo}
            </div>
            <RegistrationBadge
              locationSource={experience.locationSource}
              isOnSite={experience.isOnSite}
            />
          </div>
        </div>
      </div>

      {experience.relation === 'Outra' && experience.relationOther && (
        <p className="rounded-lg bg-paper px-2.5 py-2 text-[11px] font-semibold text-inkMuted">
          Relação com o espaço: {experience.relationOther}
        </p>
      )}

      {formatAddressDetail(experience) && (
        <div className="flex items-center gap-1.5 rounded-lg bg-paper px-2 py-1.5 text-xs font-semibold text-inkMuted">
          <Building size={12} className="text-clay" />
          {experience.streetName && <span className="truncate">{experience.streetName}</span>}
          {formatAddressDetail(experience)}
        </div>
      )}

      {(photoUrl || audioUrl) && (
        <div className="flex flex-col gap-2">
          {photoUrl && (
            <div className="overflow-hidden rounded-xl border border-paper2">
              <ZoomableImage src={photoUrl} alt="Registro visual" className="max-h-44 w-full object-cover" />
            </div>
          )}
          {audioUrl && (
            <div className="flex flex-col gap-1.5 rounded-xl border border-paper2 bg-paper p-2.5">
              <span className="type-label flex items-center gap-1 text-[10px] text-inkMuted">
                <Mic size={12} /> Áudio
              </span>
              <audio controls src={audioUrl} className="h-8 w-full" />
            </div>
          )}
        </div>
      )}

      <p
        className="rounded-xl border-l-4 bg-paper p-3 text-xs font-medium italic leading-relaxed text-ink"
        style={{ borderColor: color }}
      >
        &ldquo;{experience.proposal}&rdquo;
      </p>

      <div className="flex flex-wrap gap-1">
        {experience.dimensions.map((dimension) => (
          <span key={dimension} className="rounded-md border border-sand bg-paper2 px-1.5 py-0.5 text-[9px] font-semibold text-ink">
            {dimension}
          </span>
        ))}
      </div>

      {(experience.facilitators.length > 0 || experience.difficulties.length > 0) && (
        <div className="grid grid-cols-1 gap-2 border-t border-paper2 pt-2">
          {experience.facilitators.length > 0 && (
            <p className="text-[10px] font-medium text-ink">
              <span className="font-black text-moss">+ </span>
              {experience.facilitators.join(', ')}
            </p>
          )}
          {experience.difficulties.length > 0 && (
            <p className="text-[10px] font-medium text-ink">
              <span className="font-black text-clayDark">- </span>
              {experience.difficulties.join(', ')}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 text-[10px] font-semibold text-clay">
        <Clock size={11} /> Registrado em {formatDate(experience.date)}
      </div>
    </div>
  );
}
