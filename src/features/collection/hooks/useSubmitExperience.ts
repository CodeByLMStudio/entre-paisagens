'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Experience } from '@/domain/types';
import { ANONYMOUS_DISPLAY_NAME } from '@/domain/constants';
import { experienceSchema } from '@/domain/schemas';
import { ensurePersistentMediaUrl } from '@/lib/mediaStorage';
import { sanitizeExperience } from '@/lib/sanitize';
import { useCollectionStore } from '@/stores/collectionStore';
import { useExperienceStore } from '@/stores/experienceStore';
import { useMapStore } from '@/stores/mapStore';
import { useUiStore } from '@/stores/uiStore';

/**
 * Submete o relato final: valida com Zod, sanitiza, persiste via repositório
 * e navega até o mapa com o ponto selecionado.
 *
 * As mídias são convertidas em data URLs persistentes antes de salvar, para
 * que foto e áudio continuem disponíveis após recarregar a página.
 *
 * O `pointId` é resolvido no store de experiências: se a coordenada já existir
 * a experiência é agregada ao ponto existente; o histórico completo é
 * unificado por logradouro.
 */
export function useSubmitExperience() {
  const router = useRouter();

  const submit = useCallback(async () => {
    const { profile, form } = useCollectionStore.getState();

    const candidate = {
      ...form,
      profile: {
        ...profile,
        // Relatos marcados como "Prefiro não informar" são publicados como anônimos.
        name: profile.isAnonymous ? ANONYMOUS_DISPLAY_NAME : profile.name,
      },
    };

    const result = experienceSchema.safeParse(candidate);

    if (!result.success) {
      const message =
        result.error.issues[0]?.message ?? 'Não foi possível validar o relato.';
      useUiStore.getState().showToast(message, 'error');
      return;
    }

    useCollectionStore.getState().setIsSubmitting(true);

    const parsed = result.data as Experience;

    // Garante que mídias `blob:` sejam convertidas em base64 antes de salvar.
    const [photoUrl, audioUrl] = await Promise.all([
      ensurePersistentMediaUrl(parsed.photoUrl),
      ensurePersistentMediaUrl(parsed.audioUrl),
    ]);

    // `addExperience` resolve o pointId (agrega ao ponto existente quando a
    // coordenada coincide), incrementando o histórico.
    const experience = sanitizeExperience({
      ...parsed,
      photoUrl,
      audioUrl,
    });

    useExperienceStore.getState().addExperience(experience);

    // Recupera o pointId efetivamente atribuído (addExperience pode tê-lo
    // resolvido por coordenada).
    const assigned = useExperienceStore.getState().experiences.find(
      (e) => e.id === experience.id,
    );
    const pointId = assigned?.pointId ?? experience.pointId;

    useCollectionStore.getState().close();

    // Limpa filtros para garantir que o relato recém-criado apareça no mapa
    // selecionado, mesmo que o usuário tivesse filtros ativos anteriormente.
    const map = useMapStore.getState();
    map.setPickingMode(false);
    map.setPendingCoord(null);
    map.setFilterDrawerOpen(false);
    map.setActiveEixo('ALL');
    map.clearDimensions();
    map.setSelectedPointId(pointId ?? null);

    useUiStore.getState().showToast('Relato registrado com sucesso!', 'success');
    router.push('/mapa');
    useCollectionStore.getState().setIsSubmitting(false);
  }, [router]);

  return { submit: () => void submit() };
}
