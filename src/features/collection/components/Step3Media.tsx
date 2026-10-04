'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Aperture,
  Building,
  Camera,
  CheckCircle2,
  Hash,
  MapPin,
  Mic,
  MousePointerClick,
  Navigation,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import { ZoomableImage } from '@/components/ui/ZoomableImage';
import { step3Schema } from '@/domain/schemas';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useMediaCapture } from '@/hooks/useMediaCapture';
import { issuesToRecord } from '@/lib/zodUtils';
import { useCollectionStore } from '@/stores/collectionStore';
import { useMapStore } from '@/stores/mapStore';
import { useUiStore } from '@/stores/uiStore';

export function Step3Media() {
  const form = useCollectionStore((s) => s.form);
  const updateForm = useCollectionStore((s) => s.updateForm);
  const setStep = useCollectionStore((s) => s.setStep);
  const close = useCollectionStore((s) => s.close);
  const setPickingMode = useMapStore((s) => s.setPickingMode);
  const showToast = useUiStore((s) => s.showToast);
  const router = useRouter();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmAddress, setConfirmAddress] = useState(false);
  const [detectedStreet, setDetectedStreet] = useState<string>('');
  const [editingAddress, setEditingAddress] = useState(false);
  const { getCurrentLocation, isLocating } = useLocationServices();
  const media = useMediaCapture({ onError: (message) => showToast(message, 'error') });

  const handleUseGps = async () => {
    const street = await getCurrentLocation();
    if (street) {
      setDetectedStreet(street);
      setConfirmAddress(true);
      setEditingAddress(false);
    }
  };

  const handleConfirmAddress = (correct: boolean) => {
    if (correct) {
      setConfirmAddress(false);
    } else {
      setConfirmAddress(false);
      setEditingAddress(true);
    }
  };

  const handleSelectAddress = (result: {
    label: string;
    lat: number;
    lng: number;
    streetName?: string;
  }) => {
    updateForm({
      lat: result.lat,
      lng: result.lng,
      streetName: result.streetName ?? result.label,
    });
  };

  const handleNext = () => {
    const result = step3Schema.safeParse({
      lat: form.lat,
      lng: form.lng,
      proposal: form.proposal,
    });
    if (!result.success) {
      setErrors(issuesToRecord(result.error.issues));
      return;
    }
    setErrors({});
    setStep(4);
  };

  const handlePickOnMap = () => {
    setPickingMode(true);
    close();
    router.push('/mapa');
  };

  const handleCapturePhoto = () => {
    const dataUrl = media.capturePhoto();
    if (dataUrl) updateForm({ photoUrl: dataUrl });
  };

  const handleStopRecording = async () => {
    const url = await media.stopRecording();
    if (url) updateForm({ audioUrl: url });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="type-display mb-1 text-2xl text-ink">3. Relato e Mídias</h2>
        <p className="text-xs font-semibold text-inkMuted">
          Escreva sobre sua percepção e marque a localização. Você pode anexar foto e/ou
          áudio.
        </p>
      </div>

      <div>
        <label className="type-label mb-1.5 block text-xs text-inkMuted">
          Onde ocorreu essa experiência? *
        </label>
        <div className="mb-3 flex gap-2">
          <Button
            variant="secondary"
            onClick={() => void handleUseGps()}
            disabled={isLocating}
            className="flex-1"
          >
            <Navigation size={14} />
            {isLocating ? 'Obtendo...' : 'Usar GPS atual'}
          </Button>
          <Button variant="dark" onClick={handlePickOnMap} className="flex-1">
            <MousePointerClick size={14} /> Marcar no mapa
          </Button>
        </div>

        {/* Confirmação do endereço detectado pelo GPS */}
        {confirmAddress && (
          <div className="mb-3 flex flex-col gap-3 rounded-2xl border-2 border-clay bg-paper p-4">
            <div className="flex items-start gap-2">
              <MapPin size={18} className="mt-0.5 shrink-0 text-clay" />
              <div className="text-sm text-ink">
                <p className="font-bold">O endereço detectado está correto?</p>
                <p className="mt-1 text-xs text-inkMuted">
                  {detectedStreet || 'Endereço não identificado.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleConfirmAddress(true)} className="flex-1">
                Sim, está correto
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleConfirmAddress(false)}
                className="flex-1"
              >
                Não, informar endereço
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-2xl border-2 border-sand bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-inkMuted">
            <Building size={16} className="text-clay" />
            <span>
              {editingAddress
                ? 'Informe o endereço:'
                : 'Rua ou logradouro detectado automaticamente:'}
            </span>
          </div>

          {editingAddress ? (
            <AddressAutocomplete
              id="step3-address"
              value={form.streetName}
              onSelect={handleSelectAddress}
              placeholder="Digite a rua ou endereço..."
            />
          ) : (
            <input
              type="text"
              value={form.streetName}
              onChange={(e) => updateForm({ streetName: e.target.value })}
              placeholder="Nome da rua identificado..."
              className={`${inputClass} bg-paper/60 font-bold`}
            />
          )}

          <div className="mt-1 flex items-center gap-2 text-xs font-bold text-inkMuted">
            <Hash size={16} className="text-clay" />
            <span>Numeração (opcional):</span>
          </div>
          <input
            type="text"
            value={form.streetNumber}
            onChange={(e) => updateForm({ streetNumber: e.target.value })}
            placeholder="Ex: 1200"
            className={inputClass}
          />

          <div className="mt-1 flex items-center gap-2 text-xs font-bold text-inkMuted">
            <MapPin size={16} className="text-clay" />
            <span>Observação ou ponto de referência (opcional):</span>
          </div>
          <input
            type="text"
            value={form.streetReference}
            onChange={(e) => updateForm({ streetReference: e.target.value })}
            placeholder="Ex: em frente à praça, próximo ao posto..."
            className={inputClass}
          />
          <span className="text-[10px] font-medium text-inkMuted">
            * Informar o número ou ponto de referência facilita a precisão exata da
            experiência relatada.
          </span>
        </div>

        <p className="type-alt mt-2 flex items-center gap-1 text-[10px] font-medium text-clay">
          <CheckCircle2 size={12} /> Coordenadas cartográficas: ({form.lat.toFixed(4)},{' '}
          {form.lng.toFixed(4)})
        </p>
      </div>

      <Field
        label="Seu relato / proposta"
        required
        htmlFor="step3-proposal"
        error={errors.proposal}
      >
        <textarea
          id="step3-proposal"
          rows={4}
          value={form.proposal}
          onChange={(e) => updateForm({ proposal: e.target.value })}
          placeholder="Descreva sua experiência, sentimento ou desejo de transformação para este lugar..."
          className={`${inputClass} resize-none`}
        />
      </Field>

      <div className="flex flex-col gap-3 border-t border-sand pt-3">
        <label className="type-label block text-xs text-inkMuted">
          Mídias opcionais (Foto e/ou Áudio)
        </label>

        <div className="flex flex-col gap-2 rounded-2xl border-2 border-sand bg-white p-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-inkMuted">
            <Camera size={14} className="text-clay" /> Foto do Local
          </span>

          {form.photoUrl ? (
            <div className="relative overflow-hidden rounded-xl border border-sand">
              <ZoomableImage
                src={form.photoUrl}
                alt="Foto anexada"
                className="max-h-36 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => updateForm({ photoUrl: null })}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
                title="Remover foto"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void media.startCamera()}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sand bg-paper2/50 py-3 text-xs font-bold text-inkMuted transition-colors hover:bg-paper2"
            >
              <Camera size={18} /> Tirar Foto / Capturar Imagem
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border-2 border-sand bg-white p-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-inkMuted">
            <Mic size={14} className="text-clay" /> Relato em Áudio
          </span>

          {form.audioUrl ? (
            <div className="flex flex-col gap-2 rounded-xl border border-sand bg-paper p-2.5">
              <audio controls src={form.audioUrl} className="h-8 w-full" />
              <button
                type="button"
                onClick={() => updateForm({ audioUrl: null })}
                className="flex items-center justify-center gap-1 rounded-lg bg-clayDark/10 py-1.5 text-[10px] font-bold text-clayDark transition-colors hover:bg-clayDark/20"
              >
                <Trash2 size={12} /> Remover Áudio
              </button>
            </div>
          ) : media.isRecording ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-clayDark/30 bg-clayDark/10 p-4">
              <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-clayDark" />
              <span className="text-xs font-bold text-clayDark">
                Gravando... {media.recordingTime}s / {media.maxAudioSeconds}s
              </span>
              <button
                type="button"
                onClick={() => void handleStopRecording()}
                className="mt-1 rounded-lg bg-clayDark px-3 py-1.5 text-xs font-bold text-white shadow-md"
              >
                Parar Gravação
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void media.startRecording()}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sand bg-paper2/50 py-3 text-xs font-bold text-inkMuted transition-colors hover:bg-paper2"
            >
              <Mic size={18} /> Gravar Áudio
            </button>
          )}
        </div>
      </div>

      <div className="mt-auto flex gap-3 pt-4">
        <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
          VOLTAR
        </Button>
        <Button onClick={handleNext} className="flex-1">
          REVISAR DADOS
        </Button>
      </div>

      {/* Câmera em tela cheia — pré-visualização em tempo real */}
      {media.isCameraActive && (
        <div className="fixed inset-0 z-[2600] flex flex-col bg-black">
          <video
            ref={media.videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-contain"
          />
          <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-8">
            <button
              type="button"
              onClick={handleCapturePhoto}
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white text-black shadow-xl transition-transform hover:scale-105"
              aria-label="Capturar foto"
            >
              <Aperture size={28} />
            </button>
            <button
              type="button"
              onClick={media.stopCamera}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70"
              aria-label="Fechar câmera"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
