import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'moss' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-clay text-paper hover:bg-clayDark shadow-md',
  secondary: 'bg-paper border-2 border-sand text-ink hover:bg-paper2',
  ghost: 'bg-sand/40 text-ink hover:bg-sand/60 border border-sand',
  dark: 'bg-ink text-paper hover:bg-inkDark',
  moss: 'bg-moss text-paper hover:bg-mossDark',
  danger: 'bg-clayDark text-paper hover:bg-[#7d3416]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-4 text-base',
  icon: 'p-2.5',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
