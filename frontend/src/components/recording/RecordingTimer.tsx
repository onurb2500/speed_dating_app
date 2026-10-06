"use client";

import { cn, formatTime } from "@/lib/utils";
import { MAX_VIDEO_DURATION } from "@/lib/constants";

interface RecordingTimerProps {
  elapsed: number;
  isWarning: boolean;
  promptIndex: number;
  promptCount: number;
}

/** Glass top bar: question progress, live timer, pulsing REC capsule. */
export function RecordingTimer({
  elapsed,
  isWarning,
  promptIndex,
  promptCount,
}: RecordingTimerProps) {
  return (
    <div className="glass flex h-[38px] items-center justify-between rounded-full pl-4 pr-2 text-onDarkSoft">
      <span className="text-[13px]">
        <span className="font-semibold">Q{promptIndex + 1} </span>
        <span className="text-onDarkSoft/50">of {promptCount}</span>
      </span>

      <span
        className={cn(
          "text-[14px] font-medium tabular-nums",
          isWarning && "text-accent-hot",
        )}
      >
        {formatTime(elapsed)}{" "}
        <span className="text-onDarkSoft/45">/ {formatTime(MAX_VIDEO_DURATION)}</span>
      </span>

      <span className="flex items-center gap-1.5 rounded-full bg-[rgba(240,87,127,0.18)] py-[5px] pl-[9px] pr-[11px]">
        <span className="h-2 w-2 animate-recPulse rounded-full bg-accent-hot shadow-[0_0_8px_#ff486f]" />
        <span className="text-[11.5px] font-bold tracking-[1px] text-onDarkBlush">
          REC
        </span>
      </span>
    </div>
  );
}
