"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Prompt } from "@/types";
import { renderPromptText } from "@/lib/utils";
import { ToneIndicator } from "@/components/recording/ToneIndicator";

/**
 * The current spoken prompt shown large near the bottom of the camera, with a
 * fade transition between prompts and a tone chip.
 */
export function PromptOverlay({ prompt }: { prompt: Prompt }) {
  return (
    <div className="pointer-events-none flex flex-col items-center text-center">
      <p className="mb-3 text-[11px] uppercase tracking-[2px] text-onDarkSoft/50">
        Say it your way
      </p>

      <AnimatePresence mode="wait">
        <motion.p
          key={prompt.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="font-display text-[27px] font-medium italic leading-[1.28] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.5)]"
        >
          “{renderPromptText(prompt)}”
        </motion.p>
      </AnimatePresence>

      <div className="mt-4">
        <ToneIndicator hint={prompt.toneHint} icon={prompt.toneBadgeIcon} />
      </div>
    </div>
  );
}
