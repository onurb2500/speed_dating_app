# Backend — Claude Code Context

## Stack

- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js (TypeScript strict)
- **ORM:** Prisma (PostgreSQL)
- **Auth:** JWT (RS256) + bcrypt + refresh token rotation
- **Cache:** Redis (ioredis)
- **Video hosting:** Mux (Direct Upload + Webhooks)
- **Validation:** Zod (all request boundaries)
- **Logging:** Pino (structured JSON logs)
- **Error monitoring:** Sentry (optional, hook ready)
- **Testing:** Vitest + Supertest

## Directory Map

```
backend/src/
├── config/
│   ├── env.ts              # Zod-validated env vars — ONLY place process.env is read
│   ├── database.ts         # Prisma client singleton
│   ├── redis.ts            # Redis client singleton
│   └── constants.ts        # App-wide constants (MAX_VIDEO_DURATION, etc.)
│
├── modules/
│   ├── auth/
│   │   ├── domain/
│   │   │   └── entities/AuthToken.ts
│   │   ├── application/
│   │   │   ├── use-cases/RegisterUserUseCase.ts
│   │   │   ├── use-cases/LoginUseCase.ts
│   │   │   ├── use-cases/RefreshTokenUseCase.ts
│   │   │   └── use-cases/LogoutUseCase.ts
│   │   ├── infrastructure/
│   │   │   └── repositories/PrismaRefreshTokenRepository.ts
│   │   └── interface/
│   │       ├── routes.ts
│   │       ├── controllers/AuthController.ts
│   │       └── validators/authValidators.ts
│   │
│   ├── users/
│   │   ├── domain/
│   │   │   ├── entities/User.ts
│   │   │   └── repositories/IUserRepository.ts
│   │   ├── application/
│   │   │   ├── use-cases/GetUserProfileUseCase.ts
│   │   │   └── use-cases/UpdateUserProfileUseCase.ts
│   │   ├── infrastructure/
│   │   │   └── repositories/PrismaUserRepository.ts
│   │   └── interface/
│   │       ├── routes.ts
│   │       ├── controllers/UserController.ts
│   │       └── validators/userValidators.ts
│   │
│   ├── videos/
│   │   ├── domain/
│   │   │   ├── entities/Video.ts
│   │   │   └── repositories/IVideoRepository.ts
│   │   ├── application/
│   │   │   ├── use-cases/CreateUploadUrlUseCase.ts
│   │   │   ├── use-cases/ConfirmVideoUploadUseCase.ts
│   │   │   ├── use-cases/HandleMuxWebhookUseCase.ts
│   │   │   └── dtos/
│   │   ├── infrastructure/
│   │   │   ├── repositories/PrismaVideoRepository.ts
│   │   │   └── services/MuxService.ts
│   │   └── interface/
│   │       ├── routes.ts
│   │       ├── controllers/VideoController.ts
│   │       └── validators/videoValidators.ts
│   │
│   └── feed/
│       ├── application/
│       │   └── use-cases/GetFeedUseCase.ts   # v1: recency; v2: emotion algorithm
│       └── interface/
│           ├── routes.ts
│           └── controllers/FeedController.ts   │
   ├── likes/
   │   ├── domain/
   │   │   └── repositories/ILikeRepository.ts
   │   ├── application/
   │   │   ├── use-cases/LikeVideoUseCase.ts
   │   │   └── use-cases/UnlikeVideoUseCase.ts
   │   ├── infrastructure/
   │   │   └── repositories/PrismaLikeRepository.ts
   │   └── interface/
   │       ├── routes.ts
   │       └── controllers/LikeController.ts
   │
   └── comments/
       ├── domain/
       │   ├── entities/Comment.ts
       │   └── repositories/ICommentRepository.ts
       ├── application/
       │   ├── use-cases/PostCommentUseCase.ts
       │   ├── use-cases/GetCommentsUseCase.ts
       │   └── use-cases/DeleteCommentUseCase.ts
       ├── infrastructure/
       │   └── repositories/PrismaCommentRepository.ts
       └── interface/
           ├── routes.ts
           ├── controllers/CommentController.ts
           └── validators/commentValidators.ts│
├── shared/
│   ├── middleware/
│   │   ├── authGuard.ts        # Verifies JWT, attaches req.user
│   │   ├── rateLimiter.ts      # express-rate-limit configs
│   │   ├── errorHandler.ts     # Global error middleware (last in chain)
│   │   ├── requestLogger.ts    # Pino HTTP logging
│   │   └── validateRequest.ts  # Zod validation middleware factory
│   ├── errors/
│   │   ├── AppError.ts         # Base error class
│   │   ├── AuthError.ts        # 401/403 errors
│   │   ├── NotFoundError.ts    # 404 errors
│   │   └── ValidationError.ts  # 422 errors
│   └── utils/
│       ├── jwt.ts              # sign, verify, decode helpers
│       ├── hash.ts             # bcrypt wrappers
│       └── pagination.ts       # Cursor-based pagination helpers
│
├── infrastructure/
│   └── (shared adapters if needed cross-module)
│
├── app.ts              # Express app factory (registers middleware + routes)
└── server.ts           # HTTP server entry point (calls app factory)
```

