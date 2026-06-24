"use client";

import { useEffect, useRef } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useOfflineCache } from "@/hooks/useOfflineCache";
import { uploadVideo } from "@/lib/uploadVideo";

/**
 * When connectivity is restored, automatically uploads any videos that were
 * recorded while offline (stored in IndexedDB) and clears them on success.
 */
export function usePendingUploadSync(): void {
  const online = useOnlineStatus();
  const { getPendingUploads, removePendingUpload } = useOfflineCache();
  const syncing = useRef(false);

  useEffect(() => {
    if (!online || syncing.current) return;

    syncing.current = true;
    void (async () => {
      try {
        const pending = await getPendingUploads();
        for (const item of pending) {
          try {
            await uploadVideo(item.blob, item.durationSeconds);
            // Confirm succeeded → the asset was created, so drop it from the
            // queue regardless of processing state. Keeping it (e.g. because it
            // wasn't READY yet) would re-PUT the same blob on every reconnect
            // and pile up duplicate Mux assets.
            await removePendingUpload(item.id);
          } catch {
            // Upload genuinely failed before the asset was created — keep it
            // queued for the next reconnect.
          }
        }
      } finally {
        syncing.current = false;
      }
    })();
  }, [online, getPendingUploads, removePendingUpload]);
}
