"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkle } from "@/components/ui/icons";

/**
 * Pose suggestion shown as a bobbing glass pill for the first ~2.5s of each
 * prompt, then fades — nudges without distracting.
 */
export function PoseGuide({
  hint,
  promptId,
}: {
  hint: string;
  promptId: number;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(t);
  }, [promptId]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="glass flex animate-bob-slow items-center gap-[9px] rounded-full px-4 py-[9px]"
        >
          <Sparkle className="h-4 w-4 text-onDarkBlush" />
          <span className="text-[13.5px] text-onDarkSoft">{hint}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
