'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface MediaCaptureOptions {
  onError?: (message: string) => void;
}

/** Duração máxima da gravação de áudio (segundos). */
export const MAX_AUDIO_SECONDS = 30;

/** Tamanho máximo da imagem comprimida (bytes) — 0.5 MB. */
export const MAX_IMAGE_BYTES = 0.5 * 1024 * 1024;

/**
 * Encapsula a captura de mídia (câmera e microfone) usada no passo de relato.
 *
 * Regras de limite:
 *  - Áudio: máximo de 30s (auto-stop).
 *  - Imagem: comprimida até <= 0.5 MB, reduzindo qualidade/resolução iterativamente.
 */
export function useMediaCapture(options?: MediaCaptureOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objectUrlsRef = useRef<string[]>([]);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const onError = options?.onError;

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setIsCameraActive(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
    } catch {
      setIsCameraActive(false);
      onError?.('Não foi possível acessar a câmera.');
    }
  }, [onError]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      void videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  /**
   * Comprime um dataURL JPEG até ficar abaixo de `MAX_IMAGE_BYTES`, reduzindo
   * qualidade e (se necessário) a resolução.
   */
  function compressToTarget(dataUrl: string, maxBytes: number): string {
    const img = new Image();
    img.src = dataUrl;

    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    // Reduz a resolução em etapas e a qualidade, até caber no limite.
    let quality = 0.85;
    let scale = 1;
    let best = dataUrl;

    const tryRender = (w: number, h: number, q: number): string => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return dataUrl;
      ctx.drawImage(img, 0, 0, w, h);
      return canvas.toDataURL('image/jpeg', q);
    };

    const bytesOf = (url: string): number => {
      // dataURL de base64: tamanho ≈ len * 3/4
      const idx = url.indexOf(',');
      if (idx < 0) return Infinity;
      const b64 = url.slice(idx + 1);
      return Math.floor((b64.length * 3) / 4);
    };

    let attempt = 0;
    while (bytesOf(best) > maxBytes && attempt < 12) {
      attempt += 1;

      // Reduz qualidade primeiro, depois resolução.
      if (scale > 0.25) {
        quality = Math.max(0.4, quality - 0.1);
        best = tryRender(
          Math.round(width * scale),
          Math.round(height * scale),
          quality,
        );
        if (bytesOf(best) <= maxBytes) break;
        scale *= 0.7;
      } else {
        scale *= 0.6;
        best = tryRender(
          Math.round(width * scale),
          Math.round(height * scale),
          quality,
        );
      }
    }

    return best;
  }

  const capturePhoto = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const raw = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();

    // Comprime para <= 0.5 MB (câmeras de alta resolução geram arquivos grandes).
    return compressToTarget(raw, MAX_IMAGE_BYTES);
  }, [stopCamera]);

  const startRecording = useCallback(async () => {
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      recorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

      // Auto-stop ao atingir o limite de 30s.
      maxTimerRef.current = setTimeout(() => {
        void stopRecording();
      }, MAX_AUDIO_SECONDS * 1000);
    } catch {
      setIsRecording(false);
      onError?.('Permissão de microfone negada ou indisponível.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onError]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    timerRef.current = null;
    maxTimerRef.current = null;
    setIsRecording(false);

    const recorder = recorderRef.current;
    if (!recorder) return null;

    return new Promise<string | null>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        objectUrlsRef.current.push(url);
        recorderRef.current = null;
        resolve(url);
      };

      recorder.stop();
      recorder.stream.getTracks().forEach((track) => track.stop());
    });
  }, []);

  // Limpeza de recursos no unmount.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
      if (recorderRef.current) {
        recorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  return {
    videoRef,
    isCameraActive,
    isRecording,
    recordingTime,
    maxAudioSeconds: MAX_AUDIO_SECONDS,
    startCamera,
    stopCamera,
    capturePhoto,
    startRecording,
    stopRecording,
  };
}
