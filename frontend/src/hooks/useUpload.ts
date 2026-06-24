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
        const videoId = await uploadVideo(blob, durationSeconds, {
          onPhase: setPhase,
          isCancelled: () => cancelled.current,
        });
        if (!videoId) {
          setPhase("error");
          setError("O vídeo demorou demais para processar");
          return null;
        }
        setPhase("ready");
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
