import type { Metadata } from 'next';
import { lato, manrope, montserrat } from '@/lib/fonts';
import './globals.css';
import { AppFooter } from '@/components/layout/AppFooter';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppProviders } from '@/components/layout/AppProviders';
import { ConsentModal } from '@/components/modals/ConsentModal';
import { ContactModal } from '@/components/modals/ContactModal';
import { LegalModal } from '@/components/modals/LegalModal';
import { TutorialModal } from '@/components/modals/TutorialModal';
import { Toast } from '@/components/ui/Toast';
import { CollectionModal } from '@/features/collection/components/CollectionModal';

export const metadata: Metadata = {
  title: {
    default: 'Entre Paisagens',
    template: '%s | Entre Paisagens',
  },
  description:
    'Mapeamento participativo e percepção da paisagem urbana de Fortaleza (CE).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} ${lato.variable} ${manrope.variable}`}
    >
      <body className="flex h-full flex-col overflow-hidden font-sans">
        <AppProviders>
          <AppHeader />
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
          <AppFooter />
          <Toast />
          <CollectionModal />
          <ConsentModal />
          <ContactModal />
          <TutorialModal />
          <LegalModal />
        </AppProviders>
      </body>
    </html>
  );
}
