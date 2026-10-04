'use client';

import { useRouter } from 'next/navigation';
import { MapPinOff } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import type { Experience } from '@/domain/types';
import { useExperienceStore } from '@/stores/experienceStore';
import { useMapStore } from '@/stores/mapStore';
import { ExperienceCard } from './ExperienceCard';
import { ReadingStats } from './ReadingStats';

export function ReadingView() {
  const experiences = useExperienceStore((s) => s.experiences);
  const hydrated = useExperienceStore((s) => s.hydrated);
  const setSelectedPointId = useMapStore((s) => s.setSelectedPointId);
  const router = useRouter();

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center bg-paper">
        <Spinner label="Carregando relatos..." />
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-paper p-8 text-center">
        <MapPinOff size={48} className="mb-4 text-sand" />
        <h2 className="mb-2 text-xl font-black text-ink">Nenhum relato registrado</h2>
        <p className="text-sm text-inkMuted">
          Os mapeamentos inseridos pela comunidade aparecerão aqui.
        </p>
      </div>
    );
  }

  const handleSelect = (experience: Experience) => {
    setSelectedPointId(experience.pointId || null);
    router.push('/mapa');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-paper p-6 md:p-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="type-display mb-2 text-3xl text-ink">Leitura da Paisagem</h1>
        <p className="mb-6 text-sm font-medium text-inkMuted">
          Catálogo de percepções coletadas no território urbano.
        </p>

        <ReadingStats experiences={experiences} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
