"use client";

/** Tone suggestion badge shown in the corner during recording. */
export function ToneIndicator({ hint, icon }: { hint: string; icon: string }) {
  return (
    <span className="rounded-full bg-brand-cyan/20 px-3 py-1 text-sm font-medium text-brand-cyan">
      {icon} Tom: {hint}
    </span>
  );
}
