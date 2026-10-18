'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { Dropdown } from '@/components/ui/Dropdown';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import {
  AGE_GROUP_OPTIONS,
  CONDITION_OPTIONS,
  RESIDENCE_DURATION_OPTIONS,
} from '@/domain/constants';
import { profileSchema } from '@/domain/schemas';
import { useCityNeighborhoods } from '@/hooks/useCityNeighborhoods';
import {
  BRAZIL_STATES,
  getCityLabel,
  getCityOptionsForState,
  getStateName,
} from '@/lib/brazilLocations';
import { issuesToRecord } from '@/lib/zodUtils';
import { useCollectionStore } from '@/stores/collectionStore';
import { NameField } from './NameField';
import { StepLayout } from './StepLayout';

export function Step1Profile() {
  const profile = useCollectionStore((s) => s.profile);
  const updateProfile = useCollectionStore((s) => s.updateProfile);
  const setStep = useCollectionStore((s) => s.setStep);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nameModalOpen, setNameModalOpen] = useState(false);

  // Bairros da cidade selecionada (OpenStreetMap/Overpass).
  const { neighborhoods, loading: neighborhoodsLoading } = useCityNeighborhoods(
    profile.city,
    Boolean(profile.city),
  );

  const cityOptions = useMemo(
    () => getCityOptionsForState(profile.state),
    [profile.state],
  );

  const neighborhoodOptions = useMemo(() => {
    const merged = new Set<string>([...neighborhoods]);
    if (profile.neighborhood) merged.add(profile.neighborhood);

    return [...merged].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [neighborhoods, profile.neighborhood]);

  const clearErrors = (...fields: string[]) => {
    if (fields.length === 0) return;
    setErrors((current) => {
      const next = { ...current };
      for (const field of fields) delete next[field];
      return next;
    });
  };

  const handleNext = () => {
    const result = profileSchema.safeParse(profile);
    if (!result.success) {
      setErrors(issuesToRecord(result.error.issues));
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleStateChange = (sigla: string) => {
    if (profile.state === sigla) return;
    // Trocar o estado invalida a cidade e o bairro escolhidos anteriormente.
    updateProfile({ state: sigla, city: '', neighborhood: '' });
    clearErrors('state', 'city', 'neighborhood');
  };

  const handleCityChange = (city: string) => {
    if (profile.city === city) return;
    updateProfile({ city, neighborhood: '' });
    clearErrors('city', 'neighborhood');
  };

  const handleConditionChange = (condition: string) => {
    updateProfile({ conditions: condition ? [condition] : [] });
    clearErrors('conditions');
  };

  return (
    <StepLayout
      footer={
        <Button onClick={handleNext} size="lg" className="w-full">
          PRÓXIMO <ArrowRight size={18} />
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="type-display mb-1 text-2xl text-ink">1. Sobre você</h2>
          <p className="mb-2 text-xs font-semibold text-inkMuted">
            Todos os campos abaixo são obrigatórios para a pesquisa.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NameField
              modal={nameModalOpen}
              name={profile.name}
              isAnonymous={profile.isAnonymous === true}
              error={errors.name}
              onModalChange={setNameModalOpen}
              onChangeName={(name) => updateProfile({ name })}
              onChangeAnonymous={(isAnonymous) => updateProfile({ isAnonymous })}
            />

            <Field
              label="Faixa etária"
              required
              htmlFor="profile-age"
              error={errors.ageGroup}
            >
              <Dropdown
                id="profile-age"
                value={profile.ageGroup}
                onChange={(value) => {
                  updateProfile({ ageGroup: value });
                  clearErrors('ageGroup');
                }}
                placeholder="Selecione..."
                options={AGE_GROUP_OPTIONS.map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Estado" required error={errors.state}>
              <SearchableSelect
                id="profile-state"
                value={profile.state ? getStateName(profile.state) : ''}
                onChange={(stateName) => {
                  const state = BRAZIL_STATES.find((item) => item.nome === stateName);
                  if (state) handleStateChange(state.sigla);
                }}
                options={BRAZIL_STATES.map((state) => state.nome)}
                placeholder="Selecione o estado..."
                searchPlaceholder="Buscar estado..."
                emptyMessage="Nenhum estado encontrado."
              />
            </Field>

            <Field
              label="Cidade"
              required
              error={errors.city}
              hint={
                profile.state
                  ? 'Digite para filtrar os municípios do estado.'
                  : 'Selecione primeiro o estado.'
              }
            >
              <SearchableSelect
                id="profile-city"
                value={profile.city}
                onChange={handleCityChange}
                options={cityOptions}
                placeholder={
                  profile.state ? 'Selecione a cidade...' : 'Estado não selecionado'
                }
                searchPlaceholder="Buscar cidade..."
                emptyMessage="Nenhuma cidade encontrada."
                allowCustomValue
                formatOption={getCityLabel}
                disabled={!profile.state}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Bairro"
              required
              error={errors.neighborhood}
              hint={
                profile.city
                  ? neighborhoodsLoading
                    ? 'Carregando bairros...'
                    : 'Busque o bairro da cidade.'
                  : 'Selecione primeiro a cidade.'
              }
            >
              <SearchableSelect
                id="profile-neighborhood"
                value={profile.neighborhood}
                onChange={(neighborhood) => {
                  updateProfile({ neighborhood });
                  clearErrors('neighborhood');
                }}
                options={neighborhoodOptions}
                placeholder={
                  profile.city ? 'Selecione o bairro...' : 'Cidade não selecionada'
                }
                searchPlaceholder="Buscar bairro..."
                emptyMessage={
                  profile.city
                    ? 'Nenhum bairro encontrado. Digite o nome e use a opção "Usar..." para informar manualmente.'
                    : 'Selecione primeiro a cidade.'
                }
                allowCustomValue
                disabled={!profile.city}
              />
            </Field>

            <Field
              label="Tempo de Moradia"
              required
              htmlFor="profile-duration"
              error={errors.residenceDuration}
            >
              <Dropdown
                id="profile-duration"
                value={profile.residenceDuration}
                onChange={(value) => {
                  updateProfile({ residenceDuration: value });
                  clearErrors('residenceDuration');
                }}
                placeholder="Selecione o período..."
                options={RESIDENCE_DURATION_OPTIONS.map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
            </Field>
          </div>

          <Field
            label="Condição/Percepção"
            required
            error={errors.conditions}
            hint="Você se identifica com alguma dessas condições abaixo? Selecione uma opção."
          >
            <Dropdown
              id="profile-condition"
              value={profile.conditions[0] ?? ''}
              onChange={handleConditionChange}
              placeholder="Selecione..."
              options={CONDITION_OPTIONS.map((condition) => ({
                value: condition,
                label: condition,
              }))}
            />
          </Field>

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
      </div>
    </StepLayout>
  );
}
