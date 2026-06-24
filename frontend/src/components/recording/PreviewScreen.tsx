"use client";

import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/Button";

interface PreviewScreenProps {
  blob: Blob;
  onRetake: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

/** Playback of the recorded clip with re-record / submit actions. */
export function PreviewScreen({
  blob,
  onRetake,
  onSubmit,
  submitting,
}: PreviewScreenProps) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <div className="relative flex h-dvh flex-col bg-black">
      <video
        ref={videoRef}
        src={url}
        className="h-full w-full object-cover"
        autoPlay
        loop
        playsInline
        controls={false}
      />
      <div className="absolute inset-x-0 bottom-0 flex gap-3 p-5 pb-safe">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={onRetake}
          disabled={submitting}
        >
          Regravar
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={onSubmit}
          loading={submitting}
        >
          Ficou ótimo! ✨
        </Button>
      </div>
    </div>
  );
}
