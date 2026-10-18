import type { ReactNode } from 'react';

interface StepLayoutProps {
  children: ReactNode;
  footer: ReactNode;
}

/**
 * Estrutura padrão dos passos do relato: somente o conteúdo do formulário
 * rola; o rodapé com os botões permanece sempre visível.
 */
export function StepLayout({ children, footer }: StepLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2 md:px-8">
        {children}
      </div>
      <div className="shrink-0 border-t border-sand bg-paper px-6 py-3 md:px-8">
        {footer}
      </div>
    </div>
  );
}
