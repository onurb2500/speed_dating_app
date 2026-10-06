"use client";

import { FeedItem } from "@/types";
import { useLike } from "@/hooks/useLike";
import { formatCount, cn } from "@/lib/utils";
import { Heart } from "@/components/ui/icons";

export function LikeButton({ video }: { video: FeedItem }) {
  const { toggle } = useLike();
  return (
    <button
      type="button"
      aria-label={video.liked ? "Unlike" : "Like"}
      aria-pressed={video.liked}
      onClick={() => toggle(video)}
      className="flex flex-col items-center gap-[5px] [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.4))]"
    >
      <Heart
        className={cn(
          "h-8 w-8 transition-transform",
          video.liked ? "animate-heart-pop text-accent-hot" : "text-white/85",
        )}
      />
      <span className="text-[12.5px] font-semibold text-white">
        {formatCount(video.likeCount)}
      </span>
    </button>
  );
}
