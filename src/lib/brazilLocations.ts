import brazilStates from '@/data/brazil-states.json';
import brazilMunicipalities from '@/data/brazil-municipalities.json';

export interface BrazilState {
  sigla: string;
  nome: string;
}

export const BRAZIL_STATES: BrazilState[] = brazilStates as BrazilState[];

/** Cidade no formato "Estado - Cidade". */
export function getCityLabel(option: string): string {
  const index = option.indexOf(' - ');
  return index < 0 ? option : option.slice(index + 3);
}

/** Nome do estado a partir da sigla (ex.: "CE" → "Ceará"). */
export function getStateName(sigla: string): string {
  return BRAZIL_STATES.find((state) => state.sigla === sigla)?.nome ?? sigla;
}

const allCities = brazilMunicipalities as string[];

/** Cidades de um estado, no formato "Ceará - Caucaia". */
export function getCityOptionsForState(sigla: string): string[] {
  if (!sigla) return [];
  const prefix = `${getStateName(sigla)} - `;
  return allCities.filter((option) => option.startsWith(prefix));
}

/** Todas as cidades do Brasil, no formato "Estado - Cidade". */
export const BRAZIL_CITY_OPTIONS: string[] = allCities;

/** Valida se a cidade pertence ao estado informado. */
export function belongsToState(city: string, sigla: string): boolean {
  return Boolean(city && sigla && city.startsWith(`${getStateName(sigla)} - `));
}

/** Municípios com lista de bairros pré-carregada (imediata) além do OSM. */
export const NEIGHBORHOOD_CITIES = [] as const;
