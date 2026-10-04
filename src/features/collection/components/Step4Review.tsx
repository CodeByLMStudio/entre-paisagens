'use client';

import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ZoomableImage } from '@/components/ui/ZoomableImage';
import { EIXO_COLORS } from '@/domain/constants';
import { useCollectionStore } from '@/stores/collectionStore';
import { useSubmitExperience } from '../hooks/useSubmitExperience';

export function Step4Review() {
  const profile = useCollectionStore((s) => s.profile);
  const form = useCollectionStore((s) => s.form);
  const setStep = useCollectionStore((s) => s.setStep);
  const isSubmitting = useCollectionStore((s) => s.isSubmitting);
  const { submit } = useSubmitExperience();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="type-display mb-1 text-2xl text-ink">4. Revisão Final</h2>
        <p className="text-xs font-semibold text-inkMuted">
          Confirme os dados antes de submeter seu relato.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border-2 border-sand bg-white p-4 text-sm">
        <div>
          <h4 className="type-label mb-1 text-[10px] text-inkMuted">
            Autor &amp; Moradia (Fortaleza)
          </h4>
          <p className="font-bold text-ink">
            {profile.name} ({profile.ageGroup}), Bairro {profile.neighborhood}
          </p>
        </div>

        <div>
          <h4 className="type-label mb-1 text-[10px] text-inkMuted">
            Localização &amp; Endereço
          </h4>
          <p className="font-bold text-ink">{form.streetName || 'Localização no mapa'}</p>
          {form.streetNumber && (
            <p className="text-xs text-inkMuted">Número: {form.streetNumber}</p>
          )}
          {form.streetReference && (
            <p className="text-xs text-inkMuted">Ref.: {form.streetReference}</p>
          )}
        </div>

        <div>
          <h4 className="type-label mb-1 text-[10px] text-inkMuted">
            Eixo &amp; Dimensões
          </h4>
          <span
            className="mb-1 inline-block rounded px-2.5 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: EIXO_COLORS[form.eixo] }}
          >
            {form.eixo}
          </span>
          <p className="text-xs text-inkMuted">{form.dimensions.join(', ')}</p>
        </div>

        <div>
          <h4 className="type-label mb-1 text-[10px] text-inkMuted">Relato</h4>
          <p
            className="rounded-xl border-l-2 bg-paper p-3 text-xs italic text-ink"
            style={{ borderColor: EIXO_COLORS[form.eixo] }}
          >
            &ldquo;{form.proposal}&rdquo;
          </p>
        </div>

        {(form.photoUrl || form.audioUrl) && (
          <div>
            <h4 className="type-label mb-1 text-[10px] text-inkMuted">
              Mídias do relato
            </h4>
            <div className="flex flex-col gap-3">
              {form.photoUrl && (
                <div className="overflow-hidden rounded-xl border border-sand">
                  <ZoomableImage
                    src={form.photoUrl}
                    alt="Foto do local"
                    className="max-h-48 w-full object-cover"
                  />
                </div>
              )}
              {form.audioUrl && (
                <div className="flex flex-col gap-2 rounded-xl border border-sand bg-paper p-3">
                  <span className="type-label flex items-center gap-1 text-[10px] text-inkMuted">
                    <Mic size={14} /> Áudio
                  </span>
                  <audio controls src={form.audioUrl} className="h-10 w-full" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto flex gap-3 pt-4">
        <Button variant="secondary" onClick={() => setStep(3)} className="flex-1">
          VOLTAR
        </Button>
        <Button variant="moss" onClick={submit} disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'ENVIANDO...' : 'CONCLUIR RELATO'}
        </Button>
      </div>
    </div>
  );
}
