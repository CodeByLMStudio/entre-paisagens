import { EIXO_COLORS } from '@/domain/constants';
import type { Eixo, LandscapeDimension, MapPoint } from '@/domain/types';
import { DIMENSION_ICONS } from '@/lib/dimensionIcons';

/** Cor de cada dimensão (tom terroso, distinto dos eixos). */
const DIMENSION_COLORS: Record<LandscapeDimension, string> = {
  'Conforto ambiental': '#C9872F',
  Acessibilidade: '#4F6D5C',
  Caminhabilidade: '#8A6A3B',
  Permanência: '#9A461F',
  Apropriação: '#646746',
  'Vegetação e natureza': '#5C7A4A',
  'Orientação e legibilidade': '#687878',
  'Experiência sensorial': '#A36437',
  'Security / Segurança percebida': '#70563D',
  Sociabilidade: '#B58044',
  'Manutenção e conservação': '#3E422A',
  'Desejos de transformação': '#B04A3A',
};

/** Código SVG (caminho) de um ícone lucide, usado dentro de um `divIcon`. */
function svgIconPath(name: LandscapeDimension): string {
  // Obtém o elemento SVG renderizado pelo lucide e extrai o `innerHTML`.
  // Implementação segura: usa uma whitelist de caminhos embutidos.
  // (lucide não expõe o path estático; usamos um mapeamento textual mínimo.)
  return ICON_PATHS[name] ?? '';
}

/** Mapa de `path`/figura para cada dimensão (subconjunto visual simples). */
const ICON_PATHS: Record<LandscapeDimension, string> = {
  'Conforto ambiental':
    '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>',
  Acessibilidade:
    '<circle cx="12" cy="4" r="2"></circle><path d="M9 20l3-6 3 6M12 14v6M6 13l6-3 6 3"></path>',
  Caminhabilidade:
    '<path d="M4 19l4-4M14 9l2.5 2.5M3 12h1M21 12h1M7 12h10"></path>',
  Permanência:
    '<path d="M6 10v5a2 2 0 002 2h8a2 2 0 002-2v-5M5 10h14l1-4H4l1 4z"></path>',
  Apropriação:
    '<path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z"></path>',
  'Vegetação e natureza':
    '<path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.5 19 2a7 7 0 01-1 15C15 17 12.5 17 11 20zM5 15c1 1 3 2 4 2"></path>',
  'Orientação e legibilidade':
    '<path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z"></path><circle cx="12" cy="9" r="2.5"></circle>',
  'Experiência sensorial':
    '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>',
  'Security / Segurança percebida':
    '<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4zM9 12l2 2 4-4"></path>',
  Sociabilidade:
    '<path d="M17 20a4 4 0 00-8 0M8 14a4 4 0 108 0M9 11V8a3 3 0 016 0v3"></path>',
  'Manutenção e conservação':
    '<path d="M3 6l3 3L3 12l3 3-3 3M14 6l3 3-3 3M8 12h8"></path>',
  'Desejos de transformação':
    '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10c.7 1 1 2 1 3h6c0-1 .3-2 1-3a6 6 0 00-4-10z"></path>',
};

// Referência aos ícones reais (para uso em React, não no divIcon).
export { DIMENSION_ICONS, DIMENSION_COLORS };

/**
 * Gera o HTML do marcador de um ponto do mapa.
 *
 * - Se houver exatamente UMA dimensão selecionada no filtro, o marcador exibe
 *   o ícone dessa dimensão (com a cor da dimensão).
 * - Caso contrário, usa a cor do eixo (comportamento atual) e, quando o ponto
 *   possui histórico (mais de uma experiência), exibe um contador.
 *
 * SEGURANÇA: interpola apenas constantes/código interno. Nenhum dado do
 * usuário é inserido aqui.
 */
export function experienceMarkerHtml(
  point: MapPoint,
  size: number,
  selected: boolean,
  activeDimensions: LandscapeDimension[],
  opts?: { dominantEixo?: Eixo },
): string {
  const eixoColor = opts?.dominantEixo
    ? (EIXO_COLORS[opts.dominantEixo] ?? '#A36437')
    : '#A36437';

  const singleDimension =
    activeDimensions.length === 1 ? activeDimensions[0] : undefined;

  const color = singleDimension
    ? (DIMENSION_COLORS[singleDimension] ?? eixoColor)
    : eixoColor;

  const transform = selected
    ? 'transform:scale(1.3);outline:3px solid #42422A;'
    : '';

  const count = point.experiences.length;
  const showCount = count > 1;

  let content: string;
  if (singleDimension) {
    const icon = svgIconPath(singleDimension);
    content = `<svg viewBox="0 0 24 24" width="${size * 0.55}px" height="${
      size * 0.55
    }px" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">${icon}</svg>`;
  } else if (showCount) {
    content = `<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#F9EED8;font-weight:800;font-size:${
      size * 0.4
    }px;font-family:system-ui,sans-serif;line-height:1;">${count}</span>`;
  } else {
    content = '';
  }

  return (
    `<div style="` +
    `background-color:${color};` +
    `width:${size}px;height:${size}px;` +
    `border-radius:50%;border:3px solid #F9EED8;` +
    `box-shadow:0 4px 12px rgba(0,0,0,0.35);` +
    `cursor:pointer;transition:transform 0.2s ease;` +
    `position:relative;` +
    `${transform}">` +
    `${content}` +
    `</div>`
  );
}

export function pendingMarkerHtml(): string {
  return (
    `<div style="position:relative;width:40px;height:50px;display:flex;flex-direction:column;align-items:center;" class="animate-bounce">` +
    `<div style="width:32px;height:32px;background-color:#EA4335;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.4);border:2px solid #FFFFFF;">` +
    `<div style="width:10px;height:10px;background-color:#FFFFFF;border-radius:50%;transform:rotate(45deg);"></div>` +
    `</div>` +
    `<div style="width:8px;height:4px;background-color:rgba(0,0,0,0.4);border-radius:50%;margin-top:-2px;"></div>` +
    `</div>`
  );
}
