import { z } from 'zod';
import { isWithinFortaleza } from '@/lib/geo';
import {
  EIXOS,
  LANDSCAPE_DIMENSIONS_LIST,
  RELACOES,
} from './constants';

// ---------------------------------------------------------------------------
// Schemas atômicos
// ---------------------------------------------------------------------------

export const eixoSchema = z.enum(EIXOS);
export const relacaoSchema = z.enum(RELACOES);
export const dimensionSchema = z.enum(LANDSCAPE_DIMENSIONS_LIST);
export const mediaTypeSchema = z.enum(['photo', 'audio', 'both', 'none']);

// ---------------------------------------------------------------------------
// Perfil sociodemográfico (Passo 1)
// ---------------------------------------------------------------------------

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe seu nome ou apelido.')
    .max(80, 'Nome muito longo (máx. 80 caracteres).'),
  ageGroup: z.string().trim().min(1, 'Selecione sua faixa etária.'),
  neighborhood: z.string().trim().min(1, 'Selecione o bairro onde mora.'),
  residenceDuration: z
    .string()
    .trim()
    .min(1, 'Selecione o tempo de moradia.'),
  relation: relacaoSchema,
  frequency: z.string().default('Diariamente'),
  timeOfDay: z.string().default('Manhã'),
  transport: z.string().default('A pé'),
  company: z.string().default('Sozinho'),
  influencingFactors: z.array(z.string()).default([]),
  neurodivergenceStatus: z
    .string()
    .trim()
    .min(1, 'Selecione sua condição / percepção.'),
  sensoryMobilityNotes: z.string().trim().max(500).default(''),
});

// ---------------------------------------------------------------------------
// Passo 2 — Sobre o lugar
// ---------------------------------------------------------------------------

export const step2Schema = z.object({
  relation: relacaoSchema,
  eixo: eixoSchema,
  dimensions: z
    .array(dimensionSchema)
    .min(1, 'Selecione ao menos uma dimensão paisagística.'),
});

// ---------------------------------------------------------------------------
// Passo 3 — Relato e localização
// ---------------------------------------------------------------------------

export const step3Schema = z
  .object({
    lat: z.number({ required_error: 'Informe a latitude.' }),
    lng: z.number({ required_error: 'Informe a longitude.' }),
    proposal: z
      .string()
      .trim()
      .min(10, 'Escreva um relato com pelo menos 10 caracteres.')
      .max(2000, 'Relato muito longo (máx. 2000 caracteres).'),
  })
  .refine((d) => isWithinFortaleza(d.lat, d.lng), {
    message: 'A localização selecionada está fora dos limites de Fortaleza.',
    path: ['lat'],
  });

// ---------------------------------------------------------------------------
// Experiência completa (submissão final)
// ---------------------------------------------------------------------------

export const experienceSchema = z
  .object({
    id: z.string().min(1),
    // O pointId é resolvido depois (no store), por isso pode vir vazio/ausente.
    pointId: z.string().optional().default(''),
    lat: z.number(),
    lng: z.number(),
    locationNeighborhood: z.string().trim().max(120).optional(),
    streetName: z.string().trim().max(160).optional(),
    streetNumber: z.string().trim().max(20).optional(),
    streetReference: z.string().trim().max(240).optional(),
    streetNumberOrObs: z.string().trim().max(240).optional(),
    eixo: eixoSchema,
    photoUrl: z.string().nullable().optional(),
    audioUrl: z.string().nullable().optional(),
    mediaType: mediaTypeSchema.optional(),
    mediaUrl: z.string().nullable().optional(),
    relation: relacaoSchema,
    proposal: z
      .string()
      .trim()
      .min(10, 'Escreva um relato com pelo menos 10 caracteres.')
      .max(2000, 'Relato muito longo (máx. 2000 caracteres).'),
    date: z.string().min(1),
    profile: profileSchema,
    dimensions: z
      .array(dimensionSchema)
      .min(1, 'Selecione ao menos uma dimensão paisagística.'),
    facilitators: z.array(z.string()).default([]),
    difficulties: z.array(z.string()).default([]),
  })
  .refine((d) => isWithinFortaleza(d.lat, d.lng), {
    message: 'A localização selecionada está fora dos limites de Fortaleza.',
    path: ['lat'],
  });

export type ProfileInput = z.infer<typeof profileSchema>;
export type Step2Input = z.infer<typeof step2Schema>;
export type Step3Input = z.infer<typeof step3Schema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
