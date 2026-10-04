import type { Experience } from '@/domain/types';
import { experienceSchema } from '@/domain/schemas';
import { sanitizeExperience } from '@/lib/sanitize';
import { storage } from '@/lib/storage';

const STORAGE_KEY = 'entre-paisagens.experiences.v2';

/**
 * Repositório de relatos de experiência (persistência em localStorage).
 *
 * Mantém a leitura/escrita isoladas do resto da aplicação, permitindo trocar
 * futuramente por Server Actions / API Routes sem tocar nos consumidores.
 *
 * Na leitura, cada item é validado contra o schema Zod (dados corrompidos ou
 * de versões antigas são descartados silenciosamente).
 */
export const experienceRepository = {
  load(): Experience[] {
    const raw = storage.get(STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      const valid: Experience[] = [];
      for (const item of parsed) {
        const result = experienceSchema.safeParse(item);
        if (result.success) {
          valid.push(result.data);
        }
      }
      return valid;
    } catch {
      return [];
    }
  },

  save(experiences: Experience[]): void {
    const sanitized = experiences.map((exp) => sanitizeExperience(exp));
    storage.set(STORAGE_KEY, JSON.stringify(sanitized));
  },
};
