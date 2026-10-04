import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const inputClass =
  'w-full rounded-xl border-2 border-sand bg-white p-3.5 text-sm text-ink placeholder:text-inkMuted/60 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20';

export const selectClass = `${inputClass} cursor-pointer appearance-none`;

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <label
        htmlFor={htmlFor}
        className="type-label mb-1 block text-xs text-inkMuted"
      >
        {label}
        {required && <span className="text-clayDark"> *</span>}
      </label>
      {children}
      {hint && (
        <span className="mt-1 block text-[10px] font-semibold text-inkMuted">
          {hint}
        </span>
      )}
      {error && (
        <span
          role="alert"
          className="mt-1 block text-[11px] font-bold text-clayDark"
        >
          {error}
        </span>
      )}
    </div>
  );
}
