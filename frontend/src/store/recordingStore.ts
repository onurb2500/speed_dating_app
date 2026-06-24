import { create } from "zustand";
import {
  RecordingPhase,
  Prompt,
  CameraFilter,
  EmojiSticker,
} from "@/types";
import { BASE_PROMPTS } from "@/lib/constants";

interface RecordingState {
  phase: RecordingPhase;
  prompts: Prompt[];
  currentPromptIndex: number;
  videoBlob: Blob | null;
  activeFilter: CameraFilter;
  emojis: EmojiSticker[];
  error: string | null;

  setPhase: (phase: RecordingPhase) => void;
  setPrompts: (prompts: Prompt[]) => void;
  updateTokenValue: (
    promptId: number,
    tokenIndex: number,
    value: string,
  ) => void;
  setCurrentPromptIndex: (index: number) => void;
  setVideoBlob: (blob: Blob | null) => void;
  setFilter: (filter: CameraFilter) => void;
  addEmoji: (emoji: string) => void;
  moveEmoji: (id: string, x: number, y: number) => void;
  removeEmoji: (id: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

function cloneBasePrompts(): Prompt[] {
  return BASE_PROMPTS.map((p) => ({
    ...p,
    tokens: p.tokens.map((t) => ({ ...t })),
  }));
}

export const useRecordingStore = create<RecordingState>((set) => ({
  phase: "idle",
  prompts: cloneBasePrompts(),
  currentPromptIndex: 0,
  videoBlob: null,
  activeFilter: "natural",
  emojis: [],
  error: null,

  setPhase: (phase) => set({ phase }),
  setPrompts: (prompts) => set({ prompts }),

  updateTokenValue: (promptId, tokenIndex, value) =>
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === promptId
          ? {
              ...p,
              tokens: p.tokens.map((t, i) =>
                i === tokenIndex ? { ...t, value } : t,
              ),
            }
          : p,
      ),
    })),

  setCurrentPromptIndex: (index) => set({ currentPromptIndex: index }),
  setVideoBlob: (blob) => set({ videoBlob: blob }),
  setFilter: (filter) => set({ activeFilter: filter }),

  addEmoji: (emoji) =>
    set((state) => ({
      emojis: [
        ...state.emojis,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          emoji,
          x: 0.5,
          y: 0.5,
        },
      ],
    })),

  moveEmoji: (id, x, y) =>
    set((state) => ({
      emojis: state.emojis.map((e) => (e.id === id ? { ...e, x, y } : e)),
    })),

  removeEmoji: (id) =>
    set((state) => ({ emojis: state.emojis.filter((e) => e.id !== id) })),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      phase: "idle",
      prompts: cloneBasePrompts(),
      currentPromptIndex: 0,
      videoBlob: null,
      activeFilter: "natural",
      emojis: [],
      error: null,
    }),
}));
