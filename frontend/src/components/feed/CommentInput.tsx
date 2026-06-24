"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { COMMENT_MAX_LENGTH } from "@/lib/constants";

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
        aria-label="Escrever comentário"
        className="auth-input h-11 flex-1"
        placeholder="Adicione um comentário…"
        maxLength={COMMENT_MAX_LENGTH}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        type="button"
        aria-label="Enviar comentário"
        onClick={handleSend}
        disabled={!text.trim() || sending}
        className="grid h-11 w-11 place-items-center rounded-full bg-brand-pink disabled:opacity-40"
      >
        <Send className="h-5 w-5 text-white" />
      </button>
    </div>
  );
}
