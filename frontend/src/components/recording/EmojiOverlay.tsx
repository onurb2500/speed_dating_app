"use client";

import { EMOJI_PALETTE } from "@/lib/constants";
import { EmojiSticker } from "@/types";

interface EmojiOverlayProps {
  emojis: EmojiSticker[];
  onAdd: (emoji: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
}

/**
 * Palette to add emoji stickers, plus draggable handles overlaid on the
 * preview. Positions are stored as 0..1 fractions so they map onto the
 * recorded canvas regardless of display size.
 */
export function EmojiOverlay({
  emojis,
  onAdd,
  onMove,
  onRemove,
}: EmojiOverlayProps) {
  function handleDrag(
    e: React.PointerEvent<HTMLButtonElement>,
    id: string,
  ): void {
    const parent = e.currentTarget.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const move = (ev: PointerEvent) => {
      const x = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (ev.clientY - rect.top) / rect.height));
      onMove(id, x, y);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <>
      {/* Draggable sticker layer over the preview. */}
      <div className="pointer-events-none absolute inset-0">
        {emojis.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Mover emoji ${s.emoji}`}
            onPointerDown={(e) => handleDrag(e, s.id)}
            onDoubleClick={() => onRemove(s.id)}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 text-4xl"
            style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }}
          >
            {s.emoji}
          </button>
        ))}
      </div>

      {/* Palette. */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {EMOJI_PALETTE.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`Adicionar ${emoji}`}
            onClick={() => onAdd(emoji)}
            className="min-h-[44px] shrink-0 rounded-full bg-white/10 px-3 text-2xl hover:bg-white/20"
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}
