"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CameraFilter, EmojiSticker } from "@/types";
import { FILTER_CSS } from "@/lib/constants";

export type RecorderStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "recording"
  | "stopped"
  | "denied"
  | "error";

interface UseVideoRecorderOptions {
  filter: CameraFilter;
  emojis: EmojiSticker[];
}

interface VideoRecorder {
  status: RecorderStatus;
  error: string | null;
  /** Visible preview canvas (filtered + emoji composited). */
  canvasRef: React.RefObject<HTMLCanvasElement>;
  requestPermissions: () => Promise<boolean>;
  start: () => void;
  stop: () => void;
  blob: Blob | null;
  reset: () => void;
}

/**
 * Camera + MediaRecorder wrapper that composites the live camera through a
 * canvas (applying the active filter and draggable emoji stickers) and records
 * the canvas stream so the saved video matches the on-screen preview.
 */
export function useVideoRecorder({
  filter,
  emojis,
}: UseVideoRecorderOptions): VideoRecorder {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);

  // Live values read by the draw loop without restarting it.
  const filterRef = useRef<CameraFilter>(filter);
  const emojisRef = useRef<EmojiSticker[]>(emojis);
  filterRef.current = filter;
  emojisRef.current = emojis;

  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && video && ctx && video.readyState >= 2) {
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 1280;
      }
      ctx.save();
      ctx.filter = FILTER_CSS[filterRef.current] ?? "none";
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Emoji stickers (filter must not apply to them).
      const size = canvas.width * 0.12;
      ctx.font = `${size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const sticker of emojisRef.current) {
        ctx.fillText(
          sticker.emoji,
          sticker.x * canvas.width,
          sticker.y * canvas.height,
        );
      }
    }
    rafRef.current = requestAnimationFrame(drawFrame);
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setStatus("requesting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 720, height: 1280 },
        audio: true,
      });
      streamRef.current = stream;
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      videoRef.current = video;
      rafRef.current = requestAnimationFrame(drawFrame);
      setStatus("ready");
      return true;
    } catch (err) {
      const denied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "SecurityError");
      setStatus(denied ? "denied" : "error");
      setError(
        denied
          ? "Permissão de câmera/microfone negada"
          : "Não foi possível acessar a câmera",
      );
      return false;
    }
  }, [drawFrame]);

  const start = useCallback(() => {
    const canvas = canvasRef.current;
    const stream = streamRef.current;
    if (!canvas || !stream) return;

    const canvasStream = canvas.captureStream(30);
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) canvasStream.addTrack(audioTrack);

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";

    const recorder = new MediaRecorder(canvasStream, { mimeType });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      setBlob(new Blob(chunksRef.current, { type: mimeType }));
      setStatus("stopped");
    };
    recorder.start();
    recorderRef.current = recorder;
    setStatus("recording");
  }, []);

  const stop = useCallback(() => {
    recorderRef.current?.state === "recording" && recorderRef.current.stop();
  }, []);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    videoRef.current = null;
    recorderRef.current = null;
  }, []);

  const reset = useCallback(() => {
    cleanup();
    chunksRef.current = [];
    setBlob(null);
    setStatus("idle");
    setError(null);
  }, [cleanup]);

  useEffect(() => cleanup, [cleanup]);

  return {
    status,
    error,
    canvasRef,
    requestPermissions,
    start,
    stop,
    blob,
    reset,
  };
}
