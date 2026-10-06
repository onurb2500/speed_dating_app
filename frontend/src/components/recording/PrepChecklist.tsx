"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Check } from "@/components/ui/icons";

const ITEMS = ["Good light", "Soft smile", "Breathe"];

/** Pre-countdown animated checklist to lower anxiety before recording. */
export function PrepChecklist({ onReady }: { onReady: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-7 bg-[rgba(10,4,6,0.6)] px-8 text-center backdrop-blur-sm">
      <h2 className="font-display text-[34px] font-medium italic text-white">
        Ready to shine?
      </h2>
      <ul className="flex flex-col gap-3">
        {ITEMS.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.4 }}
            className="flex items-center gap-2 text-[17px] text-onDarkSoft"
          >
            <Check className="h-[18px] w-[18px] text-accent-rose" />
            {item}
          </motion.li>
        ))}
      </ul>
      <Button size="lg" className="px-8" onClick={onReady}>
        I&apos;m ready
      </Button>
    </div>
  );
}
