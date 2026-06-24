import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seeds a handful of demo users + READY videos so the feed has content
 * on a fresh database. Playback ids are illustrative (replace with real
 * Mux playback ids to actually stream).
 */
async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash("password123", 12);

  const demoUsers = [
    { email: "marina@example.com", displayName: "Marina Silva" },
    { email: "lucas@example.com", displayName: "Lucas M." },
    { email: "ana@example.com", displayName: "Ana P." },
  ];

  for (const [i, u] of demoUsers.entries()) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        displayName: u.displayName,
        passwordHash,
      },
    });

    await prisma.video.upsert({
      where: { muxPlaybackId: `demo-playback-${i}` },
      update: {},
      create: {
        userId: user.id,
        duration: 30 + i * 3,
        status: "READY",
        confirmedAt: new Date(),
        muxUploadId: `demo-upload-${i}`,
        muxAssetId: `demo-asset-${i}`,
        muxPlaybackId: `demo-playback-${i}`,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${demoUsers.length} users with demo videos.`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
