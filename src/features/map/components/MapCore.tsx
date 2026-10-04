'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FORTALEZA_BOUNDS, FORTALEZA_CENTER, FORTALEZA_PIN_ZOOM } from '@/lib/geo';
import type { Eixo, MapPoint } from '@/domain/types';
import type { MapContainerProps } from '../types';
import { fetchFortalezaBoundary } from '@/lib/boundary';
import { experienceMarkerHtml, pendingMarkerHtml } from '../lib/markers';
import { MapCompass } from './MapCompass';
import { MapLegend } from './MapLegend';

const DEFAULT_ZOOM = 13;

// Restringe o pan/zoom à área urbana de Fortaleza (com pequena margem).
const FORTALEZA_MAX_BOUNDS = L.latLngBounds(
  L.latLng(FORTALEZA_BOUNDS.minLat - 0.01, FORTALEZA_BOUNDS.minLng - 0.01),
  L.latLng(FORTALEZA_BOUNDS.maxLat + 0.01, FORTALEZA_BOUNDS.maxLng + 0.01),
);

const ARCGIS_TILES =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';

/** Eixo dominante de um ponto (o do relato mais recente). */
function dominantEixo(point: MapPoint): Eixo {
  return point.experiences[0]?.eixo ?? 'PERCEBER';
}

export default function MapCore({
  points,
  selectedPointId,
  onSelectPoint,
  onMapClick,
  pendingCoord,
  onClearPendingCoord,
  activeDimensions,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pendingMarkerRef = useRef<L.Marker | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);

  // Mantém os callbacks mais recentes sem recriar o mapa.
  const callbacksRef = useRef({ onSelectPoint, onMapClick, onClearPendingCoord });
  useEffect(() => {
    callbacksRef.current = { onSelectPoint, onMapClick, onClearPendingCoord };
  });

  // Inicialização do mapa (uma única vez).
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      minZoom: 12,
      maxZoom: 18,
      maxBounds: FORTALEZA_MAX_BOUNDS,
      maxBoundsViscosity: 1.0,
    }).setView([FORTALEZA_CENTER.lat, FORTALEZA_CENTER.lng], DEFAULT_ZOOM);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ position: 'bottomleft', imperial: false, metric: true }).addTo(map);

    L.tileLayer(ARCGIS_TILES, {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics',
    }).addTo(map);

    map.on('click', (event: L.LeafletMouseEvent) => {
      callbacksRef.current.onMapClick?.(event.latlng.lat, event.latlng.lng);
    });

    map.on('dblclick', () => {
      callbacksRef.current.onClearPendingCoord?.();
    });

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Demarcação territorial de Fortaleza (malha municipal do IBGE).
    fetchFortalezaBoundary().then((geojson) => {
      if (geojson && mapRef.current) {
        const layer = L.geoJSON(geojson as Parameters<typeof L.geoJSON>[0], {
          style: {
            color: '#A36437',
            weight: 2.5,
            dashArray: '6 5',
            fillColor: '#A36437',
            fillOpacity: 0.06,
          },
        });
        layer.addTo(mapRef.current);
        boundaryLayerRef.current = layer;
      }
    });

    const invalidateTimer = setTimeout(() => map.invalidateSize(), 100);
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      clearTimeout(invalidateTimer);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      boundaryLayerRef.current = null;
    };
  }, []);

  // Renderiza os marcadores dos pontos.
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    for (const point of points) {
      const isSelected = selectedPointId === point.pointId;
      const size = isSelected ? 34 : 24;

      const icon = L.divIcon({
        className: 'ep-marker',
        html: experienceMarkerHtml(point, size, isSelected, activeDimensions, {
          dominantEixo: dominantEixo(point),
        }),
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([point.lat, point.lng], { icon });
      marker.on('click', (event) => {
        L.DomEvent.stopPropagation(event.originalEvent);
        callbacksRef.current.onSelectPoint(point.pointId);
      });
      marker.addTo(layer);
    }
  }, [points, selectedPointId, activeDimensions]);

  // Marcador temporário (coordenada pendente).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pendingMarkerRef.current) {
      pendingMarkerRef.current.remove();
      pendingMarkerRef.current = null;
    }

    if (!pendingCoord) return;

    const icon = L.divIcon({
      className: 'ep-pending-marker',
      html: pendingMarkerHtml(),
      iconSize: [40, 50],
      iconAnchor: [20, 48],
    });

    const marker = L.marker([pendingCoord.lat, pendingCoord.lng], { icon }).addTo(map);
    marker.on('click', (event) => L.DomEvent.stopPropagation(event.originalEvent));
    marker.on('dblclick', (event) => {
      L.DomEvent.stopPropagation(event.originalEvent);
      callbacksRef.current.onClearPendingCoord?.();
    });

    pendingMarkerRef.current = marker;
  }, [pendingCoord]);

  // Centraliza no ponto selecionado.
  useEffect(() => {
    const point = points.find((p) => p.pointId === selectedPointId);
    if (mapRef.current && point) {
      mapRef.current.flyTo([point.lat, point.lng], FORTALEZA_PIN_ZOOM, {
        duration: 1.2,
      });
    }
  }, [selectedPointId, points]);

  const resetNorth = () => {
    mapRef.current?.setView([FORTALEZA_CENTER.lat, FORTALEZA_CENTER.lng], DEFAULT_ZOOM);
  };

  return (
    <div className="relative h-full min-h-[400px] w-full">
      <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full bg-paper2" />
      <MapCompass onReset={resetNorth} />
      <MapLegend />
    </div>
  );
}
