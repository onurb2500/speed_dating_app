"use client";

export function OfflineScreen() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
      <span className="text-5xl">📡</span>
      <h2 className="text-xl font-bold">Você está offline</h2>
      <p className="text-sm text-muted">
        Conecte-se à internet para começar sua jornada ❤️
      </p>
    </div>
  );
}
