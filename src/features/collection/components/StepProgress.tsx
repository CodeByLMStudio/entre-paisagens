import { cn } from '@/lib/utils';

export function StepProgress({ step }: { step: number }) {
  return (
    <div className="mb-6 flex gap-2" aria-hidden="true">
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className={cn(
            'h-2 flex-1 rounded-full transition-all',
            index <= step ? 'bg-clay' : 'bg-sand/50',
          )}
        />
      ))}
    </div>
  );
}
