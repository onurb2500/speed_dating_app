"use client";

import { motion } from "framer-motion";

/** Positive micro-animation shown right after recording stops. */
export function EncouragementBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 1.1 }}
        className="text-7xl"
      >
        💖
      </motion.div>
    </div>
  );
}
