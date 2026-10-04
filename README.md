# Entre Paisagens

Mapeamento participativo e percepção da paisagem urbana de **Fortaleza (CE)**.

Aplicação web profissional refatorada a partir do protótipo monolítico
(`entre_paisagens_v3.tsx`) para **Next.js 14 (App Router)**, com TypeScript
estrito, Tailwind CSS, Leaflet, Zod e Zustand.

---

## Stack

- **Framework**: Next.js 14 (App Router) — Server Components por padrão, Client
  Components para interatividade.
- **Linguagem**: TypeScript (strict + `noUncheckedIndexedAccess`).
- **Estilo**: Tailwind CSS (identidade rústico-urbana via tokens de cor).
- **Mapas**: Leaflet 1.9 (carregado só no cliente com `next/dynamic` + `ssr: false`).
- **Validação**: Zod (perfil, relato e bounds geográficos de Fortaleza).
- **Estado global**: Zustand (stores por responsabilidade).
- **Ícones**: `lucide-react`.
- **Geodados abertos** (sem dados mockados):
  - Bairros de Fortaleza → **Overpass API** (OpenStreetMap), ~122 bairros reais.
  - Demarcação territorial → **IBGE Malhas Municipais** (GeoJSON do município).
  - Endereços/busca → **Nominatim** (geocodificação direta/reversa), restrita a Fortaleza.

## Como executar

```bash
npm install
npm run dev       # http://localhost:3000
npm run typecheck # tsc --noEmit
npm run build     # build de produção
```

## Deploy (Vercel)

A aplicação é auto-detectada pela Vercel (Next.js + App Router), sem
configuração adicional (`vercel.json` não é necessário).

1. **Subir o repositório** no GitHub.
2. Na Vercel, **Import Project** → selecionar o repositório.
   - Framework preset: **Next.js** (detectado automaticamente).
   - Build command / output directory: padrão (`next build` / `.next`).
3. Configurar as **Environment Variables** (em *Settings → Environment Variables*):
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` → número do "Fale Conosco" (DDI+DDD+número).

Opcionalmente, use a CLI da Vercel:

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # produção
```

> Importante: variáveis `NEXT_PUBLIC_*` são embutidas no bundle durante o
> build. Ao alterá-las na Vercel, faça um novo *deploy* (redeploy) para que
> sejam refletidas.

---

## Tipografia

Sistema tipográfico auto-hospedado via `next/font` (`src/lib/fonts.ts`):

| Uso | Fonte | Peso | Configuração |
| --- | --- | --- | --- |
| Títulos e nomes de lugares | Montserrat | Medium (500) | Caixa alta; tracking 2–3pt; 10–12pt |
| Legenda e textos auxiliares | Lato | Regular (400) | 8–9pt (fonte base do app) |
| Alternativa minimalista | Manrope | Regular (400) | 8–10pt |
| Título da legenda | Montserrat | SemiBold (600) | Caixa alta; tracking 1,5–2pt; 9–10pt |

Classes utilitárias em `globals.css`: `.type-display`, `.type-label`, `.type-alt`.

## Modelo de dados (pontos e histórico)

As experiências são agrupadas em **pontos do mapa** (`MapPoint`), representando
um local único. Uma nova experiência é agregada ao ponto existente quando:

- possui o mesmo **logradouro + número**; ou
- (na ausência de número) a mesma **coordenada** aproximada.

Cada ponto exibe um contador com o total de experiências e o painel de detalhes
mostra o histórico completo, com a opção de "Registrar experiência neste local".

Validação geográfica: o registro só é permitido **dentro da área demarcada** de
Fortaleza (malha municipal do IBGE), via teste de ponto-em-polígono (não apenas
bounding box).

## Limites de mídia

- **Áudio**: máximo de 30s (auto-stop).
- **Imagem**: comprimida automaticamente até 0,5 MB (redução de qualidade e
  resolução em etapas), adequada para câmeras de alta resolução.

