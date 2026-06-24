"use client";

import { useEffect, useState } from "react";
import { useRecordingStore } from "@/store/recordingStore";
import { useVideoRecorder } from "@/hooks/useVideoRecorder";
import { useRecordingTimer } from "@/hooks/useRecordingTimer";
import { usePromptSequence } from "@/hooks/usePromptSequence";
import { CountdownOverlay } from "@/components/recording/CountdownOverlay";
import { PrepChecklist } from "@/components/recording/PrepChecklist";
import { RecordingTimer } from "@/components/recording/RecordingTimer";
import { PromptOverlay } from "@/components/recording/PromptOverlay";
import { FilterPicker } from "@/components/recording/FilterPicker";
import { EmojiOverlay } from "@/components/recording/EmojiOverlay";
import { PermissionGuide } from "@/components/recording/PermissionGuide";
import { EncouragementBurst } from "@/components/recording/EncouragementBurst";
import { Button } from "@/components/ui/Button";

type SubPhase = "setup" | "prep" | "countdown" | "recording" | "celebrating";

/** Full-screen camera view that runs the record lifecycle end to end. */
export function RecordingScreen({
  onRecorded,
}: {
  onRecorded: (blob: Blob) => void;
}) {
  const {
    prompts,
    activeFilter,
    emojis,
    setFilter,
    addEmoji,
    moveEmoji,
    removeEmoji,
  } = useRecordingStore();

  const recorder = useVideoRecorder({ filter: activeFilter, emojis });
  const [sub, setSub] = useState<SubPhase>("setup");

  const isRecording = sub === "recording";
  const timer = useRecordingTimer({
    active: isRecording,
    onComplete: () => recorder.stop(),
  });
  const { currentIndex, current } = usePromptSequence(prompts, timer.elapsed);

  // Acquire the camera on mount.
  useEffect(() => {
    void recorder.requestPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the recorder finishes, celebrate then hand the blob upward.
  useEffect(() => {
    if (recorder.status === "stopped" && recorder.blob) {
      setSub("celebrating");
      const blob = recorder.blob;
      const t = setTimeout(() => onRecorded(blob), 1100);
      return () => clearTimeout(t);
    }
  }, [recorder.status, recorder.blob, onRecorded]);

  function startRecording() {
    recorder.start();
    setSub("recording");
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      {/* Filtered + emoji-composited live preview (mirrored). */}
      <canvas
        ref={recorder.canvasRef}
        className="h-full w-full -scale-x-100 object-cover"
      />

      <PermissionGuide
        open={recorder.status === "denied"}
        onRetry={() => recorder.requestPermissions()}
      />

      {/* Top bar while recording. */}
      {isRecording && (
        <div className="absolute inset-x-0 top-0 p-4 pt-safe">
          <RecordingTimer
            elapsed={timer.elapsed}
            isWarning={timer.isWarning}
            promptIndex={currentIndex}
            promptCount={prompts.length}
          />
        </div>
      )}

      {/* Prompt overlay (lower third, near camera). */}
      {isRecording && current && (
        <div className="absolute inset-x-0 bottom-44 px-5">
          <PromptOverlay prompt={current} />
        </div>
      )}

      {/* Emoji stickers layer + draggable handles (setup only). */}
      {recorder.status === "ready" && sub === "setup" && (
        <EmojiOverlay
          emojis={emojis}
          onAdd={addEmoji}
          onMove={moveEmoji}
          onRemove={removeEmoji}
        />
      )}

      {/* Setup controls: pick filter/emoji, then continue to prep. */}
      {recorder.status === "ready" && sub === "setup" && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 pb-safe">
          <FilterPicker active={activeFilter} onChange={setFilter} />
          <Button size="lg" className="w-full" onClick={() => setSub("prep")}>
            Continuar
          </Button>
        </div>
      )}

      {/* Stop button while recording. */}
      {isRecording && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center p-5 pb-safe">
          <button
            type="button"
            aria-label="Parar gravação"
            onClick={() => recorder.stop()}
            className="grid h-20 w-20 place-items-center rounded-full border-4 border-white"
          >
            <span className="h-7 w-7 rounded-md bg-brand-pink" />
          </button>
        </div>
      )}

      {/* Prep checklist before the countdown. */}
      {sub === "prep" && recorder.status === "ready" && (
        <PrepChecklist onReady={() => setSub("countdown")} />
      )}

      {sub === "countdown" && (
        <CountdownOverlay onComplete={startRecording} />
      )}

      {sub === "celebrating" && <EncouragementBurst />}
    </div>
  );
}
