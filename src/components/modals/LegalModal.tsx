'use client';

import { FileText, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { PrivacyContent } from '@/features/legal/content/PrivacyContent';
import { TermsContent } from '@/features/legal/content/TermsContent';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/uiStore';

export function LegalModal() {
  const legalDoc = useUiStore((s) => s.legalDoc);
  const setLegalDoc = useUiStore((s) => s.setLegalDoc);

  const isTerms = legalDoc === 'terms';

  return (
    <Modal
      open={legalDoc !== null}
      onClose={() => setLegalDoc(null)}
      title={
        <span className="flex items-center gap-2">
          {isTerms ? (
            <FileText size={18} className="text-clay" />
          ) : (
            <ShieldCheck size={18} className="text-clay" />
          )}
          {isTerms ? 'TERMOS DE USO' : 'POLÍTICA DE PRIVACIDADE'}
        </span>
      }
      className="max-w-3xl"
    >
      <div className="flex flex-col gap-5 p-6 md:p-8">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setLegalDoc('terms')}
            className={cn(
              'rounded-lg border-2 px-3 py-2 transition-colors',
              isTerms
                ? 'border-clay bg-clay text-paper'
                : 'border-sand bg-paper text-ink hover:bg-paper2',
            )}
          >
            Termos de Uso
          </button>
          <button
            type="button"
            onClick={() => setLegalDoc('privacy')}
            className={cn(
              'rounded-lg border-2 px-3 py-2 transition-colors',
              !isTerms
                ? 'border-clay bg-clay text-paper'
                : 'border-sand bg-paper text-ink hover:bg-paper2',
            )}
          >
            Política de Privacidade
          </button>
        </div>

        <p className="text-xs font-semibold text-inkMuted">
          Última atualização: 17 de outubro de 2026.
        </p>

        <div className="flex flex-col gap-5 text-sm leading-relaxed text-ink">
          {isTerms ? <TermsContent /> : <PrivacyContent />}
        </div>
      </div>
    </Modal>
  );
}
