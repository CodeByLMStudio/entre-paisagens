# 🌆 Entre Paisagens

**Mapeamento participativo e percepção da paisagem urbana de Fortaleza (CE).**

O *Entre Paisagens* é uma plataforma web que dá voz à comunidade para **mapear,
qualificar e transformar** a experiência cotidiana da cidade. Por meio de um mapa
interativo, cidadãs e cidadãos registram suas percepções, vivências, sentimentos e
desejos de futuro para o território urbano, gerando um diagnóstico coletivo da
paisagem de Fortaleza.

---

## 📖 O que é e para que serve

Muitas vezes, quem melhor conhece a cidade é quem a vive diariamente. O *Entre
Paisagens* transforma esse conhecimento em dados: cada pessoa pode marcar um ponto
no mapa e registrar como **percebe**, **vive**, **sente** e **imagina** aquele
lugar.

A plataforma organiza os relatos em **quatro eixos analíticos** e **doze dimensões
paisagísticas**, permitindo filtrar, ler e cruzar as informações para apoiar
políticas públicas, diagnósticos urbanos e ações comunitárias.

### Os quatro eixos

| Eixo | O que registra |
| --- | --- |
| **PERCEBER** | Como os sentidos e a observação captam os elementos visuais, físicos e ambientais do território. |
| **VIVER** | O cotidiano, o uso prático, a rotina e a vivência direta dos espaços urbanos. |
| **SENTIR** | As emoções, afetos, a segurança percebida, o aconchego ou incômodo despertados pelo lugar. |
| **IMAGINAR** | Os desejos de transformação, propostas e visões de futuro para a paisagem urbana. |

### As doze dimensões da paisagem

Conforto ambiental · Acessibilidade · Caminhabilidade · Permanência · Apropriação ·
Vegetação e natureza · Orientação e legibilidade · Experiência sensorial ·
Segurança percebida · Sociabilidade · Manutenção e conservação · Desejos de
transformação.

---

## ✨ Funcionalidades

- **Mapa interativo de Fortaleza** — com demarcação territorial real (malha
  municipal do IBGE), zoom e pan restritos à cidade.
- **Registro de experiências** — fluxo em 4 passos: perfil sociodemográfico →
  sobre o lugar (eixo + dimensões) → relato e mídias → revisão.
- **Localização por GPS** — com confirmação do endereço detectado e opção de
  corrigir digitando (autocompletar de endereços em tempo real).
- **Mídias** — foto (câmera em tela cheia, comprimida até 0,5 MB) e áudio (máx.
  30s), com pré-visualização e ampliação por lightbox.
- **Pontos com histórico** — experiências de um mesmo local (mesmo logradouro +
  número) são agrupadas em um único ponto, acumulando o histórico.
- **Filtros** — por eixo (cor) e por dimensão paisagística (multisseleção com
  ícones específicos e contadores).
- **Leitura da Paisagem** — estatísticas e catálogo das percepções coletadas.
- **Fale Conosco** — mensagem enviada diretamente pelo WhatsApp.
- **Geodados reais** — bairros (Overpass/OpenStreetMap), endereços (Nominatim) e
  limites municipais (IBGE), sem dados fictícios.

---

## 🧭 Como usar

1. Acesse a aplicação e clique em **"Registrar Experiência"**.
2. Informe seu **perfil** (faixa etária, bairro, tempo de moradia, etc.).
3. Escolha o **local** (GPS, digitação de endereço ou clique no mapa).
4. Classifique o **eixo** e as **dimensões paisagísticas** da experiência.
5. Escreva o **relato** e, se quiser, anexe foto/áudio.
6. **Revise e conclua** — seu relato entra no mapa e passa a compor o
   diagnóstico coletivo.

Na **Leitura da Paisagem** você vê as estatísticas por eixo e navega pelos
relatos. No mapa, clique em uma marcação para ver o histórico do local e
registrar uma nova experiência no mesmo ponto.

---

## 🛠️ Stack tecnológica

| Área | Tecnologia |
| --- | --- |
| Framework | **Next.js 14** (App Router) — Server Components por padrão |
| Linguagem | **TypeScript** (strict + `noUncheckedIndexedAccess`) |
| Estilo | **Tailwind CSS** (identidade rústico-urbana) |
| Mapas | **Leaflet 1.9** (client-side, via `next/dynamic` + `ssr: false`) |
| Estado global | **Zustand** (stores por responsabilidade) |
| Validação | **Zod** (formulários, relatos e bounds geográficos) |
| Ícones | **lucide-react** |
| Fontes | Montserrat / Lato / Manrope via `next/font` |
| Geodados | Overpass API, IBGE Malhas, Nominatim (todos abertos/gratuitos) |

---

## 🚀 Como executar localmente

### Pré-requisitos

