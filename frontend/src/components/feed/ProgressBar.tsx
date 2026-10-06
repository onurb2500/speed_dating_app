"use client";

/**
 * Three-segment bar representing the 3 prompt sections of the 45s clip. Segments
 * fill in sequence as playback progresses.
 */
export function ProgressBar({ progress }: { progress: number }) {
  const segments = [0, 1, 2];
  return (
    <div className="absolute inset-x-[18px] top-[64px] z-20 flex gap-[5px]">
      {segments.map((i) => {
        const fill = Math.min(1, Math.max(0, progress * 3 - i));
        return (
          <div
            key={i}
            className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.22]"
          >
            <div
              className="h-full rounded-full bg-grad-progress transition-[width] duration-150"
              style={{ width: `${fill * 100}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
