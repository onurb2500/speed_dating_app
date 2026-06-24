"use client";

import { useEffect, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import { MessageCircle, Volume2, VolumeX } from "lucide-react";
import { FeedItem } from "@/types";
import { LikeButton } from "@/components/feed/LikeButton";
import { ProgressBar } from "@/components/feed/ProgressBar";
import { formatCount } from "@/lib/utils";

interface VideoCardProps {
  video: FeedItem;
  isActive: boolean;
  onOpenComments: (videoId: string) => void;
  onWatched: (videoId: string) => void;
}

/** A single full-screen video in the feed (autoplay muted, unmute on tap). */
export function VideoCard({
  video,
  isActive,
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
  }, [isActive, video.videoId, onWatched]);

  return (
    <section className="relative h-dvh w-full snap-start bg-black">
      <ProgressBar progress={progress} />

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
          if (el.duration)
            setProgress((el.currentTime ?? 0) / el.duration);
        }}
      />

      {/* Tap to toggle sound. */}
      <button
        type="button"
        aria-label={muted ? "Ativar som" : "Silenciar"}
        onClick={() => setMuted((m) => !m)}
        className="absolute inset-0 z-10"
      >
        <span className="absolute right-4 top-20 rounded-full bg-black/40 p-2 pt-safe">
          {muted ? (
            <VolumeX className="h-5 w-5 text-white" />
          ) : (
            <Volume2 className="h-5 w-5 text-white" />
          )}
        </span>
      </button>

      {/* Right action rail. */}
      <div className="absolute bottom-28 right-3 z-20 flex flex-col items-center gap-5">
        <LikeButton video={video} />
        <button
          type="button"
          aria-label="Abrir comentários"
          onClick={() => onOpenComments(video.videoId)}
          className="flex flex-col items-center gap-1"
        >
          <MessageCircle className="h-9 w-9 text-white" />
          <span className="text-xs font-medium text-white">
            {formatCount(video.commentCount)}
          </span>
        </button>
      </div>

      {/* User info. */}
      <div className="absolute bottom-24 left-4 z-20 max-w-[70%]">
        <p className="text-base font-semibold text-white">
          @{video.user.displayName}
        </p>
      </div>
    </section>
  );
}
