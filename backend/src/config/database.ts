import { PrismaClient } from "@prisma/client";
import { isProduction } from "@/config/env";

/**
 * Prisma client singleton. In dev, reuse across hot-reloads to avoid
 * exhausting database connections.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProduction ? ["error"] : ["error", "warn"],
  });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
