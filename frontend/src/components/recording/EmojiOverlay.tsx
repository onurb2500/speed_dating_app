"use client";

import { EMOJI_PALETTE } from "@/lib/constants";
import { EmojiSticker } from "@/types";
import { Close } from "@/components/ui/icons";

interface EmojiOverlayProps {
  emojis: EmojiSticker[];
  showPalette: boolean;
  onAdd: (emoji: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
}

/**
 * Draggable emoji stickers (dashed selection box + delete handle), plus the
 * palette row. Positions are stored as 0..1 fractions so they map onto the
 * recorded canvas regardless of display size.
 */
export function EmojiOverlay({
  emojis,
  showPalette,
  onAdd,
  onMove,
  onRemove,
}: EmojiOverlayProps) {
  function handleDrag(e: React.PointerEvent<HTMLElement>, id: string): void {
    const parent = e.currentTarget.closest("[data-sticker-canvas]");
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
      <div
        data-sticker-canvas
        className="pointer-events-none absolute inset-0"
      >
        {emojis.map((s) => (
          <div
            key={s.id}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }}
          >
            <div className="relative rounded-sticker border-[1.5px] border-dashed border-white/55 p-[6px]">
              <button
                type="button"
                aria-label={`Move emoji ${s.emoji}`}
                onPointerDown={(e) => handleDrag(e, s.id)}
                onDoubleClick={() => onRemove(s.id)}
                className="block text-[52px] leading-none [filter:drop-shadow(0_4px_10px_rgba(0,0,0,0.4))]"
              >
                {s.emoji}
              </button>
              <button
                type="button"
                aria-label={`Remove emoji ${s.emoji}`}
                onClick={() => onRemove(s.id)}
                className="absolute -right-2 -top-2 grid h-[18px] w-[18px] place-items-center rounded-full bg-white"
              >
                <Close className="h-[11px] w-[11px] text-[#f0527a]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Palette. */}
      {showPalette && (
        <div className="flex justify-between gap-2 px-1">
          {EMOJI_PALETTE.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Add ${emoji}`}
              onClick={() => onAdd(emoji)}
              className="text-[30px] leading-none transition-transform active:scale-90"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
