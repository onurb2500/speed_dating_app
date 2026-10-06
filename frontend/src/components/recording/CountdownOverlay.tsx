"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTDOWN_SECONDS } from "@/lib/constants";

/** 3-2-1 countdown animation; calls onComplete when it reaches zero. */
export function CountdownOverlay({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onComplete]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(10,4,6,0.45)] backdrop-blur-[2px]">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.6, opacity: 0 }}
          className="font-display text-[150px] font-medium italic leading-none text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.5)]"
        >
          {count > 0 ? count : "✨"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
