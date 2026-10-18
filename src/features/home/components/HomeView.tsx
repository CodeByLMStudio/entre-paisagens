'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  HelpCircle,
  Map as MapIcon,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { HOME_BG_URL } from '@/domain/constants';
import { useReportFlow } from '@/features/collection/hooks/useReportFlow';
import { useUiStore } from '@/stores/uiStore';

export function HomeView() {
  const { startRegistration } = useReportFlow();
  const setContactOpen = useUiStore((s) => s.setContactOpen);
  const setTutorialOpen = useUiStore((s) => s.setTutorialOpen);
  const setLegalDoc = useUiStore((s) => s.setLegalDoc);

  return (
    <main className="relative flex flex-1 flex-col overflow-y-auto p-4 text-center sm:p-6">
      <div className="absolute inset-0 z-0">
        <Image
          src={HOME_BG_URL}
          alt=""
          fill
          priority
          className="object-cover brightness-105 saturate-105"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-paper/80 via-paper/10 to-transparent md:hidden" />
      <div className="absolute inset-0 z-0 hidden bg-paper/10 md:block" />

      <div className="relative z-10 m-auto w-full max-w-lg rounded-3xl border-2 border-sand bg-paper2/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="type-display mb-3 text-4xl text-ink md:text-5xl">
            ENTRE PAISAGENS
          </h1>
          <p className="text-sm font-medium leading-relaxed text-inkMuted md:text-base">
            Mapeamento participativo e percepção da paisagem urbana de Fortaleza.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={() => void startRegistration()}
            className="flex items-center justify-center gap-3 rounded-2xl bg-clay px-4 py-4 text-base font-bold text-paper shadow-xl transition-transform hover:bg-clayDark active:scale-95"
          >
            <Plus size={22} />
            REGISTRAR EXPERIÊNCIA
          </button>

          <Link
            href="/mapa"
            className="flex items-center justify-center gap-3 rounded-2xl border-2 border-sand bg-paper px-4 py-3.5 text-base font-bold text-ink shadow-sm transition-transform hover:bg-paper2 active:scale-95"
          >
            <MapIcon size={20} />
            EXPLORAR MAPA
          </Link>

          <Link
            href="/leitura"
            className="flex items-center justify-center gap-3 rounded-2xl border-2 border-sand bg-paper px-4 py-3.5 text-base font-bold text-ink shadow-sm transition-transform hover:bg-paper2 active:scale-95"
          >
            <BookOpen size={20} />
            LEITURA DA PAISAGEM
          </Link>

          <div className="mt-1 flex gap-2 border-t border-sand/50 pt-2">
            <button
              type="button"
              onClick={() => setTutorialOpen(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-sand bg-sand/40 px-3 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-sand/60"
            >
              <HelpCircle size={15} className="text-clay" /> Tutorial
            </button>
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-sand bg-sand/40 px-3 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-sand/60"
            >
              <MessageSquare size={15} className="text-clay" /> Fale Conosco
            </button>
          </div>

          <div className="flex flex-col items-center gap-1 pt-1">
            <Link
              href="/sobre"
              className="text-xs font-bold text-inkMuted transition-colors hover:text-ink"
            >
              Sobre &middot; Metodologia
            </Link>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-inkMuted">
              <button
                type="button"
                onClick={() => setLegalDoc('terms')}
                className="underline hover:text-ink"
              >
                Termos de Uso
              </button>
              <span aria-hidden="true">&middot;</span>
              <button
                type="button"
                onClick={() => setLegalDoc('privacy')}
                className="underline hover:text-ink"
              >
                Privacidade
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
