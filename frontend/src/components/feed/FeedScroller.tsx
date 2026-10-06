"use client";

import { useEffect, useRef, useState } from "react";
import { FeedItem } from "@/types";
import { VideoCard } from "@/components/feed/VideoCard";
import { ChevronUp } from "@/components/ui/icons";

interface FeedScrollerProps {
  videos: FeedItem[];
  onOpenComments: (videoId: string) => void;
  onWatched: (videoId: string) => void;
  onNearEnd: () => void;
}

/**
 * Vertical snap-scroll container. Uses an IntersectionObserver to detect the
 * active (most-visible) card and to trigger pagination near the end.
 */
export function FeedScroller({
  videos,
  onOpenComments,
  onWatched,
  onNearEnd,
}: FeedScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [advanced, setAdvanced] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(
              (entry.target as HTMLElement).dataset.index ?? 0,
            );
            setActiveIndex(index);
            if (index > 0) setAdvanced(true);
            if (index >= videos.length - 2) onNearEnd();
          }
        }
      },
      { root: container, threshold: 0.6 },
    );

    const cards = container.querySelectorAll("[data-index]");
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [videos.length, onNearEnd]);

  return (
    <div
      ref={containerRef}
      className="h-dvh w-full snap-y-mandatory overflow-y-scroll no-scrollbar"
    >
      {videos.map((video, index) => (
        <div key={video.videoId} data-index={index}>
          <VideoCard
            video={video}
            isActive={index === activeIndex}
            // Only the active card and its immediate neighbors mount a real
            // player; the rest show a poster. This caps the number of live
            // hls.js/MediaSource instances and avoids buffer-append races.
            isNear={Math.abs(index - activeIndex) <= 1}
            onOpenComments={onOpenComments}
            onWatched={onWatched}
          />
        </div>
      ))}

      {/* Swipe hint — hides after the first advance. */}
      {!advanced && videos.length > 1 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[58px] z-30 flex animate-bob-fast flex-col items-center gap-[3px]">
          <ChevronUp className="h-[18px] w-[18px] text-white/70" />
          <span className="text-[11px] uppercase tracking-[1px] text-white/65">
            swipe for next
          </span>
        </div>
      )}
    </div>
  );
}
