import { EIXOS, EIXO_COLORS } from '@/domain/constants';
import type { Eixo, Experience } from '@/domain/types';

export function ReadingStats({ experiences }: { experiences: Experience[] }) {
  const total = experiences.length;

  const stats: Array<{ eixo: Eixo; count: number; percent: number }> = EIXOS.map(
    (eixo) => {
      const count = experiences.filter((exp) => exp.eixo === eixo).length;
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      return { eixo, count, percent };
    },
  );

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.eixo}
          className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-sand bg-white p-4 text-center shadow-sm"
        >
          <div
            className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20"
            style={{ backgroundColor: EIXO_COLORS[stat.eixo] }}
          />
          <span
            className="z-10 mb-1 text-[10px] font-black uppercase tracking-wider"
            style={{ color: EIXO_COLORS[stat.eixo] }}
          >
            {stat.eixo}
          </span>
          <div className="z-10 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-ink">{stat.count}</span>
            <span className="text-xs font-bold text-inkMuted">({stat.percent}%)</span>
          </div>
        </div>
      ))}
    </div>
  );
}
