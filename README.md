# Speed Dating App

TikTok-style async video speed dating web application. Users record a 45-second video answering 3 conversation prompts, upload it, and browse other users' videos in a full-screen scrollable feed.

Built as a **web-bundle inside a native WebView container** for live OTA updates without app store re-deployment.

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- A [Mux](https://www.mux.com/) account (video hosting)

### Install

```bash
git clone <repo-url>
cd speed_dating_app
npm run install:all
```

### Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit both files with your credentials (database URL, Mux tokens, JWT keys).

Generate RS256 key pair for JWT:
```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

### Database setup

```bash
cd backend
npm run db:migrate:dev
npm run db:seed
```

### Run development servers

```bash
# From root — runs frontend (port 3000) + backend (port 3001) in parallel
npm run dev
```

---

## Approach & Architecture

### Clean Architecture

The backend follows a strict **Clean Architecture** layering:
- **Domain** — entities and repository interfaces (zero framework dependencies)
- **Application** — use cases (one file per business operation)
- **Infrastructure** — Prisma repositories, Mux adapter, Redis cache
- **Interface** — Express routes, thin controllers, Zod validators

This means business logic is testable in isolation, and swapping Prisma for another ORM requires changing only the infrastructure layer.

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router (TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Backend | Express.js (TypeScript) |
| Database | PostgreSQL + Prisma |
| Video | Mux (Direct Upload + HLS streaming) |
| Cache | Redis |
| Auth | JWT RS256 + refresh token rotation |

### Key Design Decisions

- **Video upload via Mux Direct Upload** — video bytes never pass through our backend, reducing server load and latency
- **httpOnly refresh token cookie** — prevents XSS access to refresh tokens
- **RS256 JWT** — asymmetric signing allows verification without sharing the secret
- **Zod validation at every boundary** — runtime type safety on all API inputs
- **Redis feed cache** — 5-minute TTL reduces DB queries on a hot path

---

## Limitations (v1)

- Feed algorithm is recency-based only (newest first); emotion-aware sequencing is planned for v2
- No likes/comments in v1
- Offline support is limited to the PWA app shell; video caching for full offline is v2
- No content moderation on uploaded videos (requires manual review or third-party service)
- Single region deployment (no CDN edge for video beyond Mux's own CDN)

---

## Future Enhancements (v2)

See [docs/ROADMAP.md](docs/ROADMAP.md) for full breakdown. Highlights:

- **Photo slideshow videos** — create videos from photos with music + transitions (for camera-shy users)
- **Emotion-based feed algorithm** — sequences videos in an emotional arc (calm → inspiring → exciting) to maximize engagement
- **Scarcity triggers** — compatibility scores, "first match in X days" badges, daily swipe limits
- **Full offline cache** — download next 3 videos to IndexedDB for zero-connectivity usage
- **Likes & comments**
- **Video filters & emoji overlays**
- **iOS SDK integration** via MagicTextSDK WebView wrapper

---

## Project Docs

- [Architecture](docs/ARCHITECTURE.md) — layers, patterns, security, DB schema
- [Flows](docs/FLOWS.md) — all user journeys and system flows (Mermaid diagrams)
- [Roadmap](docs/ROADMAP.md) — v1 vs v2 feature breakdown with specs
- [API](docs/API.md) — full REST API specification

## Running Tests

```bash
npm run test          # All tests (frontend + backend)
npm run typecheck     # TypeScript checks across both packages
```
