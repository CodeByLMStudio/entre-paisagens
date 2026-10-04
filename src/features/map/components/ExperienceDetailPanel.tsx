'use client';

import { Building, Clock, MapPin, Mic, Plus, X } from 'lucide-react';
import { ZoomableImage } from '@/components/ui/ZoomableImage';
import { EIXO_COLORS } from '@/domain/constants';
import type { Experience, MapPoint } from '@/domain/types';
import { formatAddressDetail, formatDate } from '@/lib/utils';

interface ExperienceDetailPanelProps {
  point: MapPoint;
  onClose: () => void;
  onRegisterAtPoint: () => void;
}

export function ExperienceDetailPanel({
  point,
  onClose,
  onRegisterAtPoint,
}: ExperienceDetailPanelProps) {
  const latest = point.experiences[0];
  const color = latest ? EIXO_COLORS[latest.eixo] : '#A36437';
  const total = point.experiences.length;

  return (
    <aside className="z-[50] flex max-h-[55vh] w-full flex-col border-t border-sand bg-white shadow-[-10px_0_20px_rgba(0,0,0,0.05)] transition-all md:h-full md:max-h-full md:w-96 md:border-l md:border-t-0">
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
                {point.streetName || 'Local no mapa'}
              </h3>
              {formatAddressDetail(point) && (
                <p className="text-xs text-inkMuted">Nº/Ref.: {formatAddressDetail(point)}</p>
              )}
              {point.locationNeighborhood && (
                <p className="text-xs font-semibold text-moss">
                  Bairro: {point.locationNeighborhood}
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
        <div className="flex flex-col gap-4">
          {point.experiences.map((experience) => (
            <ExperienceEntry key={experience.id} experience={experience} />
          ))}
        </div>
      </div>
    </aside>
  );
}

function ExperienceEntry({ experience }: { experience: Experience }) {
  const color = EIXO_COLORS[experience.eixo];
  const photoUrl =
    experience.photoUrl ??
    (experience.mediaType === 'photo' ? experience.mediaUrl ?? null : null);
  const audioUrl =
    experience.audioUrl ??
    (experience.mediaType === 'audio' ? experience.mediaUrl ?? null : null);

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
          <div
            className="mt-1 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
          >
            {experience.eixo}
          </div>
        </div>
      </div>

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
