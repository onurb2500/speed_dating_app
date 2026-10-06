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
      <div className="flex h-dvh items-center justify-center bg-videoInk-b">
        <Spinner className="h-8 w-8 text-accent-rose" />
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
        aria-label="Record video"
        className="glass absolute left-[18px] top-[110px] z-30 grid h-9 w-9 place-items-center rounded-full"
      >
        <Video className="h-[18px] w-[18px] text-onDarkSoft" />
      </Link>

      <CommentsDrawer
        videoId={commentsVideoId}
        open={commentsVideoId !== null}
        onClose={() => setCommentsVideoId(null)}
      />
    </div>
  );
}
