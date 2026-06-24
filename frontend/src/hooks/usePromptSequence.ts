"use client";

import { Prompt } from "@/types";

/**
 * Pure selector: returns the index of the active prompt for a given elapsed
 * time (the last prompt whose startTime has been reached).
 */
export function activePromptIndex(prompts: Prompt[], elapsed: number): number {
  let index = 0;
  for (let i = 0; i < prompts.length; i += 1) {
    if (elapsed >= prompts[i].startTime) {
      index = i;
    }
  }
  return index;
}

/** Hook form for use inside components. */
export function usePromptSequence(
  prompts: Prompt[],
  elapsed: number,
): { currentIndex: number; current: Prompt | undefined } {
  const currentIndex = activePromptIndex(prompts, elapsed);
  return { currentIndex, current: prompts[currentIndex] };
}
