"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";

const baseSchema = {
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres"),
};

const loginSchema = z.object(baseSchema);
const registerSchema = z.object({
  ...baseSchema,
  displayName: z.string().min(1, "Informe um nome"),
});

export type AuthFormValues = z.infer<typeof registerSchema>;

interface AuthFormProps {
  mode: "login" | "register";
  loading: boolean;
  error: string | null;
  onSubmit: (values: AuthFormValues) => void;
}

export function AuthForm({ mode, loading, error, onSubmit }: AuthFormProps) {
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
      className="flex flex-col gap-4"
      noValidate
    >
      {isRegister && (
        <Field label="Nome" error={errors.displayName?.message}>
          <input
            type="text"
            autoComplete="name"
            aria-label="Nome"
            className="auth-input"
            {...register("displayName")}
          />
        </Field>
      )}

      <Field label="Email" error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          aria-label="Email"
          className="auth-input"
          {...register("email")}
        />
      </Field>

      <Field label="Senha" error={errors.password?.message}>
        <input
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          aria-label="Senha"
          className="auth-input"
          {...register("password")}
        />
      </Field>

      {error && (
        <p role="alert" className="text-sm text-brand-pink">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
        {isRegister ? "Criar conta" : "Entrar"}
      </Button>
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
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-muted">{label}</span>
      {children}
      {error && <span className="text-xs text-brand-pink">{error}</span>}
    </label>
  );
}
