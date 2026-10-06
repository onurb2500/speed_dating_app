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
import { PoseGuide } from "@/components/recording/PoseGuide";
import { FilterPicker } from "@/components/recording/FilterPicker";
import { EmojiOverlay } from "@/components/recording/EmojiOverlay";
import { PermissionGuide } from "@/components/recording/PermissionGuide";
import { EncouragementBurst } from "@/components/recording/EncouragementBurst";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Aperture, CameraRotate, Smiley } from "@/components/ui/icons";

type SubPhase = "setup" | "prep" | "countdown" | "recording" | "celebrating";
type Tool = "filter" | "emoji" | "text";

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
  const [tool, setTool] = useState<Tool>("emoji");

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

  const ready = recorder.status === "ready";

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-videoInk-a">
      {/* Filtered + emoji-composited live preview (mirrored). */}
      <canvas
        ref={recorder.canvasRef}
        className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
      />
      {/* Camera overlays: grain + vignette for warmth and legibility. */}
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />
      <div className="vignette pointer-events-none absolute inset-0" aria-hidden />

      <PermissionGuide
        open={recorder.status === "denied"}
        onRetry={() => recorder.requestPermissions()}
      />

      {/* ── Recording overlays ─────────────────────────────── */}
      {isRecording && (
        <>
          {/* Glass top bar. */}
          <div className="absolute inset-x-[18px] top-[66px]">
            <RecordingTimer
              elapsed={timer.elapsed}
              isWarning={timer.isWarning}
              promptIndex={currentIndex}
              promptCount={prompts.length}
            />
          </div>

          {/* Segment bar. */}
          <div className="absolute inset-x-[18px] top-[114px] flex gap-[6px]">
            {prompts.map((p, i) => (
              <span
                key={p.id}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i === currentIndex
                    ? "bg-grad-progress shadow-glow-segment"
                    : "bg-white/[0.18]",
                )}
              />
            ))}
          </div>

          {/* Pose hint. */}
          {current && (
            <div className="absolute left-1/2 top-[150px] -translate-x-1/2">
              <PoseGuide hint={current.poseHint} promptId={current.id} />
            </div>
          )}

          {/* Spoken prompt + tone. */}
          {current && (
            <div className="absolute inset-x-[26px] bottom-[188px]">
              <PromptOverlay prompt={current} />
            </div>
          )}

          {/* Controls row. */}
          <div className="absolute inset-x-0 bottom-[62px] flex items-center justify-center gap-[46px]">
            <button
              type="button"
              aria-label="Flip camera"
              className="glass-light grid h-[46px] w-[46px] place-items-center rounded-full"
            >
              <CameraRotate className="h-[22px] w-[22px] text-onDarkSoft" />
            </button>

            <button
              type="button"
              aria-label="Stop recording"
              onClick={() => recorder.stop()}
              className="relative grid h-20 w-20 place-items-center"
            >
              <span className="absolute inset-0 animate-ringOut rounded-full border-2 border-accent-rose/60" />
              <span className="grid h-20 w-20 place-items-center rounded-full border-4 border-white">
                <span className="h-[30px] w-[30px] rounded-square bg-grad-chip" />
              </span>
            </button>

            <span
              aria-hidden
              className="glass-light h-[46px] w-[46px] rounded-sticker bg-[linear-gradient(135deg,#3c1c24,#f5714a)]"
            />
          </div>
        </>
      )}

      {/* ── Setup overlays (filters + emoji tooling) ───────── */}
      {ready && sub === "setup" && (
        <>
          {/* Tool rail. */}
          <div className="absolute right-[18px] top-[66px] flex flex-col gap-3">
            <ToolButton
              label="Filters"
              active={tool === "filter"}
              onClick={() => setTool("filter")}
            >
              <Aperture className="h-5 w-5 text-onDarkSoft" />
            </ToolButton>
            <ToolButton
              label="Emoji"
              active={tool === "emoji"}
              onClick={() => setTool("emoji")}
            >
              <Smiley
                className={cn(
                  "h-5 w-5",
                  tool === "emoji" ? "text-white" : "text-onDarkSoft",
                )}
              />
            </ToolButton>
            <ToolButton
              label="Text"
              active={tool === "text"}
              onClick={() => setTool("text")}
            >
              <span className="font-display text-[20px] font-bold italic text-onDarkSoft">
                T
              </span>
            </ToolButton>
          </div>

          <EmojiOverlay
            emojis={emojis}
            showPalette={false}
            onAdd={addEmoji}
            onMove={moveEmoji}
            onRemove={removeEmoji}
          />

          {/* Bottom panel: palette / carousel + continue. */}
          <div className="absolute inset-x-0 bottom-[46px] flex flex-col gap-[18px] px-4">
            {tool === "emoji" && (
              <EmojiOverlay
                emojis={emojis}
                showPalette
                onAdd={addEmoji}
                onMove={moveEmoji}
                onRemove={removeEmoji}
              />
            )}
            {tool === "filter" && (
              <FilterPicker active={activeFilter} onChange={setFilter} />
            )}
            <Button size="lg" className="w-full" onClick={() => setSub("prep")}>
              Continue
            </Button>
          </div>
        </>
      )}

      {/* Prep checklist before the countdown. */}
      {sub === "prep" && ready && (
        <PrepChecklist onReady={() => setSub("countdown")} />
      )}

      {sub === "countdown" && <CountdownOverlay onComplete={startRecording} />}

      {sub === "celebrating" && <EncouragementBurst />}
    </div>
  );
}

function ToolButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "grid h-11 w-11 place-items-center rounded-full",
        active
          ? "border border-white/30 bg-grad-chip shadow-chip"
          : "glass",
      )}
    >
      {children}
    </button>
  );
}
