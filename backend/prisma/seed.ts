import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seeds a handful of demo users + READY videos so the feed has content
 * on a fresh database. Playback ids are real, public Mux demo assets so the
 * feed actually streams without needing uploads of your own.
 */
async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash("password123", 12);

  const demoUsers = [
    {
      email: "marina@example.com",
      displayName: "Marina Silva",
      playbackId: "a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M",
    },
    {
      email: "lucas@example.com",
      displayName: "Lucas M.",
      playbackId: "DS00Spx1CV902MCtPj5WknGlR102V5HFkDe",
    },
    {
      email: "ana@example.com",
      displayName: "Ana P.",
      playbackId: "qxb01i6T202018GFS02vp9RIe01icTcDCjVzQpmaB00CUisJ4",
    },
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

    // Key on the stable upload id so re-seeding updates the playback id on any
    // pre-existing demo rows (e.g. earlier fake `demo-playback-*` values).
    await prisma.video.upsert({
      where: { muxUploadId: `demo-upload-${i}` },
      update: {
        status: "READY",
        muxPlaybackId: u.playbackId,
        muxAssetId: `demo-asset-${i}`,
      },
      create: {
        userId: user.id,
        duration: 30 + i * 3,
        status: "READY",
        confirmedAt: new Date(),
        muxUploadId: `demo-upload-${i}`,
        muxAssetId: `demo-asset-${i}`,
        muxPlaybackId: u.playbackId,
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
