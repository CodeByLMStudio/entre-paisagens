import type { Metadata } from 'next';
import { AboutView } from '@/features/about/components/AboutView';

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Metodologia e objetivos do projeto Entre Paisagens.',
};

export default function AboutPage() {
  return <AboutView />;
}
