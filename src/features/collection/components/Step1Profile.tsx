'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/Combobox';
import { Field, inputClass } from '@/components/ui/Field';
import { Dropdown } from '@/components/ui/Dropdown';
import {
  AGE_GROUP_OPTIONS,
  NEURODIVERGENCE_OPTIONS,
  RESIDENCE_DURATION_OPTIONS,
} from '@/domain/constants';
import { profileSchema } from '@/domain/schemas';
import { useNeighborhoods } from '@/hooks/useNeighborhoods';
import { issuesToRecord } from '@/lib/zodUtils';
import { useCollectionStore } from '@/stores/collectionStore';

export function Step1Profile() {
  const profile = useCollectionStore((s) => s.profile);
  const updateProfile = useCollectionStore((s) => s.updateProfile);
  const setStep = useCollectionStore((s) => s.setStep);

  const { neighborhoods, loading } = useNeighborhoods();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const result = profileSchema.safeParse(profile);
    if (!result.success) {
      setErrors(issuesToRecord(result.error.issues));
      return;
    }
    setErrors({});
    setStep(2);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="type-display mb-1 text-2xl text-ink">1. Sobre você</h2>
        <p className="mb-2 text-xs font-semibold text-inkMuted">
          Todos os campos abaixo são obrigatórios para a pesquisa.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Field
          label="Nome ou apelido"
          required
          htmlFor="profile-name"
          error={errors.name}
        >
          <input
            id="profile-name"
            type="text"
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
            placeholder="Como deseja ser chamado(a)"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Faixa etária" required htmlFor="profile-age" error={errors.ageGroup}>
            <Dropdown
              id="profile-age"
              value={profile.ageGroup}
              onChange={(value) => updateProfile({ ageGroup: value })}
              placeholder="Selecione..."
              options={AGE_GROUP_OPTIONS.map((option) => ({
                value: option,
                label: option,
              }))}
            />
          </Field>

          <Field
            label="Onde mora (Fortaleza)"
            required
            htmlFor="profile-neighborhood"
            error={errors.neighborhood}
            hint={loading ? 'Carregando bairros...' : 'Digite para buscar o bairro.'}
          >
            <Combobox
              id="profile-neighborhood"
              value={profile.neighborhood}
              onChange={(neighborhood) => updateProfile({ neighborhood })}
              options={neighborhoods}
              placeholder="Digite o nome do bairro..."
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Tempo de Moradia"
            required
            htmlFor="profile-duration"
            error={errors.residenceDuration}
          >
            <Dropdown
              id="profile-duration"
              value={profile.residenceDuration}
              onChange={(value) => updateProfile({ residenceDuration: value })}
              placeholder="Selecione o período..."
              options={RESIDENCE_DURATION_OPTIONS.map((option) => ({
                value: option,
                label: option,
              }))}
            />
          </Field>

          <Field
            label="Condição / Percepção"
            required
            htmlFor="profile-neuro"
            error={errors.neurodivergenceStatus}
            hint="Informa sobre neurodivergências ou condições sensoriais para inclusão urbana."
          >
            <Dropdown
              id="profile-neuro"
              value={profile.neurodivergenceStatus}
              onChange={(value) => updateProfile({ neurodivergenceStatus: value })}
              placeholder="Selecione..."
              options={NEURODIVERGENCE_OPTIONS.map((option) => ({
                value: option,
                label: option,
              }))}
            />
          </Field>
        </div>

        <Field
          label="Nota sensorial ou de mobilidade"
          required
          htmlFor="profile-sensory"
          error={errors.sensoryMobilityNotes}
        >
          <input
            id="profile-sensory"
            type="text"
            value={profile.sensoryMobilityNotes}
            onChange={(e) => updateProfile({ sensoryMobilityNotes: e.target.value })}
            placeholder="Ex: Sensibilidade a ruídos..."
            className={inputClass}
          />
        </Field>
      </div>

      <Button onClick={handleNext} size="lg" className="mt-auto">
        PRÓXIMO <ArrowRight size={18} />
      </Button>
    </div>
  );
}
