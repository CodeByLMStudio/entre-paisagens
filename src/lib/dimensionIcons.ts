import {
  Accessibility,
  Footprints,
  HeartHandshake,
  Leaf,
  Lightbulb,
  MapPinned,
  Recycle,
  ShieldCheck,
  Sun,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import type { LandscapeDimension } from '@/domain/types';

/**
 * Ícone associado a cada dimensão paisagística (usado nos filtros e nos
 * marcadores do mapa quando uma única dimensão está selecionada).
 */
export const DIMENSION_ICONS: Record<LandscapeDimension, LucideIcon> = {
  'Conforto ambiental': Sun,
  Acessibilidade: Accessibility,
  Caminhabilidade: Footprints,
  Permanência: HeartHandshake,
  Apropriação: MapPinned,
  'Vegetação e natureza': Leaf,
  'Orientação e legibilidade': MapPinned,
  'Experiência sensorial': Waves,
  'Security / Segurança percebida': ShieldCheck,
  Sociabilidade: HeartHandshake,
  'Manutenção e conservação': Recycle,
  'Desejos de transformação': Lightbulb,
};
