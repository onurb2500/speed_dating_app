import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  activePromptIndex,
  usePromptSequence,
} from "@/hooks/usePromptSequence";
import { BASE_PROMPTS } from "@/lib/constants";

describe("activePromptIndex", () => {
  it("returns the prompt active at a given elapsed time", () => {
    expect(activePromptIndex(BASE_PROMPTS, 0)).toBe(0);
    expect(activePromptIndex(BASE_PROMPTS, 14)).toBe(0);
    expect(activePromptIndex(BASE_PROMPTS, 15)).toBe(1);
    expect(activePromptIndex(BASE_PROMPTS, 29)).toBe(1);
    expect(activePromptIndex(BASE_PROMPTS, 30)).toBe(2);
    expect(activePromptIndex(BASE_PROMPTS, 44)).toBe(2);
  });
});

describe("usePromptSequence", () => {
  it("exposes the current index and prompt", () => {
    const { result } = renderHook(() => usePromptSequence(BASE_PROMPTS, 16));
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.current).toBe(BASE_PROMPTS[1]);
  });
});
