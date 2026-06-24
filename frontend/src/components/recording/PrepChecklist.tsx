"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const ITEMS = ["Iluminação", "Sorriso", "Respira fundo"];

/** Pre-countdown animated checklist to lower anxiety before recording. */
export function PrepChecklist({ onReady }: { onReady: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-black/60 px-8 text-center">
      <h2 className="text-xl font-semibold text-white">Pronto para brilhar?</h2>
      <ul className="flex flex-col gap-3">
        {ITEMS.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.4 }}
            className="text-lg text-white"
          >
            {item} ✓
          </motion.li>
        ))}
      </ul>
      <Button size="lg" onClick={onReady}>
        Estou pronto 🎬
      </Button>
    </div>
  );
}
