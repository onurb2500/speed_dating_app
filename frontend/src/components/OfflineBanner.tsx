"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/** Discreet banner shown when the device is offline. */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[60] bg-accent-rose/90 py-1.5 text-center text-xs font-medium text-white pt-safe"
    >
      Offline mode — showing saved videos
    </div>
  );
}
