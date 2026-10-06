"use client";

import { useEffect, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import { Volume2, VolumeX } from "lucide-react";
import { FeedItem } from "@/types";
import { LikeButton } from "@/components/feed/LikeButton";
import { ProgressBar } from "@/components/feed/ProgressBar";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { formatCount } from "@/lib/utils";
import { CommentBubble, Plus } from "@/components/ui/icons";

interface VideoCardProps {
  video: FeedItem;
  isActive: boolean;
  /** Whether to mount a real player (active ± 1) vs. just a poster image. */
  isNear: boolean;
  onOpenComments: (videoId: string) => void;
  onWatched: (videoId: string) => void;
}

/** A single full-screen video in the feed (autoplay muted, unmute on tap). */
export function VideoCard({
  video,
  isActive,
  isNear,
  onOpenComments,
  onWatched,
}: VideoCardProps) {
  const playerRef = useRef<MuxPlayerElement>(null);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  // Play only the active card; pause and reset others.
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isActive) {
      onWatched(video.videoId);
      void player.play?.().catch(() => undefined);
    } else {
      player.pause?.();
      player.currentTime = 0;
    }
  }, [isActive, isNear, video.videoId, onWatched]);

  const poster = (
    <div
      className="h-full w-full bg-cover bg-center"
      style={{
        backgroundImage: `url(https://image.mux.com/${video.playbackId}/thumbnail.webp?width=720)`,
      }}
    />
  );

  return (
    <section className="relative h-dvh w-full snap-start overflow-hidden bg-videoInk-b">
      {isNear ? (
        <ClientOnly fallback={poster}>
          <MuxPlayer
            ref={playerRef}
            playbackId={video.playbackId}
            streamType="on-demand"
            loop
            muted={muted}
            autoPlay={isActive ? "muted" : false}
            playsInline
            nohotkeys
            style={{ height: "100%", width: "100%" }}
            onTimeUpdate={(e) => {
              const el = e.currentTarget as unknown as MuxPlayerElement;
              if (el.duration) setProgress((el.currentTime ?? 0) / el.duration);
            }}
          />
        </ClientOnly>
      ) : (
        poster
      )}

      {/* Readability scrim over the video. */}
      <div className="scrim pointer-events-none absolute inset-0 z-10" aria-hidden />

      <ProgressBar progress={progress} />

      {/* Brand. */}
      <p className="absolute inset-x-0 top-[80px] z-20 text-center font-display text-[19px] font-semibold italic text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">
        Sway
      </p>

      {/* Tap to toggle sound. */}
      <button
        type="button"
        aria-label={muted ? "Unmute" : "Mute"}
        onClick={() => setMuted((m) => !m)}
        className="absolute inset-0 z-10"
      >
        <span className="glass absolute right-[18px] top-[110px] grid h-9 w-9 place-items-center rounded-full">
          {muted ? (
            <VolumeX className="h-[18px] w-[18px] text-onDarkSoft" />
          ) : (
            <Volume2 className="h-[18px] w-[18px] text-onDarkSoft" />
          )}
        </span>
      </button>

      {/* Right action rail. */}
      <div className="absolute bottom-[118px] right-[14px] z-20 flex flex-col items-center gap-[22px]">
        {/* Avatar + follow. */}
        <div className="relative [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.4))]">
          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-grad-avatar">
            {video.user.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.user.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <span
            aria-hidden
            className="absolute -bottom-[7px] left-1/2 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full border-2 border-videoInk-b bg-accent-rose"
          >
            <Plus className="h-3 w-3 text-white" />
          </span>
        </div>

        <LikeButton video={video} />

        <button
          type="button"
          aria-label="Open comments"
          onClick={() => onOpenComments(video.videoId)}
          className="flex flex-col items-center gap-[5px] [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.4))]"
        >
          <CommentBubble className="h-[31px] w-[31px] text-white" />
          <span className="text-[12.5px] font-semibold text-white">
            {formatCount(video.commentCount)}
          </span>
        </button>
      </div>

      {/* Caption. */}
      <div className="absolute bottom-[120px] left-5 right-[84px] z-20">
        <p className="font-display text-[25px] font-semibold italic text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
          {video.user.displayName}
        </p>
      </div>
    </section>
  );
}
