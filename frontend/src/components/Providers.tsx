"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { registerUnauthorizedHandler } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { nativeBridge } from "@/lib/nativeBridge";

/**
 * App-wide client providers: wires the API's unauthorized handler to the
 * auth store + router, and restores the session on first load.
 */
export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      clear();
      router.replace("/login");
    });
    void bootstrap();
  }, [bootstrap, clear, router]);

  // Notify the native shell (when present) of route changes.
  useEffect(() => {
    nativeBridge.notifyNavigation(pathname);
  }, [pathname]);

  return <>{children}</>;
}
