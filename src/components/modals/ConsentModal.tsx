'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  registerTermsAcceptance,
  useConsentStore,
} from '@/stores/consentStore';
import { useUiStore } from '@/stores/uiStore';

export function ConsentModal() {
  const open = useConsentStore((s) => s.isOpen);
  const closeConsent = useConsentStore((s) => s.closeConsent);
  const showToast = useUiStore((s) => s.showToast);
  const setLegalDoc = useUiStore((s) => s.setLegalDoc);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (open) setAccepted(false);
  }, [open]);

  const handleDecline = () => {
    setAccepted(false);
    closeConsent(false);
    showToast(
      'Modo visualizador ativado. Para registrar relatos, aceite os termos de uso e a política de privacidade.',
      'info',
    );
  };

  const handleAccept = () => {
    if (!accepted) return;
    registerTermsAcceptance();
    setAccepted(false);
    closeConsent(true);
    showToast('Termos aceitos. Você já pode registrar seus relatos.', 'success');
  };

  return (
    <Modal
      open={open}
      onClose={handleDecline}
      title={
        <span className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-clay" />
          TERMOS DE USO E PRIVACIDADE
        </span>
      }
      className="max-w-lg"
    >
      <div className="flex flex-col gap-5 p-6">
        <p className="text-sm font-medium leading-relaxed text-ink">
          Para registrar e publicar uma experiência no <strong>Entre Paisagens</strong>,
          precisamos do seu consentimento para tratar as informações do relato,
          incluindo dados pessoais sensíveis, como condição/percepção e localização.
        </p>

        <div className="rounded-2xl border-2 border-sand bg-paper p-4 text-xs leading-relaxed text-inkMuted">
          <p>
            Leia os documentos completos antes de continuar:
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-bold text-clay">
            <button
              type="button"
              onClick={() => setLegalDoc('terms')}
              className="underline decoration-clay/40 underline-offset-2 hover:text-clayDark"
            >
              Termos de Uso
            </button>
            <button
              type="button"
              onClick={() => setLegalDoc('privacy')}
              className="underline decoration-clay/40 underline-offset-2 hover:text-clayDark"
            >
              Política de Privacidade
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-sand bg-white p-4 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#A36437]"
          />
          <span>
            Li e aceito os Termos de Uso e a Política de Privacidade do Entre
            Paisagens.
          </span>
        </label>

        <p className="text-[11px] font-medium leading-relaxed text-inkMuted">
          Se você não aceitar, continuará podendo navegar pelo mapa e consultar os
          relatos da comunidade, mas não poderá registrar novas experiências.
        </p>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <Button
            variant="secondary"
            onClick={handleDecline}
            className="flex-1"
          >
            Continuar como visualizador
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!accepted}
            className="flex-1"
          >
            Aceitar e continuar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
