import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  // Primary CTA — coral→rose gradient pill.
  primary: "bg-grad-cta text-white shadow-cta",
  // Light-surface secondary.
  secondary: "bg-[rgba(240,87,127,0.08)] text-ink border border-accent-rose/40",
  // Over-video translucent ghost.
  ghost:
    "bg-white/[0.07] text-onDarkSoft border border-white/[0.18] backdrop-blur-sm",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15.5px]",
  lg: "h-[58px] px-6 text-[16px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, children, disabled, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.2px] transition-[transform,opacity] active:scale-[0.98]",
        "min-h-[44px] disabled:opacity-50 disabled:pointer-events-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-rose",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner className="h-5 w-5" /> : children}
    </button>
  ),
);

Button.displayName = "Button";
