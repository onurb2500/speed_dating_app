"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { User } from "@/types";

export default function ProfileSetupPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.patch<User>("/users/me", {
        displayName: displayName.trim(),
        avatarUrl: avatarUrl.trim() || null,
      });
      setUser(data);
      router.replace("/record");
    } catch (err) {
      setError(apiErrorMessage(err, "Não foi possível salvar o perfil"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-12 pt-safe">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Quase lá 🎬</h1>
          <p className="mt-1 text-sm text-muted">
            Como você quer aparecer para seus matches?
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">Nome de exibição</span>
          <input
            className="auth-input"
            aria-label="Nome de exibição"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">URL do avatar (opcional)</span>
          <input
            className="auth-input"
            aria-label="URL do avatar"
            placeholder="https://..."
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
        </label>

        {error && <p className="text-sm text-brand-pink">{error}</p>}

        <Button
          size="lg"
          loading={loading}
          disabled={displayName.trim().length === 0}
          onClick={save}
        >
          Continuar
        </Button>
      </div>
    </main>
  );
}
