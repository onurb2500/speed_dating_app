"use client";

import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const baseSchema = {
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
};

const loginSchema = z.object(baseSchema);
const registerSchema = z.object({
  ...baseSchema,
  displayName: z.string().min(1, "Tell us your name"),
});

export type AuthFormValues = z.infer<typeof registerSchema>;

interface AuthFormProps {
  mode: "login" | "register";
  loading: boolean;
  error: string | null;
  submitLabel: string;
  footer?: ReactNode;
  onSubmit: (values: AuthFormValues) => void;
}

export function AuthForm({
  mode,
  loading,
  error,
  submitLabel,
  footer,
  onSubmit,
}: AuthFormProps) {
  const isRegister = mode === "register";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-1 flex-col"
      noValidate
    >
      <div className="flex flex-col gap-[13px]">
        {isRegister && (
          <Field label="Display name" error={errors.displayName?.message}>
            <input
              type="text"
              autoComplete="name"
              aria-label="Display name"
              placeholder="Luna"
              className="sway-field"
              {...register("displayName")}
            />
          </Field>
        )}

        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            aria-label="Email"
            placeholder="luna@email.com"
            className="sway-field"
            {...register("email")}
          />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <input
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            aria-label="Password"
            placeholder="••••••••"
            className="sway-field tracking-[3px]"
            {...register("password")}
          />
        </Field>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[12px] text-accent-rose">
          {error}
        </p>
      )}

      <div className="flex-1" />

      <Button type="submit" size="lg" loading={loading} className="w-full">
        {submitLabel}
      </Button>

      {footer && (
        <p className="mt-4 text-center text-[13.5px] text-ink/50">{footer}</p>
      )}
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col">
      <span className="sway-eyebrow mb-[7px] pl-1">{label}</span>
      <div className={cn(error && "[&_input]:!border-accent-rose")}>
        {children}
      </div>
      {error && (
        <span className="mt-1.5 text-[12px] text-accent-rose">{error}</span>
      )}
    </label>
  );
}
