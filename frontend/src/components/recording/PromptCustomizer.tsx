"use client";

import { Fragment, useMemo, useState } from "react";
import { useRecordingStore } from "@/store/recordingStore";
import { Button } from "@/components/ui/Button";
import { CanvasScreen } from "@/components/ui/CanvasScreen";
import { ArrowRight } from "@/components/ui/icons";
import { Prompt } from "@/types";

type Segment =
  | { type: "text"; value: string }
  | { type: "token"; index: number };

/** Split a prompt's baseText into text + token segments for inline rendering. */
function toSegments(baseText: string): Segment[] {
  const segments: Segment[] = [];
  let tokenIndex = 0;
  let lastEnd = 0;
  const regex = /\[[^\]]+\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(baseText)) !== null) {
    if (match.index > lastEnd) {
      segments.push({ type: "text", value: baseText.slice(lastEnd, match.index) });
    }
    segments.push({ type: "token", index: tokenIndex });
    tokenIndex += 1;
    lastEnd = match.index + match[0].length;
  }
  if (lastEnd < baseText.length) {
    segments.push({ type: "text", value: baseText.slice(lastEnd) });
  }
  return segments;
}

/**
 * Pre-recording screen: fill-in-the-blank prompt cards. The active card shows
 * its tokens as gradient pills; tapping a token edits it inline with suggestions.
 */
export function PromptCustomizer({ onConfirm }: { onConfirm: () => void }) {
  const prompts = useRecordingStore((s) => s.prompts);
  const updateTokenValue = useRecordingStore((s) => s.updateTokenValue);
  const [activeId, setActiveId] = useState<number | null>(prompts[0]?.id ?? null);
  const [editing, setEditing] = useState<{ cardId: number; index: number } | null>(
    null,
  );

  return (
    <CanvasScreen variant="prompts">
      <h1 className="font-display text-[42px] font-medium italic leading-none text-ink">
        Make it yours
      </h1>
      <p className="mt-[12px] max-w-[300px] text-[14.5px] leading-[1.5] text-ink/55">
        Fill in the blanks. The little details make people grin.
      </p>

      <div className="mt-[24px] flex flex-col gap-[14px]">
        {prompts.map((prompt, i) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            index={i + 1}
            active={activeId === prompt.id}
            editing={editing?.cardId === prompt.id ? editing.index : null}
            onActivate={() => setActiveId(prompt.id)}
            onEditToken={(index) => {
              setActiveId(prompt.id);
              setEditing({ cardId: prompt.id, index });
            }}
            onChangeToken={(index, value) =>
              updateTokenValue(prompt.id, index, value)
            }
            onBlurToken={() => setEditing(null)}
          />
        ))}
      </div>

      <div className="flex-1" />

      <Button size="lg" className="w-full" onClick={onConfirm}>
        Looks good — let&apos;s record
        <ArrowRight className="h-[17px] w-[17px]" />
      </Button>
    </CanvasScreen>
  );
}

interface PromptCardProps {
  prompt: Prompt;
  index: number;
  active: boolean;
  editing: number | null;
  onActivate: () => void;
  onEditToken: (index: number) => void;
  onChangeToken: (index: number, value: string) => void;
  onBlurToken: () => void;
}

function PromptCard({
  prompt,
  index,
  active,
  editing,
  onActivate,
  onEditToken,
  onChangeToken,
  onBlurToken,
}: PromptCardProps) {
  const segments = useMemo(() => toSegments(prompt.baseText), [prompt.baseText]);
  const editingToken = editing !== null ? prompt.tokens[editing] : null;

  return (
    <section
      onClick={onActivate}
      className={
        active
          ? "rounded-card border-[1.5px] border-accent-rose/55 bg-[rgba(240,87,127,0.08)] p-[18px_18px_19px] shadow-card-glow"
          : "rounded-card border border-accent-rose/25 bg-white/90 p-[18px]"
      }
    >
      <p
        className={
          "mb-[9px] font-display text-[22px] font-semibold italic " +
          (active ? "text-accent-rose" : "text-ink/50")
        }
      >
        {String(index).padStart(2, "0")}
      </p>

      <p
        className={
          "text-[16px] leading-[1.7] " + (active ? "text-ink" : "text-ink2")
        }
      >
        {segments.map((seg, i) =>
          seg.type === "text" ? (
            <Fragment key={i}>{seg.value}</Fragment>
          ) : (
            <Token
              key={i}
              token={prompt.tokens[seg.index]}
              isEditing={editing === seg.index}
              onEdit={() => onEditToken(seg.index)}
              onChange={(value) => onChangeToken(seg.index, value)}
              onBlur={onBlurToken}
            />
          ),
        )}
      </p>

      {editingToken && editingToken.suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {editingToken.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChangeToken(editing as number, s);
              }}
              className="rounded-full border border-accent-rose/40 bg-[rgba(240,87,127,0.06)] px-3 py-1 text-[12.5px] text-ink/70"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function Token({
  token,
  isEditing,
  onEdit,
  onChange,
  onBlur,
}: {
  token: { value: string; placeholder: string };
  isEditing: boolean;
  onEdit: () => void;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const filled = token.value.trim().length > 0;

  if (isEditing) {
    return (
      <span className="inline-flex items-center align-middle">
        <input
          autoFocus
          aria-label={`Edit ${token.placeholder}`}
          value={token.value}
          size={Math.max(token.value.length, token.placeholder.length, 4)}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onClick={(e) => e.stopPropagation()}
          className="rounded-full bg-grad-pill px-[11px] py-[1px] text-[14.5px] font-medium text-white outline-none placeholder:text-white/70"
        />
        <span className="ml-[3px] inline-block h-[14px] w-[1.5px] -translate-y-[2px] animate-caretBlink bg-accent-rose align-middle" />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
      className={
        filled
          ? "inline-block rounded-full bg-grad-pill px-[11px] py-[1px] align-middle text-[14.5px] font-medium text-white"
          : "inline-block rounded-full border-[1.3px] border-dashed border-accent-rose/55 px-[13px] py-[1px] align-middle text-[13.5px] text-ink/50"
      }
    >
      {filled ? token.value : "tap to fill"}
    </button>
  );
}
