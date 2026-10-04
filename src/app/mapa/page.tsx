import type { Metadata } from 'next';
import { DashboardView } from '@/features/map/components/DashboardView';

export const metadata: Metadata = {
  title: 'Mapa',
  description: 'Mapa interativo de relatos e percepções urbanas em Fortaleza.',
};

export default function MapPage() {
  return <DashboardView />;
}
