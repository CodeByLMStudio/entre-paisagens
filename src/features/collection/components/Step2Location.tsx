'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { Dropdown } from '@/components/ui/Dropdown';
import { EixoInfoModal } from '@/components/modals/EixoInfoModal';
import {
  DIFFICULTIES_LIST,
  EIXOS,
  EIXO_COLORS,
  FACILITATORS_LIST,
  LANDSCAPE_DIMENSIONS_LIST,
  RELACOES,
} from '@/domain/constants';
import { step2Schema } from '@/domain/schemas';
import type { Eixo, LandscapeDimension } from '@/domain/types';
import { cn } from '@/lib/utils';
import { issuesToRecord } from '@/lib/zodUtils';
import { useCollectionStore } from '@/stores/collectionStore';
import { StepLayout } from './StepLayout';

function toggleItem<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function Step2Location() {
  const form = useCollectionStore((s) => s.form);
  const updateForm = useCollectionStore((s) => s.updateForm);
  const setStep = useCollectionStore((s) => s.setStep);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [infoEixo, setInfoEixo] = useState<Eixo | null>(null);
  const [facilitatorValue, setFacilitatorValue] = useState('');
  const [difficultyValue, setDifficultyValue] = useState('');

  const toggleDimensions = (dimension: LandscapeDimension) =>
    updateForm({ dimensions: toggleItem(form.dimensions, dimension) });

  const toggleFacilitators = (facilitator: string) =>
    updateForm({ facilitators: toggleItem(form.facilitators, facilitator) });

  const toggleDifficulties = (difficulty: string) =>
    updateForm({ difficulties: toggleItem(form.difficulties, difficulty) });

  const handleNext = () => {
    const result = step2Schema.safeParse({
      relation: form.relation,
      relationOther: form.relationOther,
      eixo: form.eixo,
      dimensions: form.dimensions,
    });
    if (!result.success) {
      setErrors(issuesToRecord(result.error.issues));
      return;
    }
    setErrors({});
    setStep(3);
  };

  return (
    <StepLayout
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
            VOLTAR
          </Button>
          <Button onClick={handleNext} className="flex-1">
            PRÓXIMO
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
      <div>
        <h2 className="type-display mb-1 text-2xl text-ink">2. Sobre o lugar</h2>
        <p className="text-xs font-semibold text-inkMuted">
          Classifique a experiência e os elementos do local.
        </p>
      </div>

      <Field label="Relação com o espaço" required htmlFor="step2-relation" error={errors.relation}>
        <Dropdown
          id="step2-relation"
          value={form.relation}
          onChange={(value) => updateForm({ relation: value as typeof form.relation })}
          options={RELACOES.map((relation) => ({ value: relation, label: relation }))}
        />
      </Field>

      {form.relation === 'Outra' && (
        <Field
          label="Explique sua relação com o espaço"
          required
          htmlFor="step2-relation-other"
          error={errors.relationOther}
        >
          <textarea
            id="step2-relation-other"
            rows={3}
            value={form.relationOther}
            onChange={(e) => updateForm({ relationOther: e.target.value })}
            placeholder="Conte como você se relaciona com este lugar..."
            className={`${inputClass} resize-none`}
          />
        </Field>
      )}

      <div>
        <label className="type-label mb-1.5 block text-xs text-inkMuted">
          Eixo da experiência *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {EIXOS.map((eixo) => (
            <div key={eixo} className="relative flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => updateForm({ eixo })}
                className={cn(
                  'flex flex-1 items-center justify-between rounded-xl border-2 p-3.5 text-left text-sm font-bold transition-colors',
                  form.eixo === eixo
                    ? 'border-ink bg-ink text-paper'
                    : 'border-sand bg-white text-ink hover:bg-paper2',
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: EIXO_COLORS[eixo] }}
                  />
                  {eixo}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setInfoEixo(eixo)}
                className="rounded-xl border-2 border-sand bg-white p-3 text-clay transition-colors hover:bg-paper2"
                title={`Explicar eixo ${eixo}`}
                aria-label={`Explicar eixo ${eixo}`}
              >
                <Info size={16} />
              </button>
            </div>
          ))}
        </div>
        {errors.eixo && (
          <span role="alert" className="mt-1 block text-[11px] font-bold text-clayDark">
            {errors.eixo}
          </span>
        )}
      </div>

      <div>
        <label className="type-label mb-1.5 block text-xs text-inkMuted">
          Dimensões paisagísticas associadas *
        </label>
        <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto rounded-xl border-2 border-sand bg-white p-2">
          {LANDSCAPE_DIMENSIONS_LIST.map((dimension) => {
            const isSelected = form.dimensions.includes(dimension);
            return (
              <button
                key={dimension}
                type="button"
                onClick={() => toggleDimensions(dimension)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors',
                  isSelected
                    ? 'border-clay bg-clay text-paper'
                    : 'border-sand bg-paper2/40 text-ink hover:bg-paper2',
                )}
              >
                <span>{dimension}</span>
                <span className="text-[10px] opacity-75">{isSelected ? '✓' : '+'}</span>
              </button>
            );
          })}
        </div>
        {errors.dimensions && (
          <span role="alert" className="mt-1 block text-[11px] font-bold text-clayDark">
            {errors.dimensions}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="type-label mb-1 block text-xs text-inkMuted">
            O que facilita? *
          </label>
          <Dropdown
            value={facilitatorValue}
            onChange={(value) => {
              if (value) toggleFacilitators(value);
              setFacilitatorValue('');
            }}
            placeholder="Adicionar..."
            options={FACILITATORS_LIST.map((facilitator) => ({
              value: facilitator,
              label: facilitator,
            }))}
          />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {form.facilitators.map((facilitator) => (
              <span
                key={facilitator}
                className="flex items-center gap-1 rounded-md border border-moss/30 bg-moss/20 px-2 py-0.5 text-[10px] font-bold text-ink"
              >
                {facilitator}
                <button type="button" onClick={() => toggleFacilitators(facilitator)}>
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="type-label mb-1 block text-xs text-inkMuted">
            O que dificulta? *
          </label>
          <Dropdown
            value={difficultyValue}
            onChange={(value) => {
              if (value) toggleDifficulties(value);
              setDifficultyValue('');
            }}
            placeholder="Adicionar..."
            options={DIFFICULTIES_LIST.map((difficulty) => ({
              value: difficulty,
              label: difficulty,
            }))}
          />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {form.difficulties.map((difficulty) => (
              <span
                key={difficulty}
                className="flex items-center gap-1 rounded-md border border-clayDark/30 bg-clayDark/20 px-2 py-0.5 text-[10px] font-bold text-clayDark"
              >
                {difficulty}
                <button type="button" onClick={() => toggleDifficulties(difficulty)}>
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <EixoInfoModal eixo={infoEixo} onClose={() => setInfoEixo(null)} />
      </div>
    </StepLayout>
  );
}
