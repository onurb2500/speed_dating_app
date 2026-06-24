# Speed Dating App — Claude Code Context

## Project Overview

TikTok-style async video speed dating web application. Users record a short video answering conversation prompts, upload it, and then browse other users' videos in a scrollable feed. Built as a **web-bundle inside a native WebView container** for live OTA updates.

## Repository Structure

```
speed_dating_app/
├── CLAUDE.md                   # ← You are here. Root context for Claude Code.
├── README.md
├── docs/
│   ├── ARCHITECTURE.md         # Clean architecture decisions & patterns
│   ├── FLOWS.md                # User flows, system flows, data flows
│   ├── ROADMAP.md              # v1 (current) vs v2 (next delivery) feature breakdown
│   └── API.md                  # REST API specification
├── frontend/                   # Next.js 14 App Router (TypeScript)
│   ├── CLAUDE.md               # Frontend-specific context
│   └── src/
│       ├── app/                # Next.js App Router pages
│       ├── components/         # Reusable UI components
│       │   ├── recording/      # Video recording flow components
│       │   ├── feed/           # TikTok-style feed components
│       │   └── ui/             # Generic UI primitives
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Utilities, API client, helpers
│       ├── store/              # Zustand global state
│       └── types/              # Shared TypeScript types
└── backend/                    # Node.js / Express (TypeScript)
    ├── CLAUDE.md               # Backend-specific context
    └── src/
        ├── config/             # Environment, constants, app config
        ├── modules/            # Feature modules (domain-driven)
        │   ├── auth/           # Authentication & sessions
        │   ├── users/          # User profiles
        │   ├── videos/         # Video upload, retrieval, pool
        │   └── feed/           # Feed algorithm & sequencing
        ├── shared/             # Shared across modules
        │   ├── middleware/     # Auth guard, rate limit, CORS, logger
        │   ├── errors/         # Custom error classes & handler
        │   ├── validators/     # Zod schemas
        │   └── utils/          # Pure utility functions
        ├── infrastructure/     # External service adapters
        │   ├── storage/        # Mux / S3 adapter
        │   ├── database/       # Prisma ORM setup
        │   └── cache/          # Redis adapter
        └── app.ts              # Express app factory
```

## Tech Stack Decisions

| Layer | Technology | Reason |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) | SSR for fast first load on mobile, easy PWA setup |
| Frontend language | TypeScript strict mode | Type safety across the full stack |
| Styling | Tailwind CSS + shadcn/ui | Near-native mobile UI, fast iteration |
| State management | Zustand | Minimal boilerplate, works well with React hooks |
| Video recording | `react-media-recorder` | Broad browser support, simple API |
| Backend framework | Express.js (TypeScript) | Lightweight, battle-tested, easy to structure |
| ORM | Prisma | Type-safe queries, clean migrations |
| Database | PostgreSQL | Relational, reliable for user/video metadata |
| Video hosting | Mux | Adaptive streaming, mobile-optimized HLS |
| Authentication | JWT + Refresh Token rotation | Stateless, secure, scalable |
| Cache | Redis | Session store + video pool caching |
| Validation | Zod | Runtime + compile-time validation |
| Testing | Vitest + Supertest | Fast unit tests, HTTP integration tests |

## Critical Rules for Claude Code

1. **Always follow Clean Architecture** — domain logic never imports from infrastructure. See `docs/ARCHITECTURE.md`.
2. **Never put business logic in route handlers** — routes call services, services contain logic.
3. **Every API endpoint must be authenticated** unless explicitly marked `// PUBLIC`.
4. **Validate all inputs at the boundary** using Zod schemas in `shared/validators/`.
5. **Never expose raw database errors** to the client — use custom error classes.
6. **Environment variables** are loaded via `config/env.ts` with Zod validation at startup. Never use `process.env` directly inside modules.
7. **Prefer composition over inheritance** everywhere.
8. **All new features** must have a corresponding unit test file (`.test.ts`).
9. **Mobile-first** — all UI components must be tested at 375px width minimum.
10. **Video size limit**: 100MB per upload; duration capped at 45 seconds enforced on both client and server.

## Commands

```bash
# Install all dependencies
npm run install:all

# Development (runs frontend + backend in parallel)
npm run dev

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev

# Run all tests
npm run test

# Type check all
npm run typecheck

# Database migrations
cd backend && npm run db:migrate

# Seed database
cd backend && npm run db:seed
```

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for required variables. Never commit `.env` files.

## Reference Documents

- Architecture decisions → `docs/ARCHITECTURE.md`
- Full user & system flows → `docs/FLOWS.md`
- Feature roadmap → `docs/ROADMAP.md`
- API specification → `docs/API.md`
