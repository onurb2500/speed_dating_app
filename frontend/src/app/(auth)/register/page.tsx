"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthForm, AuthFormValues } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { CanvasScreen } from "@/components/ui/CanvasScreen";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();

  async function handleSubmit(values: AuthFormValues) {
    const ok = await register(values);
    if (ok) router.replace("/profile-setup");
  }

  return (
    <CanvasScreen variant="auth">
      <span className="font-display text-[26px] font-semibold italic tracking-[0.5px] text-ink">
        Sway
      </span>
      <h1 className="mt-[26px] font-display text-[46px] font-medium italic leading-[0.98] text-ink">
        Make your
        <br />
        entrance
      </h1>
      <p className="mt-[14px] max-w-[280px] text-[15px] leading-[1.5] text-ink/55">
        A name, a face — that&apos;s all it takes before the camera rolls.
      </p>

      <div className="mt-[26px] flex flex-1 flex-col">
        <AuthForm
          mode="register"
          loading={loading}
          error={error}
          submitLabel="Start swaying"
          onSubmit={handleSubmit}
          footer={
            <>
              Already swaying?{" "}
              <Link href="/login" className="font-medium text-accent-rose">
                Log in
              </Link>
            </>
          }
        />
      </div>
    </CanvasScreen>
  );
}
