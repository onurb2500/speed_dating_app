"use client";

import { CameraFilter } from "@/types";
import { FILTER_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FILTERS: CameraFilter[] = ["natural", "vintage", "vivid", "bw", "warm"];

interface FilterPickerProps {
  active: CameraFilter;
  onChange: (filter: CameraFilter) => void;
}

export function FilterPicker({ active, onChange }: FilterPickerProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {FILTERS.map((f) => (
        <button
          key={f}
          type="button"
          aria-label={`Filtro ${FILTER_LABELS[f]}`}
          aria-pressed={active === f}
          onClick={() => onChange(f)}
          className={cn(
            "min-h-[44px] shrink-0 rounded-full px-4 text-sm font-medium transition-colors",
            active === f
              ? "bg-white text-black"
              : "bg-white/10 text-white hover:bg-white/20",
          )}
        >
          {FILTER_LABELS[f]}
        </button>
      ))}
    </div>
  );
}
