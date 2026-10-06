"use client";

import { useState } from "react";
import { COMMENT_MAX_LENGTH } from "@/lib/constants";
import { Send } from "@/components/ui/icons";

export function CommentInput({
  onSend,
}: {
  onSend: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    try {
      await onSend(value);
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex items-center gap-2 border-t border-white/10 p-3 pb-safe">
      <input
        aria-label="Write a comment"
        className="h-11 flex-1 rounded-full border border-white/15 bg-white/[0.08] px-4 text-onDark outline-none transition-colors placeholder:text-onDarkSoft/45 focus:border-accent-rose"
        placeholder="Add a comment…"
        maxLength={COMMENT_MAX_LENGTH}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        type="button"
        aria-label="Send comment"
        onClick={handleSend}
        disabled={!text.trim() || sending}
        className="grid h-11 w-11 place-items-center rounded-full bg-grad-chip shadow-chip disabled:opacity-40 disabled:shadow-none"
      >
        <Send className="h-5 w-5 text-white" />
      </button>
    </div>
  );
}
