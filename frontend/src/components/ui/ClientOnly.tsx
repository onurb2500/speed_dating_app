"use client";

import { ReactNode, useEffect, useState } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  /** Rendered until the first client mount completes (e.g. a poster). */
  fallback?: ReactNode;
}

/**
 * Renders its children only after the first client-side mount. Use to keep
 * browser-only web components (e.g. <mux-player>, which spins up hls.js +
 * MediaSource) out of the SSR/first-paint render path. The ref stays on the
 * wrapped child, so imperative control is preserved — unlike next/dynamic.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{mounted ? children : fallback}</>;
}
