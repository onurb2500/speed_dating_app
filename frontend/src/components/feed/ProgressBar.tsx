"use client";

/** Thin progress bar showing playback position of the active video. */
export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-x-0 top-0 z-20 h-0.5 bg-white/20 pt-safe">
      <div
        className="h-full bg-white transition-[width] duration-150"
        style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
      />
    </div>
  );
}
