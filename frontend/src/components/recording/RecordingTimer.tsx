"use client";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { MAX_VIDEO_DURATION } from "@/lib/constants";

interface RecordingTimerProps {
  elapsed: number;
  isWarning: boolean;
  promptIndex: number;
  promptCount: number;
}

/** Top bar: question progress, live timer, red REC dot. */
export function RecordingTimer({
  elapsed,
  isWarning,
  promptIndex,
  promptCount,
}: RecordingTimerProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-full bg-black/40 px-4 py-2 text-sm text-white backdrop-blur">
      <span className="font-medium">
        Q{promptIndex + 1} de {promptCount}
      </span>
      <span className={cn(isWarning && "font-bold text-brand-pink")}>
        {formatTime(elapsed)} / {formatTime(MAX_VIDEO_DURATION)}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-pink" />
        REC
      </span>
    </div>
  );
}
