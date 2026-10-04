import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          'h-8 w-8 animate-spin rounded-full border-4 border-clay border-t-transparent',
          className,
        )}
        role="status"
        aria-label={label ?? 'Carregando'}
      />
      {label && <span className="text-sm font-semibold text-ink">{label}</span>}
    </div>
  );
}
