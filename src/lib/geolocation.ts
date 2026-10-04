/**
 * Geolocalização com busca de precisão.
 *
 * Usa `watchPosition` (em vez de um único `getCurrentPosition`) para coletar
 * múltiplas leituras e resolver com a mais precisa, melhorando a acurácia em
 * relação à localização instantânea (que costuma vir de rede/IP e errar por
 * centenas de metros).
 */

interface AccuratePositionOptions {
  /** Tempo máximo de espera por uma correção precisa (ms). */
  timeoutMs?: number;
  /** Precisão alvo considerada aceitável (metros). */
  desiredAccuracyMeters?: number;
}

export function getAccuratePosition({
  timeoutMs = 15_000,
  desiredAccuracyMeters = 50,
}: AccuratePositionOptions = {}): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Geolocalização não suportada neste navegador.'));
      return;
    }

    let best: GeolocationPosition | null = null;
    let watchId: number | null = null;

    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    };

    const timeout = window.setTimeout(() => {
      cleanup();
      if (best) {
        resolve(best);
      } else {
        reject(new Error('Não foi possível obter a localização.'));
      }
    }, timeoutMs);

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        best = position;
        // Resolve assim que a precisão estiver boa o suficiente.
        if (position.coords.accuracy <= desiredAccuracyMeters) {
          window.clearTimeout(timeout);
          cleanup();
          resolve(position);
        }
      },
      (error) => {
        window.clearTimeout(timeout);
        cleanup();
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0, // força uma correção nova (ignora cache antigo)
      },
    );
  });
}
