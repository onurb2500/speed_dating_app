# Roadmap — Speed Dating App

> Features are split into **Entrega v1** (current scope) and **Entrega v2** (next delivery).  
> Status key: `[ ]` not started · `[~]` in progress · `[x]` done

---

## Entrega v1 — Escopo Atual

### Core Challenge Requirements

- [ ] **Video recording** — 45s cap, camera + mic access, portrait full-screen
- [ ] **Countdown + recording UI** — 3s countdown, live timer, red dot indicator
- [ ] **Playback & re-record** — Preview screen after recording with retake option
- [ ] **Video upload** — Mux Direct Upload, confirmation + status polling
- [ ] **Video feed** — TikTok-style full-screen scroll, autoplay, pool of videos
- [ ] **Backend: video storage** — Mux asset management, webhook handling
- [ ] **Backend: video pool endpoint** — Serve ordered feed after upload

### Architecture & Infrastructure (não pedidos, mas indispensáveis)

- [ ] **Clean Architecture setup** — Domain / Application / Infrastructure / Interface layers
- [ ] **Authentication** — JWT + refresh token rotation, registration, login, logout
- [ ] **Database** — PostgreSQL + Prisma ORM, migrations, seed data
- [ ] **Input validation** — Zod schemas at every API boundary
- [ ] **Error handling** — Global error middleware, custom `AppError` classes
- [ ] **Security middleware** — Helmet, CORS allowlist, rate limiting
- [ ] **Environment config** — Zod-validated env at startup
- [ ] **Redis cache** — Feed pool caching (5min TTL)
- [ ] **Unit tests** — Use cases + hooks coverage ≥ 70%

### Melhorias Adicionadas ao v1 (suas ideias — itens 4.1, 4.3)

#### 4.1 — Sistema anti-vergonha: assistência de gravação em tempo real

> **Objetivo:** Quebrar a barreira da vergonha e inércia. Tornar a gravação fácil, agradável e sedutora.

- [ ] **Overlay de prompt** — Texto do prompt atual exibido grande e próximo à câmera (zona fácil de ler sem desviar o olhar)
- [ ] **Dicas de pose** — Ícone/texto animado sugere postura (ex: "incline levemente", "abra os ombros") nos primeiros 2 segundos de cada pergunta
- [ ] **Dica de entonação** — Badge de tom no canto (ex: "✨ tom caloroso e divertido") para cada prompt
- [ ] **Transição suave entre prompts** — Aos 15s e 30s, o texto do prompt muda com animação fade; indicador de progresso (Q1 → Q2 → Q3) visível
- [ ] **Tela de preparação pré-gravação** — Antes do countdown, mostrar checklist animado: "Iluminação ✓ · Sorriso ✓ · Pronto?" para reduzir ansiedade
- [ ] **Animação de encorajamento pós-gravação** — Ao parar gravação: micro-animação positiva (coração, estrela) antes de entrar no preview

#### 4.3 — Prompts híbridos: base pronta + personalização do usuário

> **Objetivo:** Evitar perfis repetitivos. A Minie de tênis e sarada > a Minie genérica.

- [ ] **Tela de personalização de prompts** (pré-gravação)
  - Exibir os 3 prompts base com **tokens editáveis em destaque** (cor diferente, sublinhado)
  - Exemplo: `"Minha [personagem favorita] da Disney é a [Minie], mas a minha versão [de tênis e sarada]"`
  - Tokens entre colchetes `[...]` são editáveis inline
  - Caractere restante e limite visíveis por campo
- [ ] **Preview do prompt final** — Mostrar a frase completa montada em tempo real enquanto o usuário edita
- [ ] **Sugestões de personalização** — Chips clicáveis com exemplos para cada token (ex: para `[estilo]`: "de samurai", "cyberpunk", "anos 80")
- [ ] **Salvar prompts personalizados** — Guardar no perfil do usuário para reutilizar

