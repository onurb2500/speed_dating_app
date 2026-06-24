"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRecordingStore } from "@/store/recordingStore";
import { useUpload } from "@/hooks/useUpload";
import { useOfflineCache } from "@/hooks/useOfflineCache";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { PromptCustomizer } from "@/components/recording/PromptCustomizer";
import { RecordingScreen } from "@/components/recording/RecordingScreen";
import { PreviewScreen } from "@/components/recording/PreviewScreen";
import { Spinner } from "@/components/ui/Spinner";
import { MAX_VIDEO_DURATION } from "@/lib/constants";

export default function RecordPage() {
  const { ready } = useRequireAuth();
  const router = useRouter();
  const online = useOnlineStatus();
  const { phase, videoBlob, setPhase, setVideoBlob, reset } =
    useRecordingStore();
  const { upload, phase: uploadPhase, error } = useUpload();
  const { savePendingUpload } = useOfflineCache();

  // Enter the flow at the prompt customization step.
  useEffect(() => {
    if (phase === "idle") setPhase("customizing");
  }, [phase, setPhase]);

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  async function handleSubmit() {
    if (!videoBlob) return;
    const durationSeconds = MAX_VIDEO_DURATION;

    if (!online) {
      await savePendingUpload(videoBlob, durationSeconds);
      reset();
      router.push("/feed?pending=1");
      return;
    }

    setPhase("uploading");
    const videoId = await upload(videoBlob, durationSeconds);
    if (videoId) {
      // Upload + confirm succeeded. Even if still processing, the asset exists
      // and will surface in the feed once Mux finishes — do NOT queue a retry.
      reset();
      router.push("/feed");
    } else {
      // Genuine failure before the asset was created → safe to retry later.
      await savePendingUpload(videoBlob, durationSeconds);
      setPhase("preview");
    }
  }

  if (phase === "customizing") {
    return <PromptCustomizer onConfirm={() => setPhase("recording")} />;
  }

  if (phase === "recording") {
    return (
      <RecordingScreen
        onRecorded={(blob) => {
          setVideoBlob(blob);
          setPhase("preview");
        }}
      />
    );
  }

  if ((phase === "preview" || phase === "uploading") && videoBlob) {
    return (
      <div className="relative h-dvh">
        <PreviewScreen
          blob={videoBlob}
          submitting={phase === "uploading"}
          onRetake={() => {
            setVideoBlob(null);
            setPhase("recording");
          }}
          onSubmit={handleSubmit}
        />
        {phase === "uploading" && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-black/70">
            <Spinner className="h-8 w-8" />
            <p className="text-sm text-white">
              {uploadPhase === "processing"
                ? "Processando seu vídeo…"
                : "Enviando…"}
            </p>
          </div>
        )}
        {error && phase === "preview" && (
          <p className="absolute inset-x-0 bottom-28 text-center text-sm text-brand-pink">
            {error} — salvamos seu vídeo para tentar mais tarde.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-dvh items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
