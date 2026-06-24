"use client";

import { Heart } from "lucide-react";
import { FeedItem } from "@/types";
import { useLike } from "@/hooks/useLike";
import { formatCount } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function LikeButton({ video }: { video: FeedItem }) {
  const { toggle } = useLike();
  return (
    <button
      type="button"
      aria-label={video.liked ? "Remover curtida" : "Curtir"}
      aria-pressed={video.liked}
      onClick={() => toggle(video)}
      className="flex flex-col items-center gap-1"
    >
      <Heart
        className={cn(
          "h-9 w-9 transition-transform",
          video.liked
            ? "fill-brand-pink text-brand-pink animate-heart-pop"
            : "text-white",
        )}
      />
      <span className="text-xs font-medium text-white">
        {formatCount(video.likeCount)}
      </span>
    </button>
  );
}
