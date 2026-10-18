import type { Experience } from '@/domain/types';
import { experienceSchema } from '@/domain/schemas';
import { sanitizeExperience } from '@/lib/sanitize';
import { storage } from '@/lib/storage';

const STORAGE_KEY = 'entre-paisagens.experiences.v2';

const LEGACY_CONDITION_MAP: Record<string, string> = {
  'Sou uma pessoa neurodivergente': 'Pessoa neurodivergente',
  'Não Possuo': 'Não me identifico com nenhuma dessas condições',
  'Não sei informar': 'Não sei informar',
  'Prefiro não responder': 'Prefiro não responder',
};

/** Compatibiliza relatos salvos antes das mudanças de campos do formulário. */
function migrateStoredExperience(item: unknown): unknown {
  if (!item || typeof item !== 'object') return item;

  const record = { ...(item as Record<string, unknown>) };

  const profile = record.profile;
  if (profile && typeof profile === 'object') {
    const migratedProfile = { ...(profile as Record<string, unknown>) };

    if (typeof migratedProfile.isFromFortaleza !== 'boolean') {
      migratedProfile.isFromFortaleza = true;
    }

    // Perfis antigos guardavam apenas o bairro; preenche estado/cidade de
    // Fortaleza para manter a compatibilidade com o novo filtro.
    if (typeof migratedProfile.state !== 'string') {
      migratedProfile.state = 'CE';
    }
    if (typeof migratedProfile.city !== 'string') {
      migratedProfile.city = 'Ceará - Fortaleza';
    }
    if (typeof migratedProfile.isAnonymous !== 'boolean') {
      migratedProfile.isAnonymous = false;
    }
    delete migratedProfile.isFromFortaleza;

    if (!Array.isArray(migratedProfile.conditions)) {
      const legacy =
        typeof migratedProfile.neurodivergenceStatus === 'string'
          ? migratedProfile.neurodivergenceStatus
          : '';
      migratedProfile.conditions = legacy
        ? [LEGACY_CONDITION_MAP[legacy] ?? 'Outra condição']
        : ['Prefiro não responder'];
    }

    delete migratedProfile.neurodivergenceStatus;
    record.profile = migratedProfile;
  }

  if (Array.isArray(record.dimensions)) {
    record.dimensions = record.dimensions.map((dimension) =>
      dimension === 'Security / Segurança percebida' ? 'Segurança' : dimension,
    );
  }

  if (record.locationSource === undefined) record.locationSource = 'map';
  if (record.isOnSite === undefined) record.isOnSite = false;
  if (record.relationOther === undefined) record.relationOther = '';

  // URLs `blob:` apontam para a sessão da aba e ficam inválidas após recarregar.
  if (typeof record.photoUrl === 'string' && record.photoUrl.startsWith('blob:')) {
    record.photoUrl = null;
  }
  if (typeof record.audioUrl === 'string' && record.audioUrl.startsWith('blob:')) {
    record.audioUrl = null;
  }

  return record;
}

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
        const result = experienceSchema.safeParse(migrateStoredExperience(item));
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
