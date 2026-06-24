# Architecture — Speed Dating App

## Guiding Principle: Clean Architecture

We follow a **modified Clean Architecture** (Robert C. Martin) adapted for a Node.js/React monorepo. The core rule is the **Dependency Rule**: source code dependencies can only point inward. Inner layers know nothing about outer layers.

```
┌─────────────────────────────────────────────┐
│  Infrastructure  (DB, Mux, Redis, HTTP)     │  ← outermost
│  ┌───────────────────────────────────────┐  │
│  │  Interface Adapters  (Controllers,    │  │
│  │  Repositories, Route Handlers)        │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  Application  (Use Cases /      │  │  │
│  │  │  Services)                      │  │  │
│  │  │  ┌───────────────────────────┐  │  │  │
│  │  │  │  Domain  (Entities,       │  │  │  │
│  │  │  │  Business Rules)          │  │  │  │
│  │  │  └───────────────────────────┘  │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Backend Module Structure (Domain-Driven)

Each feature lives in its own module folder. No cross-module direct imports — modules communicate only through their public interfaces.

```
src/modules/<module-name>/
├── domain/
│   ├── entities/          # Pure TypeScript classes/interfaces (no framework deps)
│   └── repositories/      # Repository interfaces (abstractions, NOT implementations)
├── application/
│   ├── use-cases/         # One file per use case (single responsibility)
│   └── dtos/              # Data Transfer Objects (input/output shapes)
├── infrastructure/
│   ├── repositories/      # Prisma implementations of domain interfaces
│   └── services/          # External service wrappers (Mux, etc.)
└── interface/
    ├── routes.ts           # Express router — only calls use-cases
    ├── controllers/        # Thin controllers — parse request, call use-case, send response
    └── validators/         # Zod schemas for request validation
```

### Example: `videos` module

```
src/modules/videos/
├── domain/
│   ├── entities/Video.ts                   # Video entity
│   └── repositories/IVideoRepository.ts    # Interface
├── application/
│   ├── use-cases/UploadVideoUseCase.ts
│   ├── use-cases/GetVideoPoolUseCase.ts
│   └── dtos/UploadVideoDto.ts
├── infrastructure/
│   ├── repositories/PrismaVideoRepository.ts
│   └── services/MuxVideoService.ts
└── interface/
    ├── routes.ts
    ├── controllers/VideoController.ts
    └── validators/videoValidators.ts
```

## Frontend Architecture

```
src/
├── app/                    # Next.js App Router (pages, layouts, API routes)
│   ├── (auth)/             # Auth route group
│   ├── record/             # Recording flow
│   └── feed/               # Video feed
├── components/
│   ├── recording/          # RecordingScreen, CountdownTimer, PromptOverlay, PoseGuide
│   ├── feed/               # FeedScroller, VideoCard, ProgressBar
│   └── ui/                 # Button, Modal, Spinner (shadcn/ui based)
├── hooks/
│   ├── useVideoRecorder.ts # Wraps react-media-recorder with app logic
│   ├── useFeed.ts          # Infinite scroll + video pool logic
│   └── useAuth.ts          # Auth state, token refresh
├── lib/
│   ├── api.ts              # Axios/fetch client with interceptors
│   ├── constants.ts        # MAX_VIDEO_DURATION, API endpoints, etc.
│   └── formatters.ts       # Pure utility functions
├── store/
│   ├── authStore.ts        # Zustand: user session
│   ├── recordingStore.ts   # Zustand: recording state machine
│   └── feedStore.ts        # Zustand: feed state + offline cache
└── types/
    └── index.ts            # Shared interfaces (User, Video, FeedItem)
```

## Security Architecture

### Authentication Flow
```
Client → POST /auth/register or /auth/login
       ← { accessToken (15min), refreshToken (7d, httpOnly cookie) }

Client → Any protected route with Bearer accessToken
       → authMiddleware validates JWT signature + expiry
       ← 401 if expired → Client calls POST /auth/refresh
       ← New accessToken + rotated refreshToken
```

### Security Layers
1. **Helmet.js** — HTTP security headers (CSP, HSTS, X-Frame-Options)
2. **Rate limiting** — `express-rate-limit`: 100 req/15min general; 10 req/15min auth endpoints
3. **CORS** — Strict allowlist; no wildcard in production
4. **Input validation** — Zod at every request boundary (body, query, params)
5. **SQL injection** — Prevented by Prisma parameterized queries
6. **File upload** — MIME type validation, size limit (100MB), virus scan hook (future)
7. **JWT** — RS256 asymmetric signing; tokens never stored in localStorage (use memory + httpOnly cookie for refresh)
8. **Environment secrets** — Validated at startup via Zod; app crashes if required vars are missing

## Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  displayName   String
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  videos        Video[]
  refreshTokens RefreshToken[]
}

model Video {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  muxAssetId    String      @unique
  muxPlaybackId String      @unique
  duration      Float       // seconds
  status        VideoStatus @default(PROCESSING)
  createdAt     DateTime    @default(now())
  likes         Like[]
  comments      Comment[]

  @@index([status, createdAt])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  revoked   Boolean  @default(false)
  createdAt DateTime @default(now())
}

model Like {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  videoId   String
  video     Video    @relation(fields: [videoId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, videoId])
}

model Comment {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  videoId   String
  video     Video    @relation(fields: [videoId], references: [id])
  text      String   @db.VarChar(280)
  createdAt DateTime @default(now())

  @@index([videoId, createdAt])
}

enum VideoStatus {
  PROCESSING
  READY
  FAILED
}
```

## State Management (Frontend)

We use **Zustand** with slices. No Redux, no Context API for global state.

```
recordingStore
  ├── phase: 'idle' | 'countdown' | 'recording' | 'preview' | 'uploading' | 'done'
  ├── videoBlob: Blob | null
  ├── currentPromptIndex: number
  └── actions: startRecording, stopRecording, retake, submitVideo

feedStore
  ├── videos: FeedItem[]
  ├── currentIndex: number
  ├── isLoading: boolean
  └── actions: fetchMore, markWatched, prefetchNext
```

## Caching Strategy (Redis)

| Key Pattern | TTL | Content |
|---|---|---|
| `feed:pool:{userId}` | 5 min | Ordered list of video IDs for user's feed |
| `video:{videoId}` | 10 min | Video metadata (avoid repeated DB queries) |
| `video:{videoId}:likes` | 2 min | Like count per video |
| `auth:refresh:{tokenId}` | 7d | Refresh token validation |
| `offline:videos:{userId}` | — | Last 3 feed videos stored in IndexedDB (client-side only) |

## Error Handling

All errors extend `AppError`:

```typescript
class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string,  // e.g. 'VIDEO_NOT_FOUND'
    public readonly isOperational: boolean = true
  ) { super(message); }
}
```

Global error middleware maps `AppError` → JSON response. Unexpected errors log to monitoring (e.g. Sentry) and return generic 500.

## Testing Strategy

| Test Type | Tool | Target |
|---|---|---|
| Unit — Use Cases | Vitest | All `application/use-cases/` files |
| Unit — Domain | Vitest | All `domain/entities/` files |
| Integration — API | Supertest + Vitest | All routes with real DB (test DB) |
| Unit — Frontend hooks | Vitest + React Testing Library | `hooks/` directory |
| E2E (future) | Playwright | Critical user flows |

Coverage target: **70% minimum** for all modules.
