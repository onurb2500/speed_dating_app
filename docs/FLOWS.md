# Flows — Speed Dating App

> This document describes every significant user journey and system flow.  
> Update this file whenever a flow is added or changed. Diagrams use Mermaid syntax.

---

## 1. User Registration & Onboarding

```mermaid
flowchart TD
    A([App Opens]) --> B{User has session?}
    B -- Yes --> C[Go to Recording Screen]
    B -- No --> D[Landing / Welcome Screen]
    D --> E[Tap 'Get Started']
    E --> F[Enter Email + Password]
    F --> G[POST /auth/register]
    G --> H{Server validates}
    H -- Error: email taken --> I[Show inline error]
    I --> F
    H -- Success --> J[Store accessToken in memory<br/>refreshToken in httpOnly cookie]
    J --> K[Profile Setup: display name + optional avatar]
    K --> L[POST /users/me — save profile]
    L --> C
```

---

## 2. Video Recording Flow (Core Feature — v1)

```mermaid
flowchart TD
    A([Recording Screen]) --> B[Request camera + mic permissions]
    B -- Denied --> C[Show permissions guide modal]
    C --> B
    B -- Granted --> D[Show live camera preview\nfull-screen portrait]
    D --> E["Display prompt overlay:<br/>'Answer these 3 questions in 45s'<br/>+ on-screen animated prompts with<br/>pose suggestions and speech tone hints"]
    E --> F[User taps Record button]
    F --> G[3-second countdown animation]
    G --> H[RECORDING: show red dot + timer<br/>Display current question text near top<br/>Show subtle pose guide icon]
    H --> I{Timer reaches 45s OR<br/>User taps Stop}
    I --> J[Stop MediaRecorder<br/>Capture Blob]
    J --> K[PREVIEW SCREEN:<br/>Autoplay recorded video<br/>Show 'Re-record' and 'Looks good!' buttons]
    K -- Re-record --> D
    K -- Looks good --> L[UPLOAD FLOW]
```

### 2.1 On-Screen Recording Assistance (v1 — Shame Barrier Reduction)

The overlay system shown during recording:

```
┌────────────────────────────────┐
│  [Q1 of 3] 0:12 / 0:45  ●REC   │  ← top bar
│                                │
│  💡 "Lean slightly forward     │  ← pose hint (fades in/out)
│      and smile naturally"      │
│                                │
│  [Camera live view]            │
│                                │
│  🗣 "Minha personagem favorita │  ← current prompt text
│     da Disney é..."            │  ← (large, readable near camera)
│                                │
│  💬 Tone: warm & playful ✨   │  ← tone suggestion
└────────────────────────────────┘
```

Prompt Sequence:
1. **0–15s** — "Minha personagem favorita da Disney é..." (pose: relaxed, slight lean forward)
2. **15–30s** — "Se eu pudesse dominar uma habilidade instantaneamente..." (pose: hands expressive, tilt head)
3. **30–45s** — "Minha tarde livre perfeita parece com..." (pose: big smile, open posture)

### 2.2 Customizable Prompt System (v1)

Users can personalize their prompts before recording:

```mermaid
flowchart TD
    A[Pre-recording: Prompt Customization Screen] --> B[Show 3 base prompts]
    B --> C[Each prompt has editable fill-in-the-blank tokens]
    C --> D["E.g.: 'Minha [personagem favorita] da Disney é...\nMas não a clássica — a minha é uma [Minie] [de tênis e sarada]'"]
    D --> E[User fills in highlighted brackets]
    E --> F[Live preview of final prompt text]
    F --> G[Confirm → Go to Recording Screen\nwith personalized prompts]
```

---

## 3. Video Upload Flow

```mermaid
sequenceDiagram
    participant Client
    participant Backend
    participant Mux

    Client->>Backend: POST /videos/upload-url\n(Authorization: Bearer token)
    Backend->>Mux: Create Direct Upload URL
    Mux-->>Backend: { uploadUrl, assetId }
    Backend-->>Client: { uploadUrl, videoId }
    Client->>Mux: PUT uploadUrl (video Blob)
    Mux-->>Client: 200 OK
    Client->>Backend: POST /videos/confirm { videoId }
    Backend->>Backend: Mark video as PROCESSING
    Mux->>Backend: Webhook: asset.ready { assetId, playbackId }
    Backend->>Backend: Update Video status=READY, save playbackId
    Backend-->>Client: (polling or websocket) Video is ready
    Client->>Client: Transition to Feed Screen
```

---

## 4. Feed / Video Pool Flow

```mermaid
flowchart TD
    A([Feed Screen]) --> B[GET /feed]
    B --> H{Videos found?}
    H -- No --> I["Show friendly empty state:<br/>'Be the first! Your video is<br/>awaiting its first match.'"]
    H -- Yes --> C[Autoplay first video full-screen]
    C --> D{Video ends?}
    D --> E[Show subtle swipe-up hint]
    E --> F[User swipes up OR auto-advance]
    F --> G[Play next video\n(prefetch already loaded)]
    G --> D
```

### 4.1 Feed Sequencing Algorithm (v1 — Simplified)

In v1, the sequence is: **recency-based** (newest uploads first), deduped per session.

```
feedAlgorithm_v1(userId):
  1. Fetch videos WHERE status=READY AND userId != currentUser
  2. Exclude videos already seen by currentUser in this session
  3. Order by createdAt DESC
  4. Return paginated list (10 at a time)
  5. Cache result in Redis: feed:pool:{userId} TTL=5min
```

