"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function EmptyFeedState() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-6 bg-videoInk-b px-8 text-center">
      <span className="text-5xl">✨</span>
      <div>
        <h2 className="font-display text-[30px] font-medium italic text-white">
          Be the first!
        </h2>
        <p className="mt-2 text-sm text-onDarkSoft/60">
          Your video is awaiting its first match. Check back soon for new faces.
        </p>
      </div>
      <Link href="/record">
        <Button size="lg" className="px-7">
          Record my video
        </Button>
      </Link>
    </div>
  );
}
