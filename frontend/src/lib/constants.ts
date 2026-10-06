import { CameraFilter, Prompt } from "@/types";

export const MAX_VIDEO_DURATION = 45; // seconds
export const COUNTDOWN_SECONDS = 3;
export const TIMER_WARNING_AT = 40; // highlight last 5s red
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** Number of feed videos to pre-cache for offline use after a session. */
export const OFFLINE_PREFETCH_COUNT = 3;

/** Feed page size (mirrors the backend default/cap). */
export const FEED_PAGE_DEFAULT = 10;

/** Comment length cap (mirrors the backend). */
export const COMMENT_MAX_LENGTH = 280;

/** Base prompts (EN) per SCREENS.md §2/§3 — each becomes active at startTime. */
export const BASE_PROMPTS: Prompt[] = [
  {
    id: 1,
    baseText:
      "My favorite Disney character is [Minnie] — but not the classic one. Mine's [in sneakers, ripped]",
    tokens: [
      {
        placeholder: "Minnie",
        value: "Minnie",
        suggestions: ["Ursula", "Mulan", "Stitch"],
      },
      {
        placeholder: "in sneakers, ripped",
        value: "in sneakers, ripped",
        suggestions: ["in a leather jacket", "with a buzzcut", "off-duty"],
      },
    ],
    startTime: 0,
    poseHint: "Lean in. Soften the smile.",
    toneHint: "warm & playful",
    toneBadgeIcon: "✨",
  },
  {
    id: 2,
    baseText: "If I could instantly master one skill, it'd be [play piano]",
    tokens: [
      {
        placeholder: "play piano",
        value: "play piano",
        suggestions: ["speak 10 languages", "cook like a chef", "dance salsa"],
      },
    ],
    startTime: 15,
    poseHint: "Use your hands. Tilt your head a touch.",
    toneHint: "curious & expressive",
    toneBadgeIcon: "🎭",
  },
  {
    id: 3,
    baseText: "My perfect lazy afternoon looks like [slow coffee and zero plans]",
    tokens: [
      {
        placeholder: "slow coffee and zero plans",
        value: "slow coffee and zero plans",
        suggestions: [
          "a trail in the woods",
          "a movie marathon",
          "the beach at sunset",
        ],
      },
    ],
    startTime: 30,
    poseHint: "Open smile, relaxed shoulders.",
    toneHint: "easy & inviting",
    toneBadgeIcon: "☀️",
  },
];

/** CSS filter string applied per camera filter. */
export const FILTER_CSS: Record<CameraFilter, string> = {
  natural: "none",
  vintage: "sepia(0.4) contrast(1.1) saturate(1.2)",
  vivid: "saturate(1.6) contrast(1.15)",
  bw: "grayscale(1) contrast(1.1)",
  warm: "sepia(0.2) saturate(1.3) hue-rotate(-10deg) brightness(1.05)",
};

export const FILTER_LABELS: Record<CameraFilter, string> = {
  natural: "natural",
  vintage: "vintage",
  vivid: "vivid",
  bw: "b&w",
  warm: "warm",
};

export const EMOJI_PALETTE = ["❤️", "🔥", "✨", "😏", "🌙", "💋", "🍒"];
