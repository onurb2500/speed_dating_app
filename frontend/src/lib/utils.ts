import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Prompt } from "@/types";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format seconds as M:SS. */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Compact like/comment counts (1.2k). */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

/**
 * Build the final prompt sentence by substituting each `[token]` in order
 * with the token's current value.
 */
export function renderPromptText(prompt: Prompt): string {
  let i = 0;
  return prompt.baseText.replace(/\[[^\]]+\]/g, () => {
    const token = prompt.tokens[i];
    i += 1;
    return token ? token.value : "";
  });
}

/** Relative time in PT (e.g. "há 2h"). */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}
