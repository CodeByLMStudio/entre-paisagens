import { Building, ExternalLink } from 'lucide-react';
import { RegistrationBadge } from '@/components/ui/RegistrationBadge';
import { EIXO_COLORS } from '@/domain/constants';
import type { Experience } from '@/domain/types';
import { getCityLabel } from '@/lib/brazilLocations';
import { formatAddressDetail, formatDate } from '@/lib/utils';

interface ExperienceCardProps {
  experience: Experience;
  onSelect: (experience: Experience) => void;
}

export function ExperienceCard({ experience, onSelect }: ExperienceCardProps) {
  const color = EIXO_COLORS[experience.eixo];

  return (
    <div
      onClick={() => onSelect(experience)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(experience);
        }
      }}
      className="group flex cursor-pointer flex-col gap-4 rounded-2xl border-2 border-sand bg-white p-5 shadow-sm transition-all hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full font-black text-white"
            style={{ backgroundColor: color }}
          >
            {experience.profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-ink">
              {experience.profile.name}
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-inkMuted">
              {[experience.profile.neighborhood, getCityLabel(experience.profile.city)]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div
            className="rounded px-2 py-1 text-[9px] font-black uppercase"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {experience.eixo}
          </div>
          <RegistrationBadge
            locationSource={experience.locationSource}
            isOnSite={experience.isOnSite}
          />
        </div>
      </div>

      {experience.streetName && (
        <div className="flex items-center gap-1 rounded-lg bg-paper p-2 text-xs font-semibold text-inkMuted">
          <Building size={12} className="text-clay" />
          <span className="truncate">
            {experience.streetName}
            {formatAddressDetail(experience)
              ? ` (${formatAddressDetail(experience)})`
              : ''}
          </span>
        </div>
      )}

      <p
        className="line-clamp-3 rounded-xl border-l-2 bg-paper p-3 text-xs font-medium italic text-ink"
        style={{ borderColor: color }}
      >
        &ldquo;{experience.proposal}&rdquo;
      </p>

      <div className="mt-auto flex flex-wrap gap-1 pt-2">
        {experience.dimensions.slice(0, 3).map((dimension) => (
          <span
            key={dimension}
            className="rounded bg-paper2 px-1.5 py-0.5 text-[9px] font-bold text-inkMuted"
          >
            {dimension}
          </span>
        ))}
        {experience.dimensions.length > 3 && (
          <span className="rounded bg-sand/30 px-1.5 py-0.5 text-[9px] font-bold text-inkMuted">
            +{experience.dimensions.length - 3}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-paper2 pt-3">
        <span className="text-[10px] font-semibold text-clay">
          {formatDate(experience.date)}
        </span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-ink transition-colors group-hover:text-clay">
          Ver no mapa <ExternalLink size={12} />
        </span>
      </div>
    </div>
  );
}
