'use client';

import { useMemo } from 'react';
import { Eye, History } from 'lucide-react';
import { AudioPlayButton } from '@/components/ui/AudioPlayButton';
import { RegistrationBadge } from '@/components/ui/RegistrationBadge';
import { Modal } from '@/components/ui/Modal';
import { ZoomableImage } from '@/components/ui/ZoomableImage';
import { EIXO_COLORS } from '@/domain/constants';
import type { Experience, MapPoint } from '@/domain/types';
import { getCityLabel } from '@/lib/brazilLocations';
import { getExperienceMedia } from '@/lib/experienceMedia';
import { getExperiencesOnSameStreet, streetKey } from '@/lib/points';
import { formatAddressDetail, formatDate } from '@/lib/utils';

interface ExperienceHistoryModalProps {
  /** Histórico consultado quando não se conhece os demais pontos do mapa. */
  experiences: Experience[];
  point: MapPoint;
  allPoints: MapPoint[];
  open: boolean;
  onClose: () => void;
}

const thClass =
  'whitespace-nowrap border-b border-sand bg-paper2 px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-wider text-inkMuted';
const tdClass = 'border-b border-paper2 px-3 py-3 align-top text-ink';

export function ExperienceHistoryModal({
  experiences,
  point,
  allPoints,
  open,
  onClose,
}: ExperienceHistoryModalProps) {
  // Histórico por rua: reúne também os registros de outras marcações do mapa
  // que pertencem ao mesmo logradouro.
  const streetExperiences = useMemo(() => {
    const fromPoints = allPoints.length > 0 ? getExperiencesOnSameStreet(allPoints, point) : [];

    // Garante que os relatos do próprio ponto estejam sempre presentes.
    const byId = new Map<string, Experience>();
    for (const experience of [...experiences, ...fromPoints]) {
      byId.set(experience.id, experience);
    }
    return [...byId.values()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [allPoints, point, experiences]);

  const sameStreet = streetKey(point) !== '';
  const otherPoints = useMemo(() => {
    if (!sameStreet) return 0;
    const key = streetKey(point);
    return allPoints.filter(
      (candidate) => candidate.pointId !== point.pointId && streetKey(candidate) === key,
    ).length;
  }, [allPoints, point, sameStreet]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <History size={18} className="text-clay" />
          HISTÓRICO DE EXPERIÊNCIAS
        </span>
      }
      className="max-w-[1100px]"
    >
      <div className="flex flex-col gap-4 p-5 md:p-6">
        <div className="text-xs font-semibold text-inkMuted">
          <p className="text-sm font-bold text-ink">
            {point.streetName || 'Local no mapa'}
          </p>
          {formatAddressDetail(point) && (
            <p>Referência: {formatAddressDetail(point)}</p>
          )}
          {point.locationNeighborhood && <p>Bairro: {point.locationNeighborhood}</p>}
          <p className="mt-1">
            {streetExperiences.length}{' '}
            {streetExperiences.length === 1
              ? 'experiência registrada'
              : 'experiências registradas'}{' '}
            {sameStreet ? 'neste logradouro.' : 'neste local.'}
          </p>
          {otherPoints > 0 && (
            <p className="mt-0.5">
              Inclui {otherPoints}{' '}
              {otherPoints === 1 ? 'outra marcação' : 'outras marcações'} da mesma rua.
            </p>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-sand">
          <table className="w-full min-w-[920px] border-collapse text-left text-xs">
            <caption className="sr-only">
              Histórico de experiências registradas em{' '}
              {point.streetName || 'local no mapa'}
            </caption>
            <thead>
              <tr>
                <th className={thClass}>Data</th>
                <th className={thClass}>Participante</th>
                <th className={thClass}>Registro</th>
                <th className={thClass}>Eixo</th>
                <th className={thClass}>Relação</th>
                <th className={thClass}>Dimensões</th>
                <th className={thClass}>Relato</th>
                <th className={thClass}>Facilita / Dificulta</th>
                <th className={thClass}>Localização</th>
                <th className={`${thClass} text-center`}>Mídias</th>
              </tr>
            </thead>
            <tbody>
              {streetExperiences.map((experience) => (
                <HistoryRow
                  key={experience.id}
                  experience={experience}
                  currentPointId={point.pointId}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

function HistoryRow({
  experience,
  currentPointId,
}: {
  experience: Experience;
  currentPointId: string;
}) {
  const color = EIXO_COLORS[experience.eixo];
  const { photoUrl, audioUrl } = getExperienceMedia(experience);
  const isCurrentPoint = experience.pointId === currentPointId;

  return (
    <tr className={isCurrentPoint ? 'bg-paper' : undefined}>
      <td className={`${tdClass} whitespace-nowrap`}>{formatDate(experience.date)}</td>
      <td className={tdClass}>
        <p className="font-bold">{experience.profile.name}</p>
        <p className="text-[10px] text-inkMuted">
          {experience.profile.ageGroup} &middot;{' '}
          {[experience.profile.neighborhood, getCityLabel(experience.profile.city)]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {experience.profile.conditions.length > 0 && (
          <p className="mt-1 max-w-[190px] text-[10px] leading-snug text-inkMuted">
            Condição/Percepção: {experience.profile.conditions.join(', ')}
          </p>
        )}
      </td>
      <td className={tdClass}>
        <RegistrationBadge
          locationSource={experience.locationSource}
          isOnSite={experience.isOnSite}
        />
      </td>
      <td className={tdClass}>
        <span
          className="inline-block rounded px-2 py-1 text-[10px] font-black uppercase tracking-wider"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {experience.eixo}
        </span>
      </td>
      <td className={tdClass}>
        <p className="font-semibold">{experience.relation}</p>
        {experience.relation === 'Outra' && experience.relationOther && (
          <p className="mt-1 max-w-[180px] text-[10px] text-inkMuted">
            {experience.relationOther}
          </p>
        )}
      </td>
      <td className={tdClass}>
        <p className="max-w-[190px] leading-snug">{experience.dimensions.join(', ')}</p>
      </td>
      <td className={tdClass}>
        <p className="max-w-[320px] whitespace-pre-line leading-relaxed">
          &ldquo;{experience.proposal}&rdquo;
        </p>
      </td>
      <td className={tdClass}>
        {experience.facilitators.length > 0 && (
          <p className="max-w-[180px] text-[10px] leading-snug">
            <span className="font-black text-moss">+ </span>
            {experience.facilitators.join(', ')}
          </p>
        )}
        {experience.difficulties.length > 0 && (
          <p className="mt-1 max-w-[180px] text-[10px] leading-snug">
            <span className="font-black text-clayDark">- </span>
            {experience.difficulties.join(', ')}
          </p>
        )}
        {experience.facilitators.length === 0 && experience.difficulties.length === 0 && (
          <span className="text-inkMuted">—</span>
        )}
      </td>
      <td className={tdClass}>
        <p className="max-w-[180px] font-semibold">
          {experience.streetName || 'Local no mapa'}
        </p>
        {formatAddressDetail(experience) && (
          <p className="mt-1 text-[10px] text-inkMuted">
            Ref.: {formatAddressDetail(experience)}
          </p>
        )}
        {experience.locationNeighborhood && (
          <p className="text-[10px] text-inkMuted">
            {experience.locationNeighborhood}
          </p>
        )}
      </td>
      <td className={tdClass}>
        <div className="flex items-center justify-center gap-2">
          {photoUrl ? (
            <ZoomableImage
              src={photoUrl}
              alt={`Foto do relato de ${experience.profile.name}`}
              triggerClassName="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sand bg-paper text-clay transition-colors hover:bg-paper2 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
              triggerTitle="Clique aqui para visualizar a imagem do relato"
            >
              <Eye size={15} />
            </ZoomableImage>
          ) : null}

          {audioUrl ? (
            <AudioPlayButton
              src={audioUrl}
              ariaLabel="Clique aqui para ouvir o áudio do relato"
              className="relative"
            />
          ) : null}

          {!photoUrl && !audioUrl && (
            <span className="text-[10px] font-semibold text-inkMuted">—</span>
          )}
        </div>
      </td>
    </tr>
  );
}
