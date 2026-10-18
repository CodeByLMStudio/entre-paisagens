'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Bairros de Fortaleza (lista completa, usada de imediato — sem depender de
 * serviços externos no navegador).
 */
const FORTALEZA_NEIGHBORHOODS: string[] = [
  'Aerolândia',
  'Aeroporto (Base Aérea)',
  'Aeroporto',
  'Aldeota',
  'Alto da Balança',
  'Amadeu Furtado',
  'Ancuri',
  'Antônio Bezerra',
  'Autran Nunes',
  'Barra do Ceará',
  'Barroso',
  'Bela Vista',
  'Benfica',
  'Boa Vista',
  'Bom Futuro',
  'Bom Jardim',
  'Cais do Porto',
  'Cajazeiras',
  'Cambeba',
  'Castelão',
  'Centro',
  'Cidade 2000',
  'Cidade dos Funcionários',
  'Cocó',
  'Conjunto Ceará I',
  'Conjunto Ceará II',
  'Conjunto Esperança',
  'Couto Fernandes',
  'Cristo Redentor',
  'Curió',
  'Damas',
  'Dendê',
  'Dias Macêdo',
  'Dionísio Torres',
  'Edson Queiroz',
  'Engenheiro Luciano Cavalcante',
  'Estância (Dionísio Torres)',
  'Farias Brito',
  'Fátima',
  'Floresta',
  'Genibaú',
  'Granja de Freitas',
  'Granja Lisboa',
  'Guajeru',
  'Guararapes',
  'Henrique Jorge',
  'Itaoca',
  'Itaperi',
  'Jacarecanga',
  'Jangurussu',
  'Jardim América',
  'Jardim Cearense',
  'Jardim das Oliveiras',
  'Jardim Guanabara',
  'João XXIII',
  'Joaquim Távora',
  'Jóquei Clube',
  'José Bonifácio',
  'Lagoa Redonda',
  'Lagoa Sapiranga (Coité)',
  'Manoel Sátiro',
  'Mantural',
  'Maraponga',
  'Messejana',
  'Meireles',
  'Mondubim',
  'Montese',
  'Mucuripe',
  'Novo Mondubim',
  'Olavo Oliveira',
  'Panamericano',
  'Papicu',
  'Paupina',
  'Parangaba',
  'Parque Dois Irmãos',
  'Parque Iracema',
  'Parque Manibura',
  'Parque Santa Maria',
  'Passaré',
  'Pedras',
  'Pici',
  'Planalto Ayrton Senna',
  'Praia de Iracema',
  'Praia do Futuro I',
  'Praia do Futuro II',
  'Prefeito José Walter',
  'Presidente Kennedy',
  'Quintino Cunha',
  'Rodolfo Teófilo',
  'Sabiazinho',
  'Salinas',
  'Santa Maria',
  'Sapiranga (Coité)',
  'Serrinha',
  'Siqueira',
  'Siupé',
  'São Bento',
  'São Gerardo',
  'São João do Tauape',
  'Varjota',
  'Vicente Pinzón',
  'Vila Ellery',
  'Vila Manoel Sátiro',
  'Vila Peri',
  'Vila União',
  'Vila Velha',
  'Volta da Jurema',
];

