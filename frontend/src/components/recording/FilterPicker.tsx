"use client";

import { CameraFilter } from "@/types";
import { FILTER_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FILTERS: CameraFilter[] = ["natural", "vintage", "vivid", "bw", "warm"];

/** Swatch gradient per filter (decorative preview of the look). */
const SWATCH: Record<CameraFilter, string> = {
  natural: "linear-gradient(160deg,#5a3a3a,#7a5a52)",
  vintage: "linear-gradient(160deg,#7a5a3a,#9a7a4a)",
  vivid: "linear-gradient(160deg,#f0577f,#f5714a)",
  bw: "linear-gradient(160deg,#444,#999)",
  warm: "linear-gradient(160deg,#c0623a,#e09a5a)",
};

interface FilterPickerProps {
  active: CameraFilter;
  onChange: (filter: CameraFilter) => void;
}

/** Horizontal filter carousel: active = larger thumb, white border, glow. */
export function FilterPicker({ active, onChange }: FilterPickerProps) {
  return (
    <div className="no-scrollbar flex items-end gap-[11px] overflow-x-auto">
      {FILTERS.map((f) => {
        const isActive = active === f;
        return (
          <button
            key={f}
            type="button"
            aria-label={`Filter ${FILTER_LABELS[f]}`}
            aria-pressed={isActive}
            onClick={() => onChange(f)}
            className="flex shrink-0 flex-col items-center"
          >
            <span
              className={cn(
                "block",
                isActive
                  ? "h-[62px] w-[62px] rounded-[20px] border-[2.5px] border-white shadow-[0_0_20px_rgba(240,87,127,0.5)]"
                  : "h-[54px] w-[54px] rounded-thumb",
              )}
              style={{
                background: SWATCH[f],
                filter: f === "vintage" ? "sepia(0.4)" : undefined,
              }}
            />
            <span
              className={cn(
                "mt-[6px]",
                isActive
                  ? "text-[11.5px] font-semibold text-white"
                  : "text-[11px] text-onDarkSoft/60",
              )}
            >
              {FILTER_LABELS[f]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
