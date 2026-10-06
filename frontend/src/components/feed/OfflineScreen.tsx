"use client";

export function OfflineScreen() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-videoInk-b px-8 text-center">
      <span className="text-5xl">📡</span>
      <h2 className="font-display text-[28px] font-medium italic text-white">
        You&apos;re offline
      </h2>
      <p className="text-sm text-onDarkSoft/60">
        Reconnect to start your journey ❤️
      </p>
    </div>
  );
}
