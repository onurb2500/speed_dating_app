"use client";

import { useEffect, useRef, useState } from "react";
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
  const [url, setUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Create the object URL inside the effect so each mount cycle gets its own
  // instance. Under React StrictMode the mount→unmount→remount sequence would
  // otherwise revoke a memoized URL and leave the remounted <video> pointing at
  // a dead blob: URL ("may not load data from blob:").
  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return (
    <div className="relative flex h-dvh flex-col bg-black">
      <video
        ref={videoRef}
        src={url ?? undefined}
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
