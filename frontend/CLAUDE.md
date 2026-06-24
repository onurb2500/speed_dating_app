# Frontend — Claude Code Context

## Stack

- **Framework:** Next.js 14 App Router (TypeScript strict)
- **Styling:** Tailwind CSS + shadcn/ui components
- **State:** Zustand (no Redux, no Context API for global state)
- **Video recording:** `react-media-recorder`
- **HTTP client:** Axios with interceptors (auto token refresh)
- **Forms:** React Hook Form + Zod resolvers
- **Animations:** Framer Motion (for recording overlay, feed transitions)
- **PWA:** `next-pwa` (service worker for offline shell)

## Directory Map

```
frontend/src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, providers)
│   ├── page.tsx                # Landing / redirect logic
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── record/
│   │   ├── page.tsx            # Recording flow (orchestrator)
│   │   └── layout.tsx          # Full-screen dark layout
│   └── feed/
│       ├── page.tsx            # Feed entry point
│       └── layout.tsx          # Full-screen layout
│
├── components/
│   ├── recording/
│   │   ├── RecordingScreen.tsx     # Full-screen camera view
│   │   ├── CountdownOverlay.tsx    # 3-2-1 countdown animation
│   │   ├── PromptOverlay.tsx       # On-screen prompt text + transitions
│   │   ├── PoseGuide.tsx           # Pose suggestion animations
│   │   ├── ToneIndicator.tsx       # Tone badge (warm, playful, etc.)
│   │   ├── PromptCustomizer.tsx    # Pre-recording prompt personalization
│   │   ├── RecordingTimer.tsx      # Live timer + red dot   │   ├── FilterPicker.tsx        # Camera filter selector (canvas-based)
   │   ├── EmojiOverlay.tsx        # Draggable emoji sticker overlay│   │   └── PreviewScreen.tsx       # Playback + re-record / submit
│   ├── feed/
│   │   ├── FeedScroller.tsx        # Full-page snap scroll container
│   │   ├── VideoCard.tsx           # Single video item in feed   │   ├── LikeButton.tsx          # Like toggle with animated heart + count
   │   ├── CommentsDrawer.tsx      # Bottom drawer with paginated comment list
   │   ├── CommentInput.tsx        # Text input + send button inside drawer│   │   └── EmptyFeedState.tsx      # Empty pool friendly state
│   └── ui/                         # Generic primitives (shadcn/ui based)
│
├── hooks/
│   ├── useVideoRecorder.ts         # Wraps react-media-recorder
│   ├── useRecordingTimer.ts        # 45s countdown logic
│   ├── usePromptSequence.ts        # Manages prompt transitions at 15s/30s
│   ├── useCameraFilter.ts          # Canvas filter pipeline over camera stream
│   ├── useFeed.ts                  # Infinite scroll + prefetch
│   ├── useLike.ts                  # Optimistic like toggle
│   ├── useComments.ts              # Paginated comment fetch + post
│   ├── useOfflineCache.ts          # IndexedDB read/write for offline videos
│   └── useAuth.ts                  # Session state + token refresh
│
├── lib/
│   ├── api.ts                      # Axios instance with auth interceptors
│   ├── constants.ts                # MAX_DURATION=45, API_BASE_URL, etc.
│   └── utils.ts                    # cn() helper, formatters
│
├── store/
│   ├── authStore.ts                # { user, accessToken, login, logout }
│   ├── recordingStore.ts           # { phase, videoBlob, prompts, activeFilter, emojis, ... }
│   └── feedStore.ts                # { videos, currentIndex, fetchMore, offlineVideos }
│
└── types/
    └── index.ts                    # User, Video, FeedItem, RecordingPhase, etc.
```

## Component Rules

1. **No business logic in components** — extract to hooks or store
2. **Every component is mobile-first** — design at 375px, scale up
3. **Full-screen UI** — recording and feed use `h-dvh` (dynamic viewport height) to handle mobile browser chrome
4. **Autoplay policy** — Videos must be muted initially or triggered by user gesture to satisfy browser autoplay policy; unmute on tap
5. **Accessibility** — All interactive elements have `aria-label`; color is never the only indicator

## Recording State Machine

```
idle → countdown → recording → preview → uploading → done
                ↑_______________↓ (re-record)
```

Managed in `recordingStore.ts`. Components observe state and render accordingly.

## Prompt Sequence Data Structure

```typescript
interface Prompt {
  id: number;                          // 1-3
  baseText: string;                    // full prompt sentence
  tokens: PromptToken[];               // editable parts
  startTime: number;                   // 0, 15, 30 (seconds)
  poseHint: string;                    // "incline levemente, sorria"
  toneHint: string;                    // "caloroso e divertido"
  toneBadgeIcon: string;               // emoji
}

interface PromptToken {
  placeholder: string;                 // e.g. "personagem favorita"
  value: string;                       // user-edited value
  suggestions: string[];               // clickable chips
}
```

## API Client (lib/api.ts)

```typescript
// Axios instance setup:
// - baseURL from NEXT_PUBLIC_API_URL env var
// - Request interceptor: attach accessToken from authStore
// - Response interceptor: on 401, call /auth/refresh, retry original request
// - On refresh failure: clear session, redirect to /login
```

## Environment Variables

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MUX_ENV_KEY=your_mux_env_key  # for Mux Player
```

## Mobile UI Standards

- Minimum tap target: 44×44px (Apple HIG)
- Font size minimum: 16px (prevents iOS zoom on input focus)
- Safe area insets: use `pb-safe`, `pt-safe` Tailwind utilities (env(safe-area-inset-*))
- Scroll snap: feed uses `scroll-snap-type: y mandatory` on container, `scroll-snap-align: start` on each video
- No hover-only interactions (mobile has no hover)

## Testing

```bash
cd frontend
npm run test          # Vitest unit tests
npm run test:watch    # Watch mode
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint
```

Test files live next to the code they test: `useVideoRecorder.test.ts` beside `useVideoRecorder.ts`.
