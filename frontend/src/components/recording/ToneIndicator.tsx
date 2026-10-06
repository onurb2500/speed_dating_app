"use client";

/** Tone chip shown under the spoken prompt: "tone · warm & playful". */
export function ToneIndicator({ hint }: { hint: string; icon?: string }) {
  return (
    <span className="inline-flex items-center gap-[7px] rounded-full border border-white/[0.16] bg-white/10 px-[14px] py-[6px]">
      <span className="text-[12px] text-onDarkSoft/60">tone</span>
      <span className="h-[3px] w-[3px] rounded-full bg-onDarkBlush" />
      <span className="text-[12.5px] font-medium text-onDarkBlush">{hint}</span>
    </span>
  );
}
