import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
}

/**
 * Pílula colorida com cor configurável (usada nos eixos/dimensões).
 */
export function Badge({ color, className, children, style, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider',
        className,
      )}
      style={{
        backgroundColor: color ? `${color}20` : undefined,
        color: color ?? undefined,
        border: color ? `1px solid ${color}40` : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
