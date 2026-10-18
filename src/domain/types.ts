import type {
  EIXOS,
  LANDSCAPE_DIMENSIONS_LIST,
  RELACOES,
} from './constants';

export type Eixo = (typeof EIXOS)[number];

export type Relacao = (typeof RELACOES)[number];

export type LandscapeDimension = (typeof LANDSCAPE_DIMENSIONS_LIST)[number];

export type MediaType = 'photo' | 'audio' | 'both' | 'none';

/** Como o local do relato foi informado pelo usuário. */
export type LocationSource = 'gps' | 'map' | 'address';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface UserProfile {
  name: string;
  /** `true` quando a pessoa escolheu publicar o relato como anônimo. */
  isAnonymous?: boolean;
  ageGroup: string;
  /** Sigla do estado de residência (ex.: "CE"). */
  state: string;
  /** Município de residência no formato "Ceará - Fortaleza". */
  city: string;
  neighborhood: string;
  residenceDuration: string;
  relation: Relacao;
  frequency: string;
  timeOfDay: string;
  transport: string;
  company: string;
  influencingFactors: string[];
  conditions: string[];
  sensoryMobilityNotes: string;
}

export interface Experience {
  id: string;
  /** Identificador do ponto (local) ao qual esta experiência pertence. */
  pointId: string;
  lat: number;
  lng: number;
  /** Bairro do local da interação (detectado por geocodificação reversa). */
  locationNeighborhood?: string;
  streetName?: string;
  streetNumber?: string;
  streetReference?: string;
  streetNumberOrObs?: string;
  eixo: Eixo;
  photoUrl?: string | null;
  audioUrl?: string | null;
  mediaType?: MediaType;
  mediaUrl?: string | null;
  relation: Relacao;
  /** Explicação livre quando a relação com o espaço é "Outra". */
  relationOther?: string;
  /** Origem da localização do relato (GPS, mapa ou endereço pesquisado). */
  locationSource?: LocationSource;
  /** Indica se o registro foi feito no próprio local ou à distância. */
  isOnSite?: boolean;
  proposal: string;
  date: string;
  profile: UserProfile;
  dimensions: LandscapeDimension[];
  facilitators: string[];
  difficulties: string[];
}

/**
 * Ponto do mapa: agrupa as experiências de um mesmo local (mesmo logradouro +
 * número, ou mesma coordenada). Exibido como uma única marcação com histórico.
 */
export interface MapPoint {
  pointId: string;
  lat: number;
  lng: number;
  streetName?: string;
  streetNumber?: string;
  streetReference?: string;
  locationNeighborhood?: string;
  experiences: Experience[];
}

/**
 * Rascunho do formulário de relato (multi-step).
 * Diferencia-se de `Experience` por ainda não ter `profile` acoplado
 * e por manter `streetName`/`streetReference` sempre presentes (string).
 */
export interface ExperienceDraft {
  id: string;
  /** Ponto ao qual o rascunho será associado (gerado ao iniciar/submeter). */
  pointId?: string;
  lat: number;
  lng: number;
  locationNeighborhood: string;
  streetName: string;
  streetReference: string;
  eixo: Eixo;
  photoUrl: string | null;
  audioUrl: string | null;
  relation: Relacao;
  relationOther: string;
  locationSource: LocationSource | '';
  isOnSite: boolean;
  proposal: string;
  date: string;
  dimensions: LandscapeDimension[];
  facilitators: string[];
  difficulties: string[];
}

export type EixoFilter = Eixo | 'ALL';
