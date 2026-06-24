"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Prompt } from "@/types";
import { renderPromptText } from "@/lib/utils";
import { PoseGuide } from "@/components/recording/PoseGuide";
import { ToneIndicator } from "@/components/recording/ToneIndicator";

/**
 * On-screen prompt text shown large near the camera, with a fade transition
 * between prompts plus pose + tone hints (anti-shame assistance).
 */
export function PromptOverlay({ prompt }: { prompt: Prompt }) {
  return (
    <div className="pointer-events-none flex flex-col items-center gap-4 text-center">
      <PoseGuide hint={prompt.poseHint} promptId={prompt.id} />

      <AnimatePresence mode="wait">
        <motion.p
          key={prompt.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="max-w-md text-balance text-2xl font-bold leading-snug text-white drop-shadow-lg"
        >
          🗣 “{renderPromptText(prompt)}”
        </motion.p>
      </AnimatePresence>

      <ToneIndicator hint={prompt.toneHint} icon={prompt.toneBadgeIcon} />
    </div>
  );
}
