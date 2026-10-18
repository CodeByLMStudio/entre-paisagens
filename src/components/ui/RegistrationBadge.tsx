import { MapPin, MousePointerClick, Search } from 'lucide-react';
import type { LocationSource } from '@/domain/types';
import { cn } from '@/lib/utils';

interface RegistrationBadgeProps {
  locationSource?: LocationSource;
  isOnSite?: boolean;
  className?: string;
}

/**
 * Identifica, na visualização de um relato, se ele foi registrado no próprio
 * local ou à distância (marcação no mapa/endereço pesquisado).
 */
export function RegistrationBadge({
  locationSource,
  isOnSite,
  className,
}: RegistrationBadgeProps) {
  const config = isOnSite
    ? {
        label: 'Registrado no local',
        Icon: MapPin,
        classes: 'border-moss/30 bg-moss/10 text-moss',
      }
    : locationSource === 'address'
      ? {
          label: 'Endereço pesquisado',
          Icon: Search,
          classes: 'border-clay/30 bg-clay/10 text-clayDark',
        }
      : {
          label: 'Marcado no mapa',
          Icon: MousePointerClick,
          classes: 'border-sand bg-paper2 text-inkMuted',
        };

  const { label, Icon, classes } = config;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide',
        classes,
        className,
      )}
      title={label}
    >
      <Icon size={10} /> {label}
    </span>
  );
}
