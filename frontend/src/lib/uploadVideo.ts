import axios from "axios";
import { api } from "@/lib/api";
import { VideoStatusResponse } from "@/types";

interface UploadUrlResponse {
  videoId: string;
  uploadUrl: string;
  expiresAt: string;
}

const MAX_RETRIES = 3;
const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 120_000;

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface UploadCallbacks {
  onPhase?: (phase: "requesting" | "uploading" | "processing") => void;
  isCancelled?: () => boolean;
}

export interface UploadResult {
  /** Backend video id — present once the Mux asset is created + confirmed. */
  videoId: string;
  /** Whether the asset finished processing (READY) within the poll window. */
  ready: boolean;
}

/**
 * Core upload flow shared by the interactive hook and the offline sync:
 * request a Mux upload URL → PUT the blob (retry w/ backoff) → confirm →
 * poll until READY.
 *
 * Resolves once the asset has been created + confirmed (the exactly-once
 * boundary). It throws ONLY if the upload genuinely fails before that point.
 * A processing timeout is NOT a failure — the asset already exists, so callers
 * must not retry/re-upload (doing so creates duplicate Mux assets).
 */
export async function uploadVideo(
  blob: Blob,
  durationSeconds: number,
  cb: UploadCallbacks = {},
): Promise<UploadResult> {
  cb.onPhase?.("requesting");
  const { data } = await api.post<UploadUrlResponse>("/videos/upload-url", {
    durationSeconds,
  });

  cb.onPhase?.("uploading");
  await putWithRetry(data.uploadUrl, blob);

  // Confirm = the Mux asset now exists on our side. Past this point the upload
  // must never be retried, or Mux accumulates duplicates of the same recording.
  await api.post("/videos/confirm", { videoId: data.videoId });

  cb.onPhase?.("processing");
  // Readiness is async (driven by the Mux webhook). Polling is purely for UX;
  // a timeout does not mean failure.
  const ready = await pollUntilReady(data.videoId, cb.isCancelled);
  return { videoId: data.videoId, ready };
}

async function putWithRetry(url: string, blob: Blob): Promise<void> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await axios.put(url, blob, {
        headers: { "Content-Type": blob.type || "video/webm" },
      });
      return;
    } catch (err) {
      attempt += 1;
      if (attempt >= MAX_RETRIES) throw err;
      await delay(1000 * 2 ** (attempt - 1));
    }
  }
}

async function pollUntilReady(
  videoId: string,
  isCancelled?: () => boolean,
): Promise<boolean> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (isCancelled?.()) return false;
    const { data } = await api.get<VideoStatusResponse>(
      `/videos/${videoId}/status`,
    );
    if (data.status === "READY") return true;
    if (data.status === "FAILED") return false;
    await delay(POLL_INTERVAL_MS);
  }
  return false;
}
