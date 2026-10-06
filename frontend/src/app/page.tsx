"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { CanvasScreen } from "@/components/ui/CanvasScreen";

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
      <main className="flex h-dvh items-center justify-center bg-canvas">
        <Spinner className="h-8 w-8 text-accent-rose" />
      </main>
    );
  }

  return (
    <CanvasScreen variant="auth">
      <span className="font-display text-[26px] font-semibold italic tracking-[0.5px] text-ink">
        Sway
      </span>

      <div className="mt-auto">
        <h1 className="font-display text-[46px] font-medium italic leading-[0.98] text-ink">
          Real connections,
          <br />
          45 seconds at a time.
        </h1>
        <p className="mt-[14px] max-w-[300px] text-[15px] leading-[1.5] text-ink/55">
          No pressure, no scripts — just you, on camera, being you.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <Link href="/register" className="w-full">
          <Button size="lg" className="w-full">
            Start swaying
          </Button>
        </Link>
        <Link href="/login" className="w-full">
          <Button size="lg" variant="secondary" className="w-full">
            I already have an account
          </Button>
        </Link>
      </div>
    </CanvasScreen>
  );
}
