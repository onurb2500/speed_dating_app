import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Blob } from "./Blob";

type Variant = "auth" | "prompts";

const wash: Record<Variant, string> = {
  auth: "radial-gradient(120% 70% at 85% -8%, rgba(240,87,127,0.20), transparent 55%), radial-gradient(100% 60% at -15% 112%, rgba(245,113,74,0.18), transparent 55%), #fdfaf8",
  prompts:
    "radial-gradient(110% 60% at -10% -8%, rgba(240,87,127,0.18), transparent 55%), radial-gradient(110% 60% at 110% 108%, rgba(245,113,74,0.16), transparent 55%), #fdfaf8",
};

interface CanvasScreenProps {
  children: ReactNode;
  variant?: Variant;
  contentClassName?: string;
}

/**
 * Light creation surface (Sign-up, Prompts). Renders the warm canvas, an ambient
 * gradient wash and a floating animated blob; lays out content as a flex column.
 */
export function CanvasScreen({
  children,
  variant = "auth",
  contentClassName,
}: CanvasScreenProps) {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-canvas text-ink">
      <div aria-hidden className="absolute inset-0" style={{ background: wash[variant] }} />
      {variant === "auth" ? (
        <Blob tone="rose" className="-right-[90px] -top-[90px] h-[300px] w-[300px]" />
      ) : (
        <Blob tone="coral" className="-bottom-[80px] -left-[70px] h-[260px] w-[260px]" />
      )}
      <div
        className={cn(
          "relative flex h-full flex-col px-[30px] pb-[30px] pt-[78px]",
          contentClassName,
        )}
      >
        {children}
      </div>
    </main>
  );
}
