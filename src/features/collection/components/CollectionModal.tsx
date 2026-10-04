'use client';

import { Modal } from '@/components/ui/Modal';
import { useCollectionStore } from '@/stores/collectionStore';
import { StepProgress } from './StepProgress';
import { Step1Profile } from './Step1Profile';
import { Step2Location } from './Step2Location';
import { Step3Media } from './Step3Media';
import { Step4Review } from './Step4Review';

export function CollectionModal() {
  const isOpen = useCollectionStore((s) => s.isOpen);
  const step = useCollectionStore((s) => s.step);
  const close = useCollectionStore((s) => s.close);

  return (
    <Modal open={isOpen} onClose={close} title="NOVO RELATO DE PAISAGEM" className="max-w-xl">
      <div className="flex-1 p-6 md:p-8">
        <StepProgress step={step} />
        {step === 1 && <Step1Profile />}
        {step === 2 && <Step2Location />}
        {step === 3 && <Step3Media />}
        {step === 4 && <Step4Review />}
      </div>
    </Modal>
  );
}
