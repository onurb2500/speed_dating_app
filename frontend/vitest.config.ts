import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      // Pure/logic units we unit-test. Media/network-heavy hooks
      // (useVideoRecorder, useUpload, useFeed, …) are validated via the
      // typecheck + manual E2E flow, not unit coverage.
      include: [
        "src/lib/utils.ts",
        "src/lib/api.ts",
        "src/lib/nativeBridge.ts",
        "src/store/**/*.ts",
        "src/hooks/usePromptSequence.ts",
        "src/hooks/useRecordingTimer.ts",
        "src/hooks/useLike.ts",
      ],
      exclude: ["src/**/*.test.{ts,tsx}"],
      thresholds: { lines: 70, functions: 60, branches: 55, statements: 70 },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
