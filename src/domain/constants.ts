import type { UserProfile } from './types';

// ---------------------------------------------------------------------------
// Identidade / conteúdo estático
// ---------------------------------------------------------------------------

export const HOME_BG_URL =
  'https://lh3.googleusercontent.com/d/1Ll2Q1zSE-FxdVhIk5ILFq9bjz82lYyCI=s2000';

// ---------------------------------------------------------------------------
// Eixos analíticos
// ---------------------------------------------------------------------------

export const EIXOS = ['PERCEBER', 'VIVER', 'SENTIR', 'IMAGINAR'] as const;

export const EIXO_COLORS: Record<(typeof EIXOS)[number], string> = {
  PERCEBER: '#687878',
  VIVER: '#646746',
  SENTIR: '#A36437',
  IMAGINAR: '#70563D',
};

export const EIXO_DESCRIPTIONS: Record<(typeof EIXOS)[number], string> = {
  PERCEBER:
    'Como os sentidos e a observação captam os elementos visuais, físicos e ambientais do território.',
  VIVER:
    'O cotidiano, o uso prático, a rotina e a vivência direta dos espaços urbanos.',
  SENTIR:
    'As emoções, afetos, a segurança, o aconchego ou incômodo despertados pelo lugar.',
  IMAGINAR:
    'Os desejos de transformação, propostas e visões de futuro para a paisagem urbana.',
};

// ---------------------------------------------------------------------------
// Dimensões da paisagem
// ---------------------------------------------------------------------------

export const LANDSCAPE_DIMENSIONS_LIST = [
  'Conforto ambiental',
  'Acessibilidade',
  'Caminhabilidade',
  'Permanência',
  'Apropriação',
  'Vegetação e natureza',
  'Orientação e legibilidade',
  'Experiência sensorial',
  'Segurança',
  'Sociabilidade',
  'Manutenção e conservação',
  'Desejos de transformação',
] as const;

export const LANDSCAPE_DIMENSION_DESCRIPTIONS: Record<
  (typeof LANDSCAPE_DIMENSIONS_LIST)[number],
  string
> = {
  'Conforto ambiental':
    'Avaliação de microclima, temperatura, ventilação natural e proteção contra intempéries urbanas.',
  Acessibilidade:
    'Condições de mobilidade universal, rampas, pisos táteis e facilidade de trânsito para todos os públicos.',
  Caminhabilidade:
    'Qualidade, continuidade e segurança das calçadas e percursos a pé.',
  Permanência:
    'Disponibilidade de espaços, assentos e condições convidativas para o descanso e permanência no local.',
  Apropriação:
    'Sensação de pertencimento, uso ativo, livre expressão e identificação da comunidade com o espaço.',
  'Vegetação e natureza':
    'Presença de árvores, áreas verdes, jardins e integração com elementos naturais.',
  'Orientação e legibilidade':
    'Clareza visual, sinalização e facilidade de reconhecimento e navegação do espaço urbano.',
  'Experiência sensorial':
    'Estímulos auditivos, olfativos, táteis e visuais presentes na paisagem urbana.',
  Segurança:
    'Sensação subjetiva de segurança pública, iluminação e proteção contra criminalidade.',
  Sociabilidade:
    'Oportunidades de encontro, convivência social e interações comunitárias.',
  'Manutenção e conservação':
    'Estado de conservação de pavimentação, mobiliário urbano, limpeza e zeladoria pública.',
  'Desejos de transformação':
    'Expectativas, demandas e propostas coletivas para melhoria e renovação da paisagem.',
};

// ---------------------------------------------------------------------------
// Relação com o espaço
// ---------------------------------------------------------------------------

export const RELACOES = [
  'Moro próximo',
  'Trabalho próximo',
  'Estudo próximo',
  'Passo por aqui com frequência',
  'Venho para lazer',
  'Venho para encontrar pessoas',
  'Venho praticar alguma atividade',
  'Estou visitando',
  'Outra',
] as const;