/** Bairros conhecidos para cidades com cobertura incompleta no OSM. */
const KNOWN_NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  'Ceará - Fortaleza': FORTALEZA_NEIGHBORHOODS,
  'Ceará - Caucaia': [
    'Bom Jesus',
    'Cumbuco',
    'Genipabu',
    'Icaraí',
    'Jandaiguaba',
    'Jurema',
    'Nova Metrópole',
    'Pabussu',
    'Parque Albano',
    'Parque Soledade',
    'Tabapuá',
  ],
  'Ceará - Maracanaú': [
    'Acaracuzinho',
    'Alto da Mangueira',
    'Boa Esperança',
    'Bom Sucesso',
    'Coité',
    'Colônia Antônio Justa',
    'Conjunto Jereissati I',
    'Conjunto Jereissati II',
    'Forquilha',
    'Gererau',
    'Horto',
    'Jari',
    'Jenipapo',
    'Jubaia',
    'Mucunã',
    'Pajuçara',
    'Pajuçara (Parque Industrial)',
    'Parque Santa Maria',
    'Pitombeira',
    'Prado',
    'Santo Antônio',
    'São José',
    'Siqueira',
    'Timbó',
  ],
  'Ceará - Sobral': [
    'Alto do Cristo',
    'Betânia',
    'Campo dos Velhos',
    'Centro',
    'Cidade José Euclides',
    'Cohab I',
    'Cohab II',
    'Cohab III',
    'Dom Expedito',
    'Dom José',
    'Junco',
    'Nossa Senhora de Fátima',
    'Padre Ibiapina',
    'Parque Silvana',
    'Pedrinhas',
    'Renato Parente',
    'Sinhá Saboia',
    'Sumaré',
    'Terrenos Novos',
    'Várzea Grande',
  ],
  'Ceará - Eusébio': [
    'Amador Carneiro',
    'Autódromo',
    'Centro',
    'Encruzilhada',
    'Guarani',
    'Jardim dos Coqueirais',
    'Jabuti',
    'Lagoinha',
    'Pajuçara',
    'Parque Santa Clara',
    'Precabura',
    'Santo Antônio',
    'São Bento',
    'Tamatanduba',
  ],
  'Ceará - Aquiraz': [
    'Caponga',
    'Centro',
    'Iguape',
    'Jacaúna',
    'Jangurussu',
    'Lagoa do Paú',
    'Pindoretama',
    'Porto das Dunas',
    'Praia Bela',
    'Tapera',
  ],
};

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Busca com timeout, nunca propagando erro para o React. */
async function safeJson(url: string, init?: RequestInit, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Bairros da cidade selecionada.
 *
 * 1. Usa a lista local de bairros quando existir (Fortaleza, Caucaia…).
 * 2. Complementa com dados do OpenStreetMap (Nominatim + Overpass).
 *
 * Qualquer falha de rede é silenciosa: o formulário permite digitar o bairro
 * manualmente, e uma exceção nunca deve derrubar a página.
 */
export function useCityNeighborhoods(cityOption: string, enabled = true) {
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map<string, string[]>());

  const load = useCallback(async (option: string): Promise<string[]> => {
    const cached = cache.current.get(option);
    if (cached) return cached;

    const separatorIndex = option.indexOf(' - ');
    const stateName = separatorIndex >= 0 ? option.slice(0, separatorIndex) : '';
    const cityName = separatorIndex >= 0 ? option.slice(separatorIndex + 3) : option;

    const local = KNOWN_NEIGHBORHOODS_BY_CITY[option] ?? [];

    const places = await safeJson(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        `${cityName}, ${stateName}, Brasil`,
      )}&countrycodes=br&featureType=settlement&limit=3`,
      { headers: { 'Accept-Language': 'pt-BR' } },
    );

      let remote: string[] = [];

    if (Array.isArray(places) && places.length > 0) {
      const target = normalizeText(cityName);
      const place =
        places.find(
          (item: { name?: string }) =>
            normalizeText((item as { name?: string }).name ?? '') === target,
        ) ?? (places[0] as { lat?: string; lon?: string });

      const lat = Number((place as { lat?: string } | undefined)?.lat);
      const lon = Number((place as { lon?: string } | undefined)?.lon);

      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        const query = `[out:json][timeout:20];(node["place"~"^(suburb|neighbourhood|quarter)$"](around:12000,${lat},${lon});way["place"~"^(suburb|neighbourhood|quarter)$"](around:12000,${lat},${lon}););out tags 300;`;

        const data = await safeJson('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
        });

        const elements = (data as { elements?: Array<{ tags?: Record<string, string> }> })
          ?.elements;

        if (Array.isArray(elements)) {
          remote = elements
            .map((element) => element.tags?.name)
            .filter(
              (name): name is string => typeof name === 'string' && name.trim().length > 0,
            )
            .map((name) => name.trim());
        }
      }
    }

    const merged = new Set<string>([...local, ...remote]);
    const result = [...merged].sort((a, b) => a.localeCompare(b, 'pt-BR'));

    cache.current.set(option, result);
    return result;
  }, []);

  useEffect(() => {
    if (!enabled || !cityOption.trim()) {
      setNeighborhoods([]);
      return;
    }

    let active = true;

    // Exibe imediatamente os bairros conhecidos (quando houver).
    setNeighborhoods(KNOWN_NEIGHBORHOODS_BY_CITY[cityOption] ?? []);
    setLoading(true);

    const timer = setTimeout(() => {
      void load(cityOption)
        .catch(() => [])
        .then((result) => {
          if (active) setNeighborhoods(result);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [cityOption, enabled, load]);

  return { neighborhoods, loading };
}

export { FORTALEZA_NEIGHBORHOODS };

/** Cidades com lista de bairros local (lista imediata). */
export const CITIES_WITH_LOCAL_NEIGHBORHOODS = Object.keys(KNOWN_NEIGHBORHOODS_BY_CITY);
