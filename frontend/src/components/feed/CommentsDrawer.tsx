"use client";

import { Drawer } from "@/components/ui/Drawer";
import { CommentInput } from "@/components/feed/CommentInput";
import { useComments } from "@/hooks/useComments";
import { Spinner } from "@/components/ui/Spinner";
import { timeAgo } from "@/lib/utils";

interface CommentsDrawerProps {
  videoId: string | null;
  open: boolean;
  onClose: () => void;
}

export function CommentsDrawer({ videoId, open, onClose }: CommentsDrawerProps) {
  const { comments, hasMore, loading, loadMore, post } = useComments(
    open ? videoId : null,
  );

  return (
    <Drawer open={open} onClose={onClose} title="Comentários">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-4">
          {comments.length === 0 && !loading && (
            <p className="py-8 text-center text-sm text-muted">
              Seja o primeiro a comentar 💬
            </p>
          )}
          <ul className="flex flex-col gap-4 py-2">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-white/10" />
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">{c.user.displayName}</span>{" "}
                    <span className="text-xs text-muted">
                      {timeAgo(c.createdAt)}
                    </span>
                  </p>
                  <p className="text-sm text-white/90">{c.text}</p>
                </div>
              </li>
            ))}
          </ul>
          {loading && (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          )}
          {hasMore && !loading && (
            <button
              type="button"
              onClick={loadMore}
              className="mx-auto my-3 block text-sm text-brand-cyan"
            >
              Ver mais
            </button>
          )}
        </div>
        <CommentInput onSend={post} />
      </div>
    </Drawer>
  );
}
