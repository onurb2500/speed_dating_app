"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Pose suggestion that fades in for the first ~2.5s of each prompt then fades
 * out, so it nudges without distracting.
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
          className="rounded-full bg-black/40 px-4 py-1.5 text-sm text-white backdrop-blur"
        >
          💡 {hint}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
