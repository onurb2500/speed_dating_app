"use client";

import { CameraFilter } from "@/types";
import { FILTER_CSS } from "@/lib/constants";

/** Resolves a camera filter id to its CSS `filter` value. */
export function useCameraFilter(filter: CameraFilter): { filterCss: string } {
  return { filterCss: FILTER_CSS[filter] };
}
