'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HelpCircle, Menu, MessageSquare, Plus } from 'lucide-react';
import { useReportFlow } from '@/features/collection/hooks/useReportFlow';
import { cn } from '@/lib/utils';
import { useMapStore } from '@/stores/mapStore';
import { useUiStore } from '@/stores/uiStore';

const NAV_ITEMS = [
  { href: '/mapa', label: 'Mapa' },
  { href: '/leitura', label: 'Leitura da Paisagem' },
  { href: '/sobre', label: 'Sobre' },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const setContactOpen = useUiStore((s) => s.setContactOpen);
  const setTutorialOpen = useUiStore((s) => s.setTutorialOpen);
  const setFilterDrawerOpen = useMapStore((s) => s.setFilterDrawerOpen);
  const { startRegistration } = useReportFlow();

  // Na home não há header (a identidade visual é exibida no hero).
  if (pathname === '/') return null;

  return (
    <header className="z-30 flex shrink-0 items-center justify-between border-b border-sand bg-paper2 px-4 py-3 shadow-sm md:px-6">
      <div className="flex items-center gap-4">
        {pathname === '/mapa' && (
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sand bg-paper text-ink transition-colors hover:bg-paper2"
            title="Abrir filtros do mapa"
            aria-label="Abrir filtros do mapa"
          >
            <Menu size={20} />
          </button>
        )}
        <Link
          href="/"
          className="type-display text-xl text-ink transition-opacity hover:opacity-75"
        >
          ENTRE PAISAGENS
        </Link>
        <div className="hidden h-4 w-px bg-sand sm:block" />
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-bold transition-colors',
                  active
                    ? 'bg-clay text-paper'
                    : 'text-ink hover:bg-sand/30',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTutorialOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-sand bg-paper px-3 py-2 text-xs font-bold text-ink shadow-sm transition-colors hover:bg-paper2"
          title="Abrir Tutorial"
        >
          <HelpCircle size={16} className="text-clay" />
          <span className="hidden md:inline">Tutorial</span>
        </button>

        <button
          type="button"
          onClick={() => setContactOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-sand bg-paper px-3 py-2 text-xs font-bold text-ink shadow-sm transition-colors hover:bg-paper2"
          title="Fale Conosco"
        >
          <MessageSquare size={16} className="text-clay" />
          <span className="hidden md:inline">Fale Conosco</span>
        </button>

        <button
          type="button"
          onClick={() => void startRegistration()}
          className="flex items-center gap-2 rounded-xl bg-clay px-4 py-2 text-sm font-bold text-paper shadow-md transition-transform hover:bg-clayDark active:scale-95"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Novo Relato</span>
        </button>
      </div>
    </header>
  );
}
