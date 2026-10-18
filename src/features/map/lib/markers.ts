import { EIXO_COLORS } from '@/domain/constants';
import type { Eixo, Experience, MapPoint } from '@/domain/types';
import { formatDate } from '@/lib/utils';

interface MarkerOptions {
  dominantEixo?: Eixo;
  /** Experiências que atendem ao filtro ativo. */
  filtered?: Experience[];
}

/** Escapa aspas para uso seguro dentro de um atributo HTML. */
function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * Gera o HTML do marcador de um ponto do mapa.
 *
 * - Com histórico no mesmo local (mais de um relato), exibe o total em um
 *   "badge" no canto, mantendo o marcador com o tamanho original para não
 *   cobrir/ocultar marcações vizinhas.
 * - A cor segue o eixo do relato mais recente que atende ao filtro.
 *
 * SEGURANÇA: nenhum texto do usuário é interpolado como HTML — o resumo vai
 * para o atributo `data-tip`, que é lido e exibido como texto puro.
 */
export function experienceMarkerHtml(
  point: MapPoint,
  size: number,
  selected: boolean,
  filtered?: Experience[],
  opts?: MarkerOptions,
): string {
  const experiences =
    filtered && filtered.length > 0 ? filtered : point.experiences;

  // Cor pelo eixo do relato filtrado mais recente (fallback: eixo dominante).
  const eixo = experiences[0]?.eixo ?? opts?.dominantEixo ?? 'PERCEBER';
  const eixoColor = EIXO_COLORS[eixo] ?? '#A36437';

  const transform = selected
    ? 'transform:scale(1.25);outline:3px solid #42422A;'
    : '';

  const count = point.experiences.length;
  const showCount = count > 1;
  const latest = experiences[0] ?? point.experiences[0];

  const tip = escapeAttribute(
    [
      point.streetName ?? 'Local no mapa',
      showCount
        ? `${count} experiências neste local`
        : '1 experiência neste local',
      latest ? `${latest.profile.name} · ${latest.eixo} · ${formatDate(latest.date)}` : '',
      latest ? `“${latest.proposal}”` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  );

  const badge = showCount
    ? `<span style="position:absolute;top:-6px;right:-6px;min-width:16px;height:16px;padding:0 4px;border-radius:9px;background:#42422A;color:#F9EED8;font-family:system-ui,sans-serif;font-size:${Math.max(
        9,
        Math.round(size * 0.38),
      )}px;font-weight:800;line-height:16px;text-align:center;border:2px solid #F9EED8;pointer-events:none;">${count}</span>`
    : '';

  return (
    `<div class="ep-marker-hover" ` +
    `data-tip="${tip}" ` +
    `style="` +
    `background-color:${eixoColor};` +
    `width:${size}px;height:${size}px;` +
    `border-radius:50%;border:3px solid #F9EED8;` +
    `box-shadow:0 4px 12px rgba(0,0,0,0.35);` +
    `cursor:pointer;transition:transform 0.2s ease;` +
    `position:relative;` +
    `${transform}">` +
    `${badge}` +
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