## Module Rules (CRITICAL)

1. **Routes → Controllers → Use Cases → Repositories** — never skip layers
2. **Controllers are thin** — parse req, call one use case, send res. No logic.
3. **Use Cases own business logic** — one use case per business operation
4. **Repositories are interfaces** in domain, Prisma implementations in infrastructure
5. **No cross-module imports** — if `feed` needs user data, it calls through the `users` module's public interface or its own repository projection
6. **Shared code** goes in `shared/` only if used by 2+ modules

## Authentication

```typescript
// Every protected route uses authGuard middleware:
router.get('/me', authGuard, UserController.getProfile);

// authGuard:
// 1. Extract Bearer token from Authorization header
// 2. Verify JWT signature (RS256 public key)
// 3. Check token expiry
// 4. Attach decoded payload to req.user
// 5. On failure: throw AuthError(401)
```

JWT configuration:
- **Access token:** RS256, 15 minutes TTL, payload: `{ sub: userId, email }`
- **Refresh token:** stored in DB (`RefreshToken` table), 7 days TTL, httpOnly cookie
- **Rotation:** each refresh call revokes old token and issues new one

## Security Middleware Stack (order matters)

```typescript
// In app.ts — applied in this order:
app.use(helmet())                    // Security headers
app.use(cors(corsOptions))           // Strict allowlist
app.use(generalRateLimiter)          // 100 req / 15min
app.use(express.json({ limit: '10kb' }))  // Body size limit for JSON
app.use(requestLogger)               // Pino HTTP logger
// Routes registered here
app.use(errorHandler)                // Must be LAST
```

## Mux Integration

```typescript
// Video upload flow:
// 1. Client calls POST /videos/upload-url
// 2. Backend calls Mux.Video.Uploads.create() → gets direct upload URL
// 3. Backend creates Video record (status: PROCESSING)
// 4. Client uploads directly to Mux (not through our backend)
// 5. Mux calls POST /webhooks/mux with asset.ready event
// 6. Backend verifies Mux webhook signature (CRITICAL — prevents spoofing)
// 7. Backend updates Video status=READY, saves playbackId

// Webhook signature verification:
// Mux sends Mux-Signature header — always verify before processing
```

## Redis Cache Patterns

```typescript
// Feed pool cache
const FEED_CACHE_KEY = (userId: string) => `feed:pool:${userId}`;
const FEED_TTL = 300; // 5 minutes

// Video metadata cache
const VIDEO_CACHE_KEY = (videoId: string) => `video:${videoId}`;
const VIDEO_TTL = 600; // 10 minutes

// Always: check cache first, DB on miss, populate cache after DB read
```

## Error Handling Pattern

```typescript
// In controllers — let errors propagate:
async getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await this.useCase.execute(req.user.id);
    res.json(result);
  } catch (error) {
    next(error); // errorHandler middleware catches it
  }
}

// errorHandler maps AppError subclasses to HTTP status codes
// Unknown errors → 500 + logged (never expose stack trace to client)
```

## Environment Variables (required)

```bash
# backend/.env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/speed_dating
REDIS_URL=redis://localhost:6379
JWT_PRIVATE_KEY=<RS256 private key PEM>
JWT_PUBLIC_KEY=<RS256 public key PEM>
REFRESH_TOKEN_SECRET=<random 64-char hex>
MUX_TOKEN_ID=<from Mux dashboard>
MUX_TOKEN_SECRET=<from Mux dashboard>
MUX_WEBHOOK_SECRET=<from Mux dashboard>
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

All variables validated at startup in `config/env.ts` using Zod. App crashes if any required var is missing.

## Database Commands

```bash
cd backend
npm run db:migrate:dev    # prisma migrate dev (development)
npm run db:migrate:prod   # prisma migrate deploy (production)
npm run db:seed           # Run seed script
npm run db:studio         # Open Prisma Studio
npm run db:generate       # Regenerate Prisma client after schema change
```

## Testing

```bash
cd backend
npm run test              # Vitest (unit + integration)
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run typecheck         # tsc --noEmit
npm run lint              # ESLint
```

Test file convention: `*.test.ts` alongside the file being tested.  
Integration tests use a separate test database (set `DATABASE_URL` in `.env.test`).

## Logging Standards

Use the Pino logger instance from `shared/logger.ts`. Never use `console.log` in production code.

```typescript
import { logger } from '@/shared/logger';
logger.info({ userId, action: 'video.upload' }, 'Video upload initiated');
logger.error({ err, videoId }, 'Mux webhook processing failed');
```
