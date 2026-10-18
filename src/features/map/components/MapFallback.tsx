import { Spinner } from '@/components/ui/Spinner';

/**
 * Fallback visual exibido enquanto o mapa é carregado (e durante o SSR,
 * já que o Leaflet é client-only).
 */
export function MapFallback() {
  return (
    <div className="relative h-full min-h-[400px] w-full bg-paper">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink">
        <Spinner label="Carregando mapa e camadas cartográficas..." />
      </div>
    </div>
  );
}
