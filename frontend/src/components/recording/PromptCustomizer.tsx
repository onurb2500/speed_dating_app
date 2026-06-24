"use client";

import { useRecordingStore } from "@/store/recordingStore";
import { renderPromptText } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

/**
 * Pre-recording screen: each base prompt has editable fill-in-the-blank
 * tokens with suggestion chips and a live preview of the final sentence.
 */
export function PromptCustomizer({
  onConfirm,
}: {
  onConfirm: () => void;
}) {
  const prompts = useRecordingStore((s) => s.prompts);
  const updateTokenValue = useRecordingStore((s) => s.updateTokenValue);

  return (
    <div className="flex h-dvh flex-col gap-6 overflow-y-auto px-5 py-8 pt-safe">
      <header>
        <h1 className="text-2xl font-bold">Personalize seus prompts ✍️</h1>
        <p className="mt-1 text-sm text-muted">
          Deixe suas respostas com a sua cara. A Minie de tênis e sarada &gt; a
          Minie genérica.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {prompts.map((prompt) => (
          <section key={prompt.id} className="rounded-2xl bg-surface p-4">
            <p className="text-sm text-brand-cyan">
              {prompt.toneBadgeIcon} {prompt.toneHint}
            </p>

            <div className="mt-3 flex flex-col gap-3">
              {prompt.tokens.map((token, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                  <input
                    aria-label={`Editar ${token.placeholder}`}
                    className="auth-input"
                    value={token.value}
                    onChange={(e) =>
                      updateTokenValue(prompt.id, index, e.target.value)
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    {token.suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateTokenValue(prompt.id, index, s)}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 rounded-xl bg-black/40 p-3 text-sm italic text-white">
              “{renderPromptText(prompt)}”
            </p>
          </section>
        ))}
      </div>

      <Button size="lg" className="w-full" onClick={onConfirm}>
        Tudo pronto, gravar!
      </Button>
    </div>
  );
}
