import { cn } from "@/lib/utils";

type BlobTone = "rose" | "coral";

interface BlobProps {
  tone?: BlobTone;
  className?: string;
}

/**
 * Decorative, low-alpha, blurred ambient blob for light creation surfaces.
 * Position + size are provided by the caller via `className`.
 */
export function Blob({ tone = "rose", className }: BlobProps) {
  const fill =
    tone === "rose"
      ? "radial-gradient(circle, rgba(240,87,127,0.22), transparent 70%)"
      : "radial-gradient(circle, rgba(245,113,74,0.22), transparent 70%)";
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute rounded-full blur-[20px]",
        tone === "rose" ? "animate-swayBlob" : "animate-swayBlob2",
        className,
      )}
      style={{ background: fill }}
    />
  );
}
