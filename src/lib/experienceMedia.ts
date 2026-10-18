import type { Experience } from '@/domain/types';

/** Resolve as mídias de uma experiência, incluindo o formato legado `mediaUrl`. */
export function getExperienceMedia(experience: Experience): {
  photoUrl: string | null;
  audioUrl: string | null;
} {
  const photoUrl =
    experience.photoUrl ??
    (experience.mediaType === 'photo' ? experience.mediaUrl ?? null : null);
  const audioUrl =
    experience.audioUrl ??
    (experience.mediaType === 'audio' ? experience.mediaUrl ?? null : null);

  return { photoUrl, audioUrl };
}