## Arquitetura

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
│   ├── loading.tsx / error.tsx / not-found.tsx
├── components/
│   ├── layout/              # AppHeader, AppFooter, AppProviders
│   ├── modals/              # EixoInfoModal, ContactModal, TutorialModal
│   └── ui/                  # Button, Modal, Field, Toast, Spinner, Badge
├── domain/                  # Tipos, constantes e schemas (fonte da verdade)
│   ├── types.ts
│   ├── constants.ts
│   └── schemas.ts
├── features/
│   ├── map/                 # Mapa, filtros, painel de detalhes
│   ├── collection/          # Fluxo de relato (4 passos) + hooks
│   ├── reading/             # Estatísticas e catálogo
│   ├── home/                # Hero da home
│   └── about/               # Página "Sobre"
├── hooks/                   # useLocalStorage, useGeocoding, useMediaCapture, ...
├── lib/
│   ├── geo.ts               # Bounds/centro de Fortaleza + isWithinFortaleza
│   ├── geocoding.ts         # Nominatim (reverse geocoding) com timeout/fallback
│   ├── sanitize.ts          # Sanitização de inputs (anti-XSS)
│   ├── storage.ts           # localStorage seguro (SSR + try/catch)
│   ├── zodUtils.ts          # Conversão de issues Zod → record de erros
│   ├── utils.ts             # cn, generateId, formatDate
│   └── repositories/        # experienceRepository (persistência)
└── stores/                  # Stores Zustand (experience, map, collection, ui)
```

### Responsabilidades-chave

- **`domain/`** — tipos e constantes derivados de tuplas `as const` (evita
  duplicação e drift), mais os schemas Zod (validação em qualquer camada).
- **`stores/`** — 4 stores Zustand:
  - `experienceStore` — relatos (persistidos via repositório).
  - `mapStore` — filtros, pino selecionado, coordenada pendente e modo "marcar".
  - `collectionStore` — rascunho e estado do modal de relato.
  - `uiStore` — toast e modais de contato/tutorial.
- **`lib/repositories/`** — camada de persistência (localStorage) isolada para
  futura troca por Server Actions / API Routes / banco.
- **`lib/sanitize.ts`** — sanitização de texto e validação de URLs de mídia
  (whitelist de protocolos). O React escapa texto por padrão; os marcadores
  Leaflet interpolam apenas constantes seguras (nunca dados do usuário).

### Mapa isolado do SSR

`features/map/components/MapContainer.tsx` carrega o `MapCore` via
`dynamic(..., { ssr: false })`, evitando `window is not defined`. O CSS do
Leaflet é importado dentro do componente client-only. Enquanto carrega, exibe
`MapFallback`.

---

## Decisões de projeto

- **Hidratação sem mismatch**: o `experienceStore` usa `hydrate()` em
  `useEffect` (via `AppProviders`). Componentes dependentes de dados renderizam
  um skeleton até a hidratação concluir.
- **Validação por passo**: cada etapa do relato valida seu subconjunto com Zod
  e exibe erros inline (`issuesToRecord`).
- **Bounds de Fortaleza**: validados no cliente (interação no mapa) e no schema
  (`experienceSchema.refine` / `step3Schema.refine`).
- **Mídia**: fotos são `data:` URLs (não passam pelo `next/image`, que não as
  otimiza); a home usa `next/image` para o fundo estático remoto.

## Nota de segurança (dependências)

O projeto utiliza a versão mais recente da linha **Next.js 14** (`14.2.x`). O
`npm audit` ainda reporta avisos nesta linha que só são corrigidos nas versões
**15/16** (ex.: DoS no Image Optimizer via `remotePatterns`, SSRF em
rewrites/WebSocket, e RCE em servidores self-hosted no Windows). Esta aplicação
não utiliza rewrites, WebSocket, Server Actions nem CSP nonce — o que mitiga a
maior parte dos vetores —, mas **para produção recomenda-se migrar para Next.js
15/16 com React 19**.

## Próximos passos sugeridos

- Persistência real (Server Actions + banco) substituindo o repositório local.
- Sanitização com `dompurify` para qualquer conteúdo que venha a usar HTML.
- Upload de mídia para storage (S3/Supabase) em vez de data URLs.
- Testes (Vitest + React Testing Library) para schemas e fluxo de relato.
