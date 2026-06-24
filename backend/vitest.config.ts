import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Coverage targets the unit-tested layers: use cases + shared utils.
      // Infrastructure (Prisma repos, Mux), interface (controllers/routes)
      // and config are exercised by integration tests, not unit coverage.
      include: [
        "src/modules/**/application/**/*.ts",
        "src/shared/utils/**/*.ts",
      ],
      exclude: ["src/**/*.test.ts", "src/**/dtos/**", "src/**/*.d.ts"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