### Extra Credit — também na v1

#### Cache offline / Cold Start (4.7)

- [ ] **Service Worker** (via `next-pwa`) — cacheia app shell completo
- [ ] **Pré-cache de vídeos** — após cada sessão online, baixar e armazenar em IndexedDB os próximos 3 vídeos da fila
- [ ] **Estratégia de cache:** Cache-first para vídeos já baixados; Network-first para metadata
- [ ] **UI offline** — Banner discreto "Modo offline — mostrando vídeos salvos"
- [ ] **Sincronização** — ao reconectar, enviar automaticamente qualquer vídeo gravado offline (armazenado em IndexedDB)

#### Likes e comentários

- [ ] **Like button** no feed (persistido no backend, contagem visível)
- [ ] **Comentários** — drawer deslizando de baixo para cima, lista paginada, campo de texto com envio
- [ ] **Backend:** endpoints `POST /videos/:id/like`, `GET/POST /videos/:id/comments`
- [ ] **Schema Prisma:** modelos `Like` e `Comment` relacionados a `Video` e `User`

#### Filtros e emojis

- [ ] **Filtros de câmera em tempo real** — via canvas/WebGL aplicado sobre o stream da câmera
- [ ] **Palette de filtros:** natural · vintage · vivid · B&W · warm
- [ ] **Overlay de emojis animados** — stickers posicionáveis sobre o vídeo antes de enviar
- [ ] **Renderização final** — composição canvas → Blob antes do upload

#### iOS SDK (MagicTextSDK)

