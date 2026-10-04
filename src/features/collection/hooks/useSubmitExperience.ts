'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Experience } from '@/domain/types';
import { experienceSchema } from '@/domain/schemas';
import { sanitizeExperience } from '@/lib/sanitize';
import { useCollectionStore } from '@/stores/collectionStore';
import { useExperienceStore } from '@/stores/experienceStore';
import { useMapStore } from '@/stores/mapStore';
import { useUiStore } from '@/stores/uiStore';

/**
 * Submete o relato final: valida com Zod, sanitiza, persiste via repositório
 * e navega até o mapa com o ponto selecionado.
 *
 * O `pointId` é resolvido no store de experiências: se o logradouro + número
 * já existirem (ou a coordenada coincidir), a experiência é agregada ao ponto
 * existente (incrementando o histórico).
 */
export function useSubmitExperience() {
  const router = useRouter();

  const submit = useCallback(() => {
    const { profile, form } = useCollectionStore.getState();

    const result = experienceSchema.safeParse({ ...form, profile });

    if (!result.success) {
      const message =
        result.error.issues[0]?.message ?? 'Não foi possível validar o relato.';
      useUiStore.getState().showToast(message, 'error');
      return;
    }

    const parsed = result.data as Experience;

    // `addExperience` resolve o pointId (agrega ao ponto existente quando o
    // endereço/coordenada coincidem), incrementando o histórico.
    const experience = sanitizeExperience(parsed);

    useCollectionStore.getState().setIsSubmitting(true);
    useExperienceStore.getState().addExperience(experience);

    // Recupera o pointId efetivamente atribuído (addExperience pode tê-lo
    // resolvido por endereço/coordenada).
    const assigned = useExperienceStore.getState().experiences.find(
      (e) => e.id === experience.id,
    );
    const pointId = assigned?.pointId ?? experience.pointId;

    useCollectionStore.getState().close();
    useMapStore.getState().setSelectedPointId(pointId ?? null);
    useUiStore.getState().showToast('Relato registrado com sucesso!', 'success');
    router.push('/mapa');
    useCollectionStore.getState().setIsSubmitting(false);
  }, [router]);

  return { submit };
}
