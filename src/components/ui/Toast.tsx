'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore, type ToastType } from '@/stores/uiStore';

const TOAST_DURATION_MS = 6000;

const styles: Record<ToastType, { icon: React.ReactNode; classes: string }> = {
  error: {
    icon: <AlertCircle size={20} className="shrink-0" />,
    classes: 'bg-clayDark text-white border-paper/30',
  },
  success: {
    icon: <CheckCircle2 size={20} className="shrink-0" />,
    classes: 'bg-moss text-white border-paper/30',
  },
  info: {
    icon: <Info size={20} className="shrink-0" />,
    classes: 'bg-ink text-paper border-paper/30',
  },
};

export function Toast() {
  const toast = useUiStore((s) => s.toast);
  const dismissToast = useUiStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const config = styles[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-4 z-[3000] flex w-[90%] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border px-5 py-3 shadow-2xl"
    >
      <div
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-4 py-3',
          config.classes,
        )}
      >
        {config.icon}
        <span className="flex-1 text-sm font-bold leading-tight">{toast.message}</span>
        <button
          type="button"
          onClick={dismissToast}
          className="shrink-0 rounded-full bg-black/20 p-1 transition-colors hover:bg-black/40"
          aria-label="Fechar aviso"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
