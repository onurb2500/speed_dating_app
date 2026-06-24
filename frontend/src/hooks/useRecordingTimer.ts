"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_VIDEO_DURATION, TIMER_WARNING_AT } from "@/lib/constants";

interface UseRecordingTimerOptions {
  active: boolean;
  maxDuration?: number;
  /** Called once when the max duration is reached (auto-stop). */
  onComplete?: () => void;
}

interface RecordingTimer {
  elapsed: number;
  remaining: number;
  isWarning: boolean;
}

/**
 * Counts elapsed seconds while `active`, auto-firing `onComplete` at the cap.
 * Highlights the final 5 seconds via `isWarning`.
 */
export function useRecordingTimer({
  active,
  maxDuration = MAX_VIDEO_DURATION,
  onComplete,
}: UseRecordingTimerOptions): RecordingTimer {
  const [elapsed, setElapsed] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      completedRef.current = false;
      return;
    }

    const startedAt = Date.now();
    const interval = setInterval(() => {
      const secs = (Date.now() - startedAt) / 1000;
      if (secs >= maxDuration) {
        setElapsed(maxDuration);
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current?.();
        }
        clearInterval(interval);
        return;
      }
      setElapsed(secs);
    }, 100);

    return () => clearInterval(interval);
  }, [active, maxDuration]);

  return {
    elapsed,
    remaining: Math.max(0, maxDuration - elapsed),
    isWarning: elapsed >= TIMER_WARNING_AT,
  };
}
