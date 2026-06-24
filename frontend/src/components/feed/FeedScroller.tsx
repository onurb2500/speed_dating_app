"use client";

import { useEffect, useRef, useState } from "react";
import { FeedItem } from "@/types";
import { VideoCard } from "@/components/feed/VideoCard";

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
    </div>
  );
}
