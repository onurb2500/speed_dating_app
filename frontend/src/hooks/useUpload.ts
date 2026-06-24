"use client";

import { useCallback, useRef, useState } from "react";
import { apiErrorMessage } from "@/lib/api";
import { uploadVideo } from "@/lib/uploadVideo";

export type UploadPhase =
  | "idle"
  | "requesting"
  | "uploading"
  | "processing"
  | "ready"
  | "error";

/**
 * Interactive upload hook: wraps `uploadVideo` with phase + error state and a
 * cancel flag for the status-polling step.
 */
export function useUpload() {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const cancelled = useRef(false);

  const upload = useCallback(
    async (blob: Blob, durationSeconds: number): Promise<string | null> => {
      cancelled.current = false;
      setError(null);
      try {
        const { videoId, ready } = await uploadVideo(blob, durationSeconds, {
          onPhase: setPhase,
          isCancelled: () => cancelled.current,
        });
        // Confirm succeeded → the upload is done. If it's still processing the
        // asset already exists and will appear once Mux finishes; this is not
        // an error and must not trigger a re-upload.
        setPhase(ready ? "ready" : "processing");
        return videoId;
      } catch (err) {
        setPhase("error");
        setError(apiErrorMessage(err, "Falha no upload"));
        return null;
      }
    },
    [],
  );

  const cancel = useCallback(() => {
    cancelled.current = true;
  }, []);

  return { phase, error, upload, cancel };
}
