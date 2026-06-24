import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        "inline-block h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white",
        className,
      )}
    />
  );
}
