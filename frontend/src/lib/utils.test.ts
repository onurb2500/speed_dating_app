import { describe, it, expect } from "vitest";
import {
  cn,
  formatTime,
  formatCount,
  renderPromptText,
  timeAgo,
} from "@/lib/utils";
import { Prompt } from "@/types";

describe("utils", () => {
  it("merges class names", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });

  it("formats time as M:SS", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(9)).toBe("0:09");
    expect(formatTime(75)).toBe("1:15");
  });

  it("formats compact counts", () => {
    expect(formatCount(42)).toBe("42");
    expect(formatCount(1500)).toBe("1.5k");
    expect(formatCount(2_000_000)).toBe("2M");
  });

  it("renders prompt text by substituting tokens in order", () => {
    const prompt: Prompt = {
      id: 1,
      baseText: "Minha [a] da Disney é a [b]",
      tokens: [
        { placeholder: "a", value: "vilã", suggestions: [] },
        { placeholder: "b", value: "Úrsula", suggestions: [] },
      ],
      startTime: 0,
      poseHint: "",
      toneHint: "",
      toneBadgeIcon: "",
    };
    expect(renderPromptText(prompt)).toBe("Minha vilã da Disney é a Úrsula");
  });

  it("formats relative time in English", () => {
    const now = Date.now();
    expect(timeAgo(new Date(now).toISOString())).toBe("just now");
    expect(timeAgo(new Date(now - 5 * 60_000).toISOString())).toBe("5m ago");
    expect(timeAgo(new Date(now - 3 * 3_600_000).toISOString())).toBe("3h ago");
    expect(timeAgo(new Date(now - 2 * 86_400_000).toISOString())).toBe("2d ago");
  });
});
