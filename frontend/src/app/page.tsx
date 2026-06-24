"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export default function LandingPage() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/record");
    }
  }, [status, router]);

  if (status === "idle" || status === "loading") {
    return (
      <main className="flex h-dvh items-center justify-center">
        <Spinner className="h-8 w-8" />
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-8 px-8 text-center">
      <div>
        <h1 className="text-4xl font-extrabold">
          Speed <span className="text-brand-pink">Dating</span>
        </h1>
        <p className="mt-3 text-muted">
          Conexões reais em vídeos de 45 segundos. Sem pressão, só você sendo
          você. ❤️
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link href="/register" className="w-full">
          <Button size="lg" className="w-full">
            Começar
          </Button>
        </Link>
        <Link href="/login" className="w-full">
          <Button size="lg" variant="secondary" className="w-full">
            Já tenho conta
          </Button>
        </Link>
      </div>
    </main>
  );
}
