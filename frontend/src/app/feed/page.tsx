"use client";

import { useState } from "react";
import Link from "next/link";
import { Video } from "lucide-react";
import { useFeed } from "@/hooks/useFeed";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { usePendingUploadSync } from "@/hooks/usePendingUploadSync";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { FeedScroller } from "@/components/feed/FeedScroller";
import { EmptyFeedState } from "@/components/feed/EmptyFeedState";
import { OfflineScreen } from "@/components/feed/OfflineScreen";
import { CommentsDrawer } from "@/components/feed/CommentsDrawer";
import { Spinner } from "@/components/ui/Spinner";

export default function FeedPage() {
  const { ready } = useRequireAuth();
  const online = useOnlineStatus();
  const { videos, isLoading, loadMore, markSeen } = useFeed();
  const [commentsVideoId, setCommentsVideoId] = useState<string | null>(null);

  // Auto-sync any videos recorded while offline.
  usePendingUploadSync();

  if (!ready || (isLoading && videos.length === 0)) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (videos.length === 0) {
    // Offline with an empty cache → cold-start offline screen.
    return online ? <EmptyFeedState /> : <OfflineScreen />;
  }

  return (
    <div className="relative">
      <FeedScroller
        videos={videos}
        onOpenComments={setCommentsVideoId}
        onWatched={markSeen}
        onNearEnd={loadMore}
      />

      {/* Record shortcut. */}
      <Link
        href="/record"
        aria-label="Gravar vídeo"
        className="absolute right-4 top-4 z-30 grid h-11 w-11 place-items-center rounded-full bg-brand-pink pt-safe"
      >
        <Video className="h-5 w-5 text-white" />
      </Link>

      <CommentsDrawer
        videoId={commentsVideoId}
        open={commentsVideoId !== null}
        onClose={() => setCommentsVideoId(null)}
      />
    </div>
  );
}
