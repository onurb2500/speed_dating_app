"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function EmptyFeedState() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-6 px-8 text-center">
      <span className="text-5xl">💫</span>
      <div>
        <h2 className="text-xl font-bold">Seja o primeiro!</h2>
        <p className="mt-2 text-sm text-muted">
          Seu vídeo está esperando o primeiro match. Volte em breve para ver
          novas pessoas.
        </p>
      </div>
      <Link href="/record">
        <Button size="lg">Gravar meu vídeo</Button>
      </Link>
    </div>
  );
}
