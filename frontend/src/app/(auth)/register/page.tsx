"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthForm, AuthFormValues } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();

  async function handleSubmit(values: AuthFormValues) {
    const ok = await register(values);
    if (ok) router.replace("/profile-setup");
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Crie sua conta ✨</h1>
      <AuthForm
        mode="register"
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />
      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="text-brand-cyan">
          Entrar
        </Link>
      </p>
    </div>
  );
}