---

## 5. Authentication Token Flow

```mermaid
sequenceDiagram
    participant Client
    participant Backend

    Client->>Backend: POST /auth/login { email, password }
    Backend->>Backend: Verify password hash (bcrypt)
    Backend-->>Client: { accessToken (15min JWT) }\n+ Set-Cookie: refreshToken (httpOnly, 7d)
    
    Client->>Backend: GET /protected-route\nAuthorization: Bearer accessToken
    Backend->>Backend: Verify JWT signature + expiry
    Backend-->>Client: 200 OK + data

    Note over Client,Backend: accessToken expires...
    
    Client->>Backend: POST /auth/refresh\n(cookie sent automatically)
    Backend->>Backend: Validate refreshToken,\nrotate (old token revoked)
    Backend-->>Client: { new accessToken }\n+ Set-Cookie: new refreshToken
```

---

## 6. Offline / Cold Start Flow (v1 — Completo)

```mermaid
flowchart TD
    A[App opens] --> B{Network available?}
    B -- Yes --> C[Normal flow]
    C --> Z[After session: save next 3 feed videos to IndexedDB via useOfflineCache]
    B -- No --> D{IndexedDB cache exists?}
    D -- Yes --> E[Load cached shell + videos from IndexedDB]
    E --> F["Show banner: 'You are offline.<br/>Showing cached videos.'"]
    D -- No --> G["Show offline screen:<br/>'Connect to the internet<br/>to start your journey ❤️'"]
    F --> H{User records video offline?}
    H -- Yes --> I[Save video Blob to IndexedDB]
    I --> J[Show: 'Seu vídeo será enviado quando você reconectar']
    B -- Reconnected --> K[Auto-upload pending IndexedDB video]
```

**Estratégia de cache por tipo:**
| Recurso | Estratégia | Armazenamento |
|---|---|---|
| App shell (HTML/CSS/JS) | Cache-first | Service Worker Cache API |
| Metadata de vídeos | Network-first, fallback cache | Service Worker Cache API |
| Blobs de vídeo (até 3) | Pre-fetch após sessão | IndexedDB (`offline-videos`) |
| Vídeo gravado offline | Store on record | IndexedDB (`pending-uploads`) |

---

## 7. Like & Comment Flow

```mermaid
flowchart TD
    A([User watching video in feed]) --> B[Tap heart icon]
    B --> C[useLike: optimistic update UI immediately]
    C --> D[POST /videos/:id/likes]
    D -- Success --> E[Confirm count from server]
    D -- Error --> F[Rollback UI to previous state]

    A --> G[Tap comment bubble icon]
    G --> H[CommentsDrawer slides up]
    H --> I[GET /videos/:id/comments]
    I --> J[Render paginated comment list]
    J --> K[User types comment + taps Send]
    K --> L[POST /videos/:id/comments]
    L --> M[Append new comment to top of list]
```

---

## 8. Filters & Emoji Overlay Flow

```mermaid
flowchart TD
    A([Recording Screen]) --> B[User taps Filter icon]
    B --> C[FilterPicker opens: natural · vintage · vivid · B&W · warm]
    C --> D[useCameraFilter: apply CSS/WebGL filter over canvas stream]
    D --> E[Live preview shows filtered camera]
    E --> F[User taps Emoji icon]
    F --> G[EmojiOverlay opens: emoji palette]
    G --> H[User selects emoji → draggable sticker placed on canvas]
    H --> I[User taps Record → canvas with filter + emojis is recorded]
    I --> J[MediaRecorder captures canvas stream]
    J --> K[Preview shows filtered + emoji video]
    K -- Looks good --> L[Canvas composited Blob sent via upload flow]
```

---

## 9. Error Flows

### 7.1 Upload Failure
```
Upload fails (network error / Mux error)
→ Show retry modal with attempt count
→ Max 3 retries with exponential backoff
→ After 3 failures: "Algo deu errado. Seu vídeo foi salvo localmente. Tente de novo mais tarde."
→ Store video blob in IndexedDB for retry
```

### 7.2 Permission Denied (Camera/Mic)
```
Browser blocks camera permission
→ Show step-by-step guide (browser-specific) to enable permissions
→ Deep link to browser settings where supported
```

### 7.3 Video Too Long (client-side enforcement)
```
MediaRecorder hits 45s limit
→ Automatically stops recording
→ Proceeds to preview (no user action needed)
→ Timer UI shows warning at 40s (last 5 seconds highlighted red)
```

---

## 10. Data Flow Overview

```mermaid
flowchart LR
    subgraph Frontend
        UI[React Components]
        Store[Zustand Store]
        SW[Service Worker\ncache]
    end
    subgraph Backend
        Routes[Express Routes]
        UseCases[Use Cases]
        Repos[Repositories]
    end
    subgraph Infrastructure
        DB[(PostgreSQL\nvia Prisma)]
        Cache[(Redis)]
        Mux[Mux\nVideo CDN]
    end

    UI -- actions --> Store
    Store -- API calls --> Routes
    Routes --> UseCases --> Repos --> DB
    Repos --> Cache
    UseCases --> Mux
    Mux -- webhook --> Routes
    Routes -- responses --> Store --> UI
    SW -- offline fallback --> UI
```
