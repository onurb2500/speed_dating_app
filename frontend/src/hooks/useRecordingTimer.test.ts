import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import { useRecordingTimer } from "@/hooks/useRecordingTimer";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useRecordingTimer", () => {
  it("counts elapsed time while active", () => {
    const { result } = renderHook(() => useRecordingTimer({ active: true }));
    expect(result.current.elapsed).toBe(0);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.elapsed).toBeGreaterThanOrEqual(2);
  });

  it("fires onComplete and caps at the max duration", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useRecordingTimer({ active: true, maxDuration: 3, onComplete }),
    );
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(onComplete).toHaveBeenCalledOnce();
    expect(result.current.elapsed).toBe(3);
    expect(result.current.remaining).toBe(0);
  });

  it("flags the warning window near the end", () => {
    const { result } = renderHook(() =>
      useRecordingTimer({ active: true, maxDuration: 45 }),
    );
    act(() => {
      vi.advanceTimersByTime(41_000);
    });
    expect(result.current.isWarning).toBe(true);
  });

  it("resets when inactive", () => {
    const { result, rerender } = renderHook(
      ({ active }) => useRecordingTimer({ active }),
      { initialProps: { active: true } },
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    rerender({ active: false });
    expect(result.current.elapsed).toBe(0);
  });
});
