'use client';

import { useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Map as MapIcon,
  MapPin,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { storage } from '@/lib/storage';
import { useUiStore } from '@/stores/uiStore';

const TUTORIAL_SEEN_KEY = 'entre_paisagens_tutorial_seen';

interface TutorialStep {
  title: string;
  content: string;
  icon: React.ReactNode;
}

const STEPS: TutorialStep[] = [
  {
    title: 'Bem-vindo ao Entre Paisagens',
    content:
      'A plataforma de mapeamento participativo que dá voz à comunidade para compreender, qualificar e transformar a paisagem urbana de Fortaleza.',
    icon: <MapPin size={32} className="text-clay" />,
  },
  {
    title: '1. Registre sua Experiência',
    content:
      'Clique em "Novo Relato" ou escolha um ponto no mapa. Informe como você vivencia o espaço, selecione dimensões paisagísticas e adicione fotos e relatos em áudio.',
    icon: <Plus size={32} className="text-clay" />,
  },
  {
    title: '2. Explore o Mapa Interativo',
    content:
      'Navegue pelos marcadores coloridos no mapa de Fortaleza. Utilize os filtros laterais para categorizar relatos por Eixo e por Dimensão.',
    icon: <MapIcon size={32} className="text-clay" />,
  },
  {
    title: '3. Leitura da Paisagem',
    content:
      'Acesse a aba "Leitura da Paisagem" para visualizar estatísticas coletivas, depoimentos dos moradores e diagnósticos sociais dos territórios de Fortaleza.',
    icon: <BookOpen size={32} className="text-clay" />,
  },
];

export function TutorialModal() {
  const open = useUiStore((s) => s.tutorialOpen);
  const setOpen = useUiStore((s) => s.setTutorialOpen);
  const [currentStep, setCurrentStep] = useState(0);
  const [, setSeen] = useLocalStorage<boolean>(TUTORIAL_SEEN_KEY, false);

  const handleClose = () => {
    setCurrentStep(0);
    setOpen(false);
  };

  const handleSkipPermanently = () => {
    storage.set(TUTORIAL_SEEN_KEY, JSON.stringify(true));
    setSeen(true);
    setOpen(false);
  };

  const step = STEPS[currentStep] ?? STEPS[0]!;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        <span className="flex items-center gap-2">
          <HelpCircle size={18} className="text-clay" />
          TUTORIAL DA PLATAFORMA
        </span>
      }
      className="max-w-lg"
    >
      <div className="flex flex-col items-center gap-5 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-sand bg-paper2 shadow-sm">
          {step.icon}
        </div>

        <div>
          <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-clay">
            Passo {currentStep + 1} de {STEPS.length}
          </span>
          <h3 className="mb-2 text-xl font-black text-ink">{step.title}</h3>
          <p className="mx-auto max-w-sm text-xs font-medium leading-relaxed text-inkMuted">
            {step.content}
          </p>
        </div>

        <div className="flex gap-2">
          {STEPS.map((_, index) => (
            <span
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep ? 'w-6 bg-clay' : 'w-2 bg-sand'
              }`}
            />
          ))}
        </div>

        <div className="flex w-full items-center justify-between border-t border-sand pt-4">
          <button
            type="button"
            onClick={handleSkipPermanently}
            className="text-xs font-bold text-inkMuted underline hover:text-ink"
          >
            Ignorar tutorial
          </button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                aria-label="Passo anterior"
              >
                <ChevronLeft size={18} />
              </Button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={() => setCurrentStep((prev) => prev + 1)}>
                Próximo <ChevronRight size={16} />
              </Button>
            ) : (
              <Button variant="dark" onClick={handleClose}>
                Começar a Usar
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
