'use client';

import { Modal } from '@/components/ui/Modal';
import { EIXO_COLORS, EIXO_DESCRIPTIONS } from '@/domain/constants';
import type { Eixo } from '@/domain/types';

interface EixoInfoModalProps {
  eixo: Eixo | null;
  onClose: () => void;
}

/**
 * Modal reutilizável que explica o significado de um eixo analítico.
 */
export function EixoInfoModal({ eixo, onClose }: EixoInfoModalProps) {
  return (
    <Modal open={eixo !== null} onClose={onClose} className="max-w-sm" showClose={false}>
      {eixo && (
        <div className="flex flex-col gap-4 p-6 text-ink">
          <div className="flex items-center gap-2 border-b border-sand pb-3">
            <span
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: EIXO_COLORS[eixo] }}
            />
            <h3 className="text-base font-black">{eixo}</h3>
          </div>
          <p className="text-xs font-medium leading-relaxed text-inkMuted">
            {EIXO_DESCRIPTIONS[eixo]}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 rounded-xl bg-clay py-2.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-clayDark"
          >
            Entendido
          </button>
        </div>
      )}
    </Modal>
  );
}
