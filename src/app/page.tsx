import type { Metadata } from 'next';
import { HomeView } from '@/features/home/components/HomeView';

export const metadata: Metadata = {
  title: 'Início',
};

export default function HomePage() {
  return <HomeView />;
}
