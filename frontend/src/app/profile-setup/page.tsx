"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { CanvasScreen } from "@/components/ui/CanvasScreen";
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
      setError(apiErrorMessage(err, "Couldn't save your profile"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <CanvasScreen variant="auth">
      <span className="font-display text-[26px] font-semibold italic tracking-[0.5px] text-ink">
        Sway
      </span>
      <h1 className="mt-[26px] font-display text-[46px] font-medium italic leading-[0.98] text-ink">
        Your first
        <br />
        impression
      </h1>
      <p className="mt-[14px] max-w-[280px] text-[15px] leading-[1.5] text-ink/55">
        How should your matches see you before the video plays?
      </p>

      {/* Avatar uploader row */}
      <div className="mt-[30px] flex items-center gap-4">
        <div
          className="flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full border-[1.5px] border-dashed border-accent-rose/55 bg-[linear-gradient(150deg,rgba(240,87,127,0.18),rgba(245,113,74,0.18))]"
          aria-hidden
        >
          {avatarUrl.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[30px] font-light text-ink/65">+</span>
          )}
        </div>
        <div>
          <p className="text-[15px] font-medium text-ink">Add a photo</p>
          <p className="mt-0.5 text-[13px] text-ink/40">Soft light works wonders</p>
        </div>
      </div>

      {/* Field stack */}
      <div className="mt-[26px] flex flex-col gap-[13px]">
        <label className="flex flex-col">
          <span className="sway-eyebrow mb-[7px] pl-1">Display name</span>
          <input
            className="sway-field"
            aria-label="Display name"
            placeholder="Luna"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>

        <label className="flex flex-col">
          <span className="sway-eyebrow mb-[7px] pl-1">Photo URL (optional)</span>
          <input
            className="sway-field"
            aria-label="Photo URL"
            placeholder="https://…"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[12px] text-accent-rose">
          {error}
        </p>
      )}

      <div className="flex-1" />

      <Button
        size="lg"
        className="w-full"
        loading={loading}
        disabled={displayName.trim().length === 0}
        onClick={save}
      >
        Continue
      </Button>
    </CanvasScreen>
  );
}
