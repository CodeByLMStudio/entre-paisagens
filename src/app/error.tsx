'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-paper p-8 text-center">
      <AlertCircle size={48} className="text-clayDark" />
      <h2 className="text-xl font-black text-ink">Algo deu errado</h2>
      <p className="max-w-md text-sm text-inkMuted">
        Ocorreu um erro inesperado ao carregar esta página. Tente novamente.
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