- Node.js 18.17+ (recomendado Node 20 — ver `.nvmrc`).

### Instalação

```bash
git clone https://github.com/CodeByLMStudio/entre-paisagens.git
cd entre-paisagens
npm install
```

### Scripts

```bash
npm run dev        # servidor de desenvolvimento → http://localhost:3000
npm run build      # build de produção
npm run start      # inicia o build de produção
npm run typecheck  # valida os tipos (tsc --noEmit)
npm run lint       # lint (next lint)
```

### Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e ajuste:

| Variável | Descrição | Padrão |
| --- | --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp do "Fale Conosco" (DDI+DDD+número) | placeholder |

---

## ☁️ Deploy na Vercel

A aplicação é auto-detectada pela Vercel (Next.js + App Router), sem
configuração adicional.

1. **Suba o repositório** no GitHub.
2. Na Vercel, **Add New Project → Import** e selecione o repositório
   (framework **Next.js** detectado automaticamente).
3. Em **Settings → Environment Variables**, adicione:
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` = seu número (ex.: `5585912345678`).
4. Clique em **Deploy**.

> ⚠️ Variáveis `NEXT_PUBLIC_*` são embutidas no bundle durante o build. Ao
> alterá-las, faça um novo *deploy* para refletir as mudanças.

Opcionalmente, via CLI:

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # produção
```

---

## 🏗️ Arquitetura

Organização baseada em **features/domínios**, com separação clara entre dados,
regras e UI.

```
src/
├── app/                     # Rotas App Router (Server Components)
│   ├── layout.tsx           # Layout raiz + overlays globais (modais/toast)
│   ├── page.tsx             # Home (/)
│   ├── mapa/page.tsx        # Dashboard/mapa (/mapa)
│   ├── leitura/page.tsx     # Leitura da paisagem (/leitura)
│   ├── sobre/page.tsx       # Sobre (/sobre)
│   ├── globals.css          # Tailwind + sobrescritas Leaflet
│   └── loading.tsx / error.tsx / not-found.tsx
├── components/
│   ├── layout/              # AppHeader, AppFooter, AppProviders
│   ├── modals/              # EixoInfoModal, ContactModal, TutorialModal
│   └── ui/                  # Button, Modal, Dropdown, Combobox, Field, Toast…
├── domain/                  # Tipos, constantes e schemas (fonte da verdade)
│   ├── types.ts             # Experience, MapPoint, ExperienceDraft…
│   ├── constants.ts         # Eixos, dimensões, cores, listas
│   └── schemas.ts           # Validação Zod (perfil, passos, experiência)
├── features/
│   ├── map/                 # Mapa (Leaflet), filtros, painel de detalhes
│   ├── collection/          # Fluxo de relato (4 passos) + hooks
│   ├── reading/             # Estatísticas e catálogo
│   ├── home/                # Hero da home
│   └── about/               # Página "Sobre"
├── hooks/                   # useGeocoding, useMediaCapture, useLocationServices…
├── lib/
│   ├── geo.ts               # Bounds/centro de Fortaleza
│   ├── boundary.ts          # Malha municipal + ponto-em-polígono
│   ├── geocoding.ts         # Nominatim (reverse + busca) com timeout/fallback
│   ├── geolocation.ts       # Geolocalização com refinamento de precisão
│   ├── points.ts            # Agrupamento de experiências por ponto
│   ├── sanitize.ts          # Sanitização de inputs (anti-XSS)
│   ├── storage.ts           # localStorage seguro (SSR + try/catch)
│   ├── dimensionIcons.ts    # Ícones das dimensões paisagísticas
│   ├── zodUtils.ts          # Issues Zod → record de erros
│   ├── utils.ts             # cn, generateId, formatDate…
│   └── repositories/        # experienceRepository (persistência)
└── stores/                  # Stores Zustand (experience, map, collection, ui)
```

### Responsabilidades-chave

- **`domain/`** — tipos/constantes derivados de tuplas `as const` (evita
  duplicação e drift) + schemas Zod reutilizáveis em qualquer camada.
- **`stores/`** — 4 stores Zustand:
  - `experienceStore` — relatos e derivação de pontos (persistidos via repositório).
  - `mapStore` — filtros, ponto selecionado, coordenada pendente e modo "marcar".
  - `collectionStore` — rascunho e estado do modal de relato.
  - `uiStore` — toast e modais de contato/tutorial.
- **`lib/repositories/`** — persistência (localStorage) isolada para futura troca
  por Server Actions / API Routes / banco.
- **`lib/sanitize.ts`** — sanitização de texto e whitelist de URLs de mídia
  (prevenção de XSS). Os marcadores do Leaflet interpolam apenas constantes
  seguras, nunca dados do usuário.

### Mapa isolado do SSR

