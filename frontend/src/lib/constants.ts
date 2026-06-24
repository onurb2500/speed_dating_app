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

/** Base prompts (PT) per FLOWS.md §2 — each becomes active at startTime. */
export const BASE_PROMPTS: Prompt[] = [
  {
    id: 1,
    baseText: "Minha [personagem favorita] da Disney é a [Minie]",
    tokens: [
      {
        placeholder: "personagem favorita",
        value: "personagem favorita",
        suggestions: ["vilã favorita", "princesa favorita", "dupla favorita"],
      },
      {
        placeholder: "Minie",
        value: "Minie",
        suggestions: ["Úrsula", "Mulan", "Stitch"],
      },
    ],
    startTime: 0,
    poseHint: "Incline levemente para frente e sorria naturalmente",
    toneHint: "caloroso e divertido",
    toneBadgeIcon: "✨",
  },
  {
    id: 2,
    baseText:
      "Se eu pudesse dominar uma habilidade instantaneamente seria [tocar piano]",
    tokens: [
      {
        placeholder: "tocar piano",
        value: "tocar piano",
        suggestions: ["falar 10 idiomas", "cozinhar como chef", "dançar salsa"],
      },
    ],
    startTime: 15,
    poseHint: "Use as mãos para gesticular e incline a cabeça",
    toneHint: "curioso e expressivo",
    toneBadgeIcon: "🎭",
  },
  {
    id: 3,
    baseText: "Minha tarde livre perfeita parece com [um café e um bom livro]",
    tokens: [
      {
        placeholder: "um café e um bom livro",
        value: "um café e um bom livro",
        suggestions: [
          "uma trilha na natureza",
          "maratona de filmes",
          "praia ao pôr do sol",
        ],
      },
    ],
    startTime: 30,
    poseHint: "Sorriso aberto e postura relaxada",
    toneHint: "leve e acolhedor",
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
  natural: "Natural",
  vintage: "Vintage",
  vivid: "Vivid",
  bw: "P&B",
  warm: "Warm",
};

export const EMOJI_PALETTE = [
  "❤️", "😍", "🔥", "✨", "😎", "🥰", "😂", "🌹", "💫", "👑", "🦋", "🍀",
];
