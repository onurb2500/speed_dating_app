"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthForm, AuthFormValues } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { CanvasScreen } from "@/components/ui/CanvasScreen";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();

  async function handleSubmit(values: AuthFormValues) {
    const ok = await login({ email: values.email, password: values.password });
    if (ok) router.replace("/record");
  }

  return (
    <CanvasScreen variant="auth">
      <span className="font-display text-[26px] font-semibold italic tracking-[0.5px] text-ink">
        Sway
      </span>
      <h1 className="mt-[26px] font-display text-[46px] font-medium italic leading-[0.98] text-ink">
        Welcome
        <br />
        back
      </h1>
      <p className="mt-[14px] max-w-[280px] text-[15px] leading-[1.5] text-ink/55">
        Pick up right where the conversation left off.
      </p>

      <div className="mt-[26px] flex flex-1 flex-col">
        <AuthForm
          mode="login"
          loading={loading}
          error={error}
          submitLabel="Log in"
          onSubmit={handleSubmit}
          footer={
            <>
              New here?{" "}
              <Link href="/register" className="font-medium text-accent-rose">
                Start swaying
              </Link>
            </>
          }
        />
      </div>
    </CanvasScreen>
  );
}
