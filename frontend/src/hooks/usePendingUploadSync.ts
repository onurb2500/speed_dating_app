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
            const videoId = await uploadVideo(item.blob, item.durationSeconds);
            if (videoId) await removePendingUpload(item.id);
          } catch {
            // Leave it queued for the next reconnect.
          }
        }
      } finally {
        syncing.current = false;
      }
    })();
  }, [online, getPendingUploads, removePendingUpload]);
}
