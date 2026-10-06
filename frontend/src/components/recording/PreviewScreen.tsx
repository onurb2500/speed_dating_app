"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Close, Play, Check, RotateArrow } from "@/components/ui/icons";
import { formatTime } from "@/lib/utils";
import { MAX_VIDEO_DURATION } from "@/lib/constants";

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
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Create the object URL inside the effect so each mount cycle gets its own
  // instance (see StrictMode note in the original implementation).
  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  const total = videoRef.current?.duration || MAX_VIDEO_DURATION;

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-videoInk-a">
      <video
        ref={videoRef}
        src={url ?? undefined}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        playsInline
        controls={false}
        onClick={togglePlay}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setCurrent(v.currentTime);
          if (v.duration) setProgress(v.currentTime / v.duration);
        }}
      />
      <div className="vignette pointer-events-none absolute inset-0" aria-hidden />

      {/* Top row. */}
      <div className="absolute inset-x-[18px] top-[66px] flex items-center justify-between">
        <button
          type="button"
          aria-label="Discard and go back"
          onClick={onRetake}
          disabled={submitting}
          className="glass grid h-10 w-10 place-items-center rounded-full"
        >
          <Close className="h-4 w-4 text-onDarkSoft" />
        </button>
        <span className="glass rounded-full px-[15px] py-[7px] text-[13px] font-medium text-onDarkSoft/75">
          Preview · {formatTime(MAX_VIDEO_DURATION)}
        </span>
        <span className="h-10 w-10" aria-hidden />
      </div>

      {/* Play badge. */}
      {!playing && (
        <button
          type="button"
          aria-label="Play"
          onClick={togglePlay}
          className="glass-light absolute left-1/2 top-[54%] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
        >
          <Play className="ml-1 h-[22px] w-[22px] text-white" />
        </button>
      )}

      {/* Bottom block. */}
      <div className="absolute inset-x-[24px] bottom-[54px]">
        <h2 className="text-center font-display text-[30px] font-medium italic text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.5)]">
          Happy with this take?
        </h2>
        <p className="mt-[7px] text-center text-[13.5px] text-onDarkSoft/60">
          You&apos;ve got all the time in the world to nail it.
        </p>

        {/* Scrubber. */}
        <div className="mt-5 flex items-center gap-[10px]">
          <span className="text-[11px] tabular-nums text-onDarkSoft/55">
            {formatTime(current)}
          </span>
          <div className="relative h-1 flex-1 rounded-full bg-white/[0.18]">
            <div
              className="h-full rounded-full bg-grad-progress"
              style={{ width: `${Math.min(progress, 1) * 100}%` }}
            />
            <span
              className="absolute top-1/2 h-[13px] w-[13px] -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(240,87,127,0.7)]"
              style={{ left: `${Math.min(progress, 1) * 100}%` }}
            />
          </div>
          <span className="text-[11px] tabular-nums text-onDarkSoft/55">
            {formatTime(total)}
          </span>
        </div>

        {/* Decision buttons. */}
        <div className="mt-[22px] flex gap-3">
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={onRetake}
            disabled={submitting}
          >
            <RotateArrow className="h-4 w-4" />
            Re-record
          </Button>
          <Button
            size="lg"
            className="flex-[1.3]"
            onClick={onSubmit}
            loading={submitting}
          >
            <Check className="h-[17px] w-[17px]" />
            Looks good
          </Button>
        </div>
      </div>
    </div>
  );
}
