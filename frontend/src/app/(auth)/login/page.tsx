"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthForm, AuthFormValues } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();

  async function handleSubmit(values: AuthFormValues) {
    const ok = await login({ email: values.email, password: values.password });
    if (ok) router.replace("/record");
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Bem-vindo de volta 👋</h1>
      <AuthForm
        mode="login"
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />
      <p className="text-center text-sm text-muted">
        Não tem conta?{" "}
        <Link href="/register" className="text-brand-cyan">
          Criar agora
        </Link>
      </p>
    </div>
  );
}
