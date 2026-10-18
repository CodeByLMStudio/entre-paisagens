'use client';

import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ANONYMOUS_OPTION } from '@/domain/constants';
import { cn } from '@/lib/utils';

interface NameFieldProps {
  modal: boolean;
  name: string;
  isAnonymous: boolean;
  error?: string;
  onModalChange: (open: boolean) => void;
  onChangeName: (name: string) => void;
  onChangeAnonymous: (isAnonymous: boolean) => void;
}

/**
 * Campo "Nome ou apelido" com a opção "Prefiro não informar".
 * A seleção acontece em um popup para não quebrar o layout do passo.
 */
export function NameField({
  modal,
  name,
  isAnonymous,
  error,
  onModalChange,
  onChangeName,
  onChangeAnonymous,
}: NameFieldProps) {
  const displayValue = isAnonymous ? ANONYMOUS_OPTION : name;

  const selectAnonymous = () => {
    onChangeAnonymous(true);
    onChangeName('');
    onModalChange(false);
  };

  const trigger = (
    <div className="flex flex-col">
      <label
        htmlFor="profile-name-trigger"
        className="type-label mb-1 block text-xs text-inkMuted"
      >
        Nome ou apelido<span className="text-clayDark"> *</span>
      </label>
      <button
        id="profile-name-trigger"
        type="button"
        onClick={() => onModalChange(true)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl border-2 bg-white px-3.5 py-3 text-left text-sm transition-colors focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20',
          error ? 'border-clayDark' : 'border-sand',
          displayValue ? 'text-ink' : 'text-inkMuted/60',
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate">
            {displayValue || 'Selecione ou digite um nome/apelido...'}
          </span>
          {isAnonymous && (
            <span className="shrink-0 rounded bg-paper2 px-1.5 py-0.5 text-[10px] font-bold text-inkMuted">
              Relato anônimo
            </span>
          )}
        </span>
        <ChevronDown size={16} className="shrink-0 text-inkMuted" />
      </button>
      {error && (
        <span role="alert" className="mt-1 block text-[11px] font-bold text-clayDark">
          {error}
        </span>
      )}
    </div>
  );

  if (!modal) return trigger;

  return createPortal(
    <Modal
      open={modal}
      onClose={() => onModalChange(false)}
      title="NOME OU APELIDO"
      className="max-w-md"
    >
      <div className="flex flex-col gap-4 p-5">
        <p className="text-xs font-semibold text-inkMuted">
          Informe como deseja ser identificado(a) no relato ou escolha não se
          identificar.
        </p>

        <input
          id="profile-name-input"
          type="text"
          value={isAnonymous ? '' : name}
          onChange={(event) => {
            onChangeAnonymous(false);
            onChangeName(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onModalChange(false);
          }}
          placeholder="Como deseja ser chamado(a)"
          autoFocus
          className="w-full rounded-xl border-2 border-sand bg-white px-3.5 py-3 text-sm text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
        />

        <button
          type="button"
          onClick={selectAnonymous}
          className={cn(
            'rounded-xl border-2 px-3.5 py-3 text-left text-sm font-bold transition-colors',
            isAnonymous
              ? 'border-clay bg-clay/10 text-ink'
              : 'border-sand bg-white text-ink hover:bg-paper2',
          )}
        >
          {ANONYMOUS_OPTION}
          <span className="mt-0.5 block text-[10px] font-semibold text-inkMuted">
            O relato será publicado como &ldquo;Anônimo&rdquo;.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onModalChange(false)}
          className="rounded-xl bg-clay px-3 py-2.5 text-xs font-bold text-paper transition-colors hover:bg-clayDark"
        >
          Confirmar
        </button>
      </div>
    </Modal>,
    document.body,
  );
}
