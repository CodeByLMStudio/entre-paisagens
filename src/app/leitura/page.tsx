import type { Metadata } from 'next';
import { ReadingView } from '@/features/reading/components/ReadingView';

export const metadata: Metadata = {
  title: 'Leitura da Paisagem',
  description: 'Estatísticas e catálogo de percepções coletadas no território urbano.',
};

export default function ReadingPage() {
  return <ReadingView />;
}