- [ ] **WebView wrapper nativo** — integrar o app como WebView dentro do SDK iOS
- [ ] **Referência:** [github.com/sughodke/MagicTextSDK](https://github.com/sughodke/MagicTextSDK)
- [ ] **Bridge JS ↔ Native** — comunicação de eventos de navegação e permissões de câmera/mic

---

## Entrega v2 — Próxima Entrega

> Itens abaixo são **estudados e especificados** agora, mas implementados após a v1.  
> A seção de design/viabilidade de cada item já está aqui para guiar o desenvolvimento futuro.

---

### 4.2 — Criador de vídeo de fotos (estilo TikTok slideshow)

**Conceito:** Alternativa para usuários que preferem não aparecer em vídeo ao vivo, ou querem complementar. O usuário seleciona fotos e o app monta um vídeo animado.

**Viabilidade:** Alta. Pode ser feito 100% no cliente com canvas/WebGL ou usando `ffmpeg.wasm`.

**Especificação para v2:**
- Upload de múltiplas fotos (até 10)
- Escolha de tema visual: romântico · descontraído · intenso · divertido
- Escolha de música de fundo (biblioteca curada, sem direitos autorais)
- Controle de velocidade de corte: slow (3s/foto) · normal (1.5s) · rápido (0.5s)
- Transições automáticas baseadas na vibe escolhida (fade, zoom, slide)
- Preview antes de enviar
- Saída: `.mp4` blob enviado pelo mesmo fluxo de upload

**Dependências:** `ffmpeg.wasm`, biblioteca de músicas (Pixabay API ou curada local)

---

### 4.4 — Algoritmo gestor de emoções para sequência de feed

**Conceito:** A ordem dos vídeos no feed não é aleatória. Ela segue uma sequência emocional estudada (similar ao YouTube Shorts) para maximizar engajamento e criar arco emocional positivo.

**Viabilidade:** Alta no backend. Requer coleta de sinais comportamentais (tempo assistido, skip rate).

**Sequência emocional base (inspirada em YouTube Shorts):**
```
[Fofinho] → [Inspirador] → [Indignador] → [Vencedor]
```

**Perfis de algoritmo (a eleger por usuário via onboarding):**
| Perfil | Sequência emocional | Indicado para |
|---|---|---|
| Romântico | Fofo → Tímido → Emocionante → Apaixonado | Busca conexão emocional |
| Animado | Engraçado → Energético → Desafiador → Épico | Quer diversão e ação |
| Reflexivo | Calmo → Inspirador → Profundo → Esperançoso | Busca compatibilidade intelectual |

**Sinais a coletar para calibrar:**
- Tempo de watch por vídeo (% assistido)
- Skip precoce (< 3s) = vídeo não ressoou
- Loop (assistiu mais de uma vez) = forte sinal positivo
- Interações (like, comment) = sinal forte

**Especificação para v2:**
- Onboarding: 3 perguntas de perfil (ou inferência por comportamento nas primeiras sessões)
- Backend: `FeedAlgorithmService` que ordena pool pelo score emocional sequenciado
- A/B testing hook: flag de feature para testar algoritmos diferentes

---

### 4.5 — Gatilhos de escassez e exclusividade

**Conceito:** Fazer cada match parecer raro e valioso. Combater o "tédio do excesso" (paradoxo da escolha).

**Viabilidade:** Alta (é lógica de negócio no backend + UX no frontend).

**Features para v2:**
- **"Primeiro match em X tempo"** — Se o usuário tem poucos matches recentes, exibir badge: "✨ Você pode ser o primeiro match dele em 3 dias"
- **Grau de compatibilidade** — Score de 1–100% baseado em: mesma faixa etária, localização, tags de interesse dos prompts (NLP simples), perfil emocional
- **"Perfil com poucos matches"** — Badge sutil: "💎 Exclusivo — poucos matches" para perfis que ainda não receberam muitas interações
- **Pool limitada por sessão** — Mostrar apenas 10–15 perfis por sessão para criar sensação de raridade (não um feed infinito genérico)
- **Contagem regressiva de disponibilidade** — "Este perfil está disponível por mais 18h" (gamificação de urgência)

**Considerações éticas:** Implementar de forma honesta — os dados devem ser reais. Não fabricar urgência falsa.

---

### 4.6 — Cada match parece único (evitar gatilho de excesso/tédio)

**Conceito:** Contrariar o "tédio de possuir" (endowment effect reverso). Fazer cada interação parecer singular.

**Viabilidade:** Média-alta. Parte é UX, parte é conteúdo gerado.

**Features para v2:**
- **Carta de apresentação personalizada** — Antes de mostrar o vídeo de um match, exibir uma tela com: nome + 1 frase gerada por IA baseada nos prompts deles (ex: "Lucas também acha que a vida é melhor com aventura e café")
- **Highlight do prompt mais compatível** — Destacar qual das 3 respostas mais ressoa com o perfil do usuário atual
- **Animação de "destino"** — Micro-animação poética ao entrar no vídeo de alguém (estrelas, partículas) para criar senso de momento especial
- **Limite de swipes por dia** — Máximo 20 perfis/dia para cada usuário (como Hinge). Cria escassez e qualidade de atenção.

---

---

## Resumo Visual

```
┌─────────────────────────────────────────────────────────┐
│  ENTREGA v1                                              │
│  ✅ Challenge core (record → upload → feed)              │
│  ✅ Auth + backend profissional (Clean Architecture)     │
│  ✅ Anti-vergonha: overlay de poses + tom (4.1)          │
│  ✅ Prompts híbridos personalizáveis (4.3)               │
│  ✅ Testes unitários                                     │
│  ✅ Cache offline completo / Cold Start (4.7)            │
│  ✅ Likes e comentários                                  │
│  ✅ Filtros de câmera e emojis                           │
│  ✅ iOS SDK (MagicTextSDK)                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ENTREGA v2                                              │
│  🔄 Slideshow de fotos com música (4.2)                  │
│  🔄 Algoritmo gestor de emoções no feed (4.4)            │
│  🔄 Gatilhos de escassez e compatibilidade (4.5)         │
│  🔄 Cada match parece único (4.6)                        │
└─────────────────────────────────────────────────────────┘
```