`features/map/components/MapContainer.tsx` carrega o `MapCore` via
`dynamic(..., { ssr: false })`, evitando `window is not defined`. O CSS do
Leaflet é importado dentro do componente client-only, e um `MapFallback` é
exibido enquanto carrega.

---

## 📐 Modelo de dados (pontos e histórico)

As experiências são agrupadas em **pontos do mapa** (`MapPoint`), representando
um local único. Uma nova experiência é agregada a um ponto existente quando:

- possui o mesmo **logradouro + número**; ou
- (na ausência de número) a mesma **coordenada** aproximada.

Cada ponto exibe um contador com o total de experiências, e o painel de detalhes
mostra o **histórico completo** do local, com a opção de registrar uma nova
experiência no mesmo ponto.

**Validação geográfica**: o registro só é permitido **dentro da área demarcada**
de Fortaleza (malha municipal do IBGE), via teste de ponto-em-polígono — não
apenas por bounding box.

---

## 🎨 Identidade visual

O design segue uma estética **rústico-urbana** inspirada em mapas cartográficos:

| Token | Cor |
| --- | --- |
| Fundo (`paper`) | `#F9EED8` |
| Fundo secundário (`paper2`) | `#F2E3C8` |
| Texto (`ink`) | `#42422A` |
| Acento terroso (`clay`) | `#A36437` |
| Acento vegetal (`moss`) | `#646746` |
| Borda (`sand`) | `#DDBD8C` |

### Tipografia

| Uso | Fonte | Peso | Configuração |
| --- | --- | --- | --- |
| Títulos e nomes de lugares | Montserrat | Medium (500) | Caixa alta; tracking 2–3pt; 10–12pt |
| Legenda e textos auxiliares | Lato | Regular (400) | 8–9pt (fonte base) |
| Alternativa minimalista | Manrope | Regular (400) | 8–10pt |
| Título da legenda | Montserrat | SemiBold (600) | Caixa alta; tracking 1,5–2pt; 9–10pt |

Classes utilitárias em `globals.css`: `.type-display`, `.type-label`, `.type-alt`.

---

## 📦 Limites de mídia

- **Áudio**: máximo de 30s (auto-stop).
- **Imagem**: comprimida automaticamente até 0,5 MB (redução progressiva de
  qualidade e resolução), adequada para câmeras de alta resolução.

---

## 🔒 Segurança e resiliência

- **Sanitização de inputs** — remoção de caracteres de controle, tags e validação
  de protocolos de URLs de mídia (anti-XSS).
- **Validação Zod** em múltiplas camadas (cliente e persistência).
- **Galocodificação com fallback** — Nominatim com timeout e degradação elegante
  (sem quebrar a experiência em caso de falha).
- **Tratamento de erros globais** — `error.tsx` (Error Boundary), `loading.tsx` e
  `not-found.tsx`.
- **Geolocalização com refinamento** — `watchPosition` coleta múltiplas leituras
  e resolve com a mais precisa.

---

## 📈 Decisões de projeto

- **Hidratação sem mismatch** — `experienceStore.hydrate()` em `useEffect` (via
  `AppProviders`), com skeleton até a hidratação concluir.
- **Validação por passo** — cada etapa do relato valida seu subconjunto com Zod e
  exibe erros inline.
- **Mídia** — fotos são `data:` URLs (o `next/image` não otimiza data URLs); a
  home usa `next/image` para o fundo estático remoto.
- **Persistência** — localStorage via repositório, pronto para migrar a um backend.

---

## ⚠️ Nota de segurança (dependências)

O projeto usa a versão mais recente da linha **Next.js 14** (`14.2.x`). O
`npm audit` ainda reporta avisos nessa linha, corrigidos apenas nas versões
**15/16** (ex.: DoS no Image Optimizer via `remotePatterns`, SSRF em
rewrites/WebSocket, RCE em servidores self-hosted Windows). Esta aplicação **não
utiliza** rewrites, WebSocket, Server Actions nem CSP nonce — mitigando a maior
parte dos vetores — mas, **para produção, recomenda-se migrar para Next.js 15/16
com React 19**.

---

## 🗺️ Roadmap

- [ ] Persistência real (Server Actions + banco de dados) no lugar do repositório local.
- [ ] Upload de mídia para storage (S3/Supabase) em vez de data URLs.
- [ ] Sanitização com `dompurify` para conteúdo que use HTML.
- [ ] Testes automatizados (Vitest + React Testing Library).
- [ ] Exportação dos dados agregados (CSV/GeoJSON) para pesquisas.
- [ ] Internacionalização (i18n) e modo escuro.

---

## 🤝 Licença e contribuição

Projeto em desenvolvimento. Contribuições são bem-vindas — abra uma *issue* ou
envie um *pull request*.

Desenvolvido por **Leonardo Gomes** — [CodeByLMStudio](https://github.com/CodeByLMStudio).