// ---------------------------------------------------------------------------
// Listas de apoio para formulários
// ---------------------------------------------------------------------------

export const RESIDENCE_DURATION_OPTIONS = [
  '1 mês ou menos',
  'Menos de 1 ano',
  '1 a 3 anos',
  '3 a 5 anos',
  '5 a 10 anos',
  'Mais de 10 anos',
  'A vida toda',
] as const;

/** Opção especial do campo "Nome ou apelido": publica o relato como anônimo. */
export const ANONYMOUS_OPTION = 'Prefiro não informar';

/** Nome exibido nos relatos registrados de forma anônima. */
export const ANONYMOUS_DISPLAY_NAME = 'Anônimo';

/** Valor interno usado no estado quando a pessoa prefere não informar o nome. */
export const ANONYMOUS_SELECTION = '__anonymous__';

export const AGE_GROUP_OPTIONS = [
  'até 12 anos',
  '13-17',
  '18-24',
  '25-34',
  '35-44',
  '45-59',
  '60+',
] as const;

export const CONDITION_OPTIONS = [
  'Pessoa neurodivergente',
  'Pessoa com deficiência visual ou baixa visão',
  'Pessoa com deficiência auditiva ou surdez',
  'Pessoa com deficiência física ou mobilidade reduzida',
  'Pessoa com deficiência intelectual',
  'Pessoa com deficiência múltipla',
  'Outra condição',
  'Não me identifico com nenhuma dessas condições',
  'Não sei informar',
  'Prefiro não responder',
] as const;

export const FACILITATORS_LIST = [
  'Sombra',
  'Silêncio',
  'Vegetação',
  'Lugares para sentar',
  'Boa iluminação',
  'Sensação de segurança',
  'Calçadas largas',
  'Limpeza',
] as const;

export const DIFFICULTIES_LIST = [
  'Calor',
  'Ruído',
  'Falta de sombra',
  'Trânsito',
  'Obstáculos',
  'Iluminação intensa',
  'Poluição',
  'Buracos',
] as const;

export const NEIGHBORHOODS_FALLBACK = [
  'Aldeota',
  'Alagadiço',
  'Alto da Balança',
  'Amadeu Furtado',
  'Antônio Bezerra',
  'Barra do Ceará',
  'Bela Vista',
  'Benfica',
  'Bom Jardim',
  'Cais do Porto',
  'Cajazeiras',
  'Cambeba',
  'Centro',
  'Cidade 2000',
  'Cidade dos Funcionários',
  'Cocó',
  'Cristo Redentor',
  'Dionisio Torres',
  'Edson Queiroz',
  'Fátima',
  'Farias Brito',
  'Guararapes',
  'Itaoca',
  'Itaperi',
  'Jacarecanga',
  'Jereissati',
  'Joaquim Távora',
  'Jóquei Clube',
  'Lagoa Redonda',
  'Messejana',
  'Meireles',
  'Montese',
  'Mucuripe',
  'Papicu',
  'Parangaba',
  'Parque Manibura',
  'Passaré',
  'Paupina',
  'Pici',
  'Praia de Iracema',
  'Praia do Futuro I',
  'Praia do Futuro II',
  'Presidente Kennedy',
  'Siqueira',
  'Varjota',
  'Vila Velha',
].sort();

// ---------------------------------------------------------------------------
// Estados iniciais
// ---------------------------------------------------------------------------

export const INITIAL_PROFILE: UserProfile = {
  name: '',
  isAnonymous: false,
  ageGroup: '',
  state: '',
  city: '',
  neighborhood: '',
  residenceDuration: '',
  relation: 'Moro próximo',
  frequency: 'Diariamente',
  timeOfDay: 'Manhã',
  transport: 'A pé',
  company: 'Sozinho',
  influencingFactors: [],
  conditions: [],
  sensoryMobilityNotes: '',
};

