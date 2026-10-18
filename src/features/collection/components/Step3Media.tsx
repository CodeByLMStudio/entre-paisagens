'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Aperture,
  Building,
  Camera,
  CheckCircle2,
  Loader2,
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
import { StepLayout } from './StepLayout';

export function Step3Media() {
  const form = useCollectionStore((s) => s.form);
  const updateForm = useCollectionStore((s) => s.updateForm);
  const setStep = useCollectionStore((s) => s.setStep);
  const close = useCollectionStore((s) => s.close);
  const setPickingMode = useMapStore((s) => s.setPickingMode);
  const showToast = useUiStore((s) => s.showToast);
  const router = useRouter();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmGpsAddress, setConfirmGpsAddress] = useState(false);
  const [detectedStreet, setDetectedStreet] = useState('');
  const [askOnSite, setAskOnSite] = useState(false);
  const [manualAddressHint, setManualAddressHint] = useState(false);
  const { getCurrentLocation, isLocating } = useLocationServices();
  const media = useMediaCapture({ onError: (message) => showToast(message, 'error') });

  const clearLocationError = () => {
    setErrors((current) => {
      const next = { ...current };
      delete next.locationSource;
      return next;
    });
  };

  const handleUseGps = async () => {
    const street = await getCurrentLocation();
    if (street) {
      setDetectedStreet(street);
      setConfirmGpsAddress(true);
      setAskOnSite(false);
      setManualAddressHint(false);
      clearLocationError();
    }
  };

  const handleConfirmGps = (correct: boolean) => {
    setConfirmGpsAddress(false);

    if (correct) {
      updateForm({ locationSource: 'gps', isOnSite: true });
      setManualAddressHint(false);
      setAskOnSite(false);
      clearLocationError();
    } else {
      // GPS encontrou o endereço errado: o usuário informa o correto abaixo.
      setManualAddressHint(true);
      setAskOnSite(false);
      updateForm({ locationSource: '', isOnSite: false });
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
      locationSource: 'address',
      isOnSite: false,
    });
    setManualAddressHint(false);
    setAskOnSite(true);
    clearLocationError();
  };

  const handleOnSiteAnswer = (isOnSite: boolean) => {
    setAskOnSite(false);
    updateForm({ locationSource: 'address', isOnSite });
    clearLocationError();
  };

  const handleNext = () => {
    if (confirmGpsAddress || askOnSite) {
      setErrors({
        locationSource: 'Confirme a localização do relato antes de prosseguir.',
      });
      return;
    }

    const result = step3Schema.safeParse({
      lat: form.lat,
      lng: form.lng,
      locationSource: form.locationSource,
      isOnSite: form.isOnSite,
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

  const locationStatusLabel =
    form.locationSource === 'gps'
      ? 'Registrado no local (GPS)'
      : form.locationSource === 'map'
        ? 'Marcado no mapa'
        : form.locationSource === 'address'
          ? form.isOnSite
            ? 'Registrado no local (endereço informado)'
            : 'Endereço pesquisado (registro à distância)'
          : 'Local ainda não informado';

  return (
    <>
      <StepLayout
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
              VOLTAR
            </Button>
            <Button onClick={handleNext} className="flex-1">
              REVISAR DADOS
            </Button>
          </div>
        }
      >
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
            aria-busy={isLocating}
          >
            {isLocating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Navigation size={14} />
            )}
            {isLocating ? 'Obtendo...' : 'Estou no local (GPS)'}
          </Button>
          <Button variant="dark" onClick={handlePickOnMap} className="flex-1">
            <MousePointerClick size={14} /> Marcar no mapa
          </Button>
        </div>

        {/* Confirmação do endereço detectado pelo GPS */}
        {confirmGpsAddress && (
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
              <Button onClick={() => handleConfirmGps(true)} className="flex-1">
                Sim, está correto
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleConfirmGps(false)}
                className="flex-1"
              >
                Não, informar endereço
              </Button>
            </div>
          </div>
        )}

        {askOnSite && (
          <div className="mb-3 flex flex-col gap-3 rounded-2xl border-2 border-moss bg-paper p-4">
            <div className="flex items-start gap-2">
              <MapPin size={18} className="mt-0.5 shrink-0 text-moss" />
              <div className="text-sm text-ink">
                <p className="font-bold">Você está neste local?</p>
                <p className="mt-1 text-xs text-inkMuted">
                  {form.streetName || 'Endereço selecionado.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleOnSiteAnswer(true)} className="flex-1">
                Sim, estou aqui
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleOnSiteAnswer(false)}
                className="flex-1"
              >
                Não, à distância
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-2xl border-2 border-sand bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-inkMuted">
            <Building size={16} className="text-clay" />
            <span>Pesquise o endereço (rua ou logradouro):</span>
          </div>

          <AddressAutocomplete
            id="step3-address"
            value={form.streetName}
            onSelect={handleSelectAddress}
            placeholder="Digite a rua ou endereço em qualquer cidade do Brasil..."
          />
          <span className="text-[10px] font-medium text-inkMuted">
            Selecione uma sugestão para definir as coordenadas do relato.
          </span>

          {manualAddressHint && (
            <span className="rounded-lg bg-clay/10 px-3 py-2 text-[11px] font-bold text-clayDark">
              Informe abaixo o endereço correto do local onde você está.
            </span>
          )}

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
            * Informar um ponto de referência facilita a identificação do local da
            experiência relatada.
          </span>
        </div>

        <div className="mt-2 flex flex-col gap-1">
          <p className="type-alt flex items-center gap-1 text-[10px] font-medium text-clay">
            <CheckCircle2 size={12} /> Coordenadas cartográficas: ({form.lat.toFixed(4)},{' '}
            {form.lng.toFixed(4)})
          </p>
          <p className="text-[10px] font-bold text-inkMuted">
            Forma de registro: <span className="text-ink">{locationStatusLabel}</span>
          </p>
          {errors.locationSource && (
            <span role="alert" className="text-[11px] font-bold text-clayDark">
              {errors.locationSource}
            </span>
          )}
          {errors.lat && (
            <span role="alert" className="text-[11px] font-bold text-clayDark">
              {errors.lat}
            </span>
          )}
        </div>
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

      </div>
      </StepLayout>

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
    </>
  );
}
