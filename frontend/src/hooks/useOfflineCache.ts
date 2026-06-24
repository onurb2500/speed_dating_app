"use client";

import { useCallback } from "react";
import { openDB, DBSchema, IDBPDatabase } from "idb";
import { FeedItem } from "@/types";

interface PendingUpload {
  id: string;
  blob: Blob;
  durationSeconds: number;
  createdAt: number;
}

interface SpeedDatingDB extends DBSchema {
  "pending-uploads": {
    key: string;
    value: PendingUpload;
  };
  "offline-feed": {
    key: string;
    value: { id: string; items: FeedItem[]; savedAt: number };
  };
}

let dbPromise: Promise<IDBPDatabase<SpeedDatingDB>> | null = null;

function getDb(): Promise<IDBPDatabase<SpeedDatingDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SpeedDatingDB>("speed-dating", 1, {
      upgrade(db) {
        db.createObjectStore("pending-uploads", { keyPath: "id" });
        db.createObjectStore("offline-feed", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

const FEED_KEY = "latest";

/**
 * IndexedDB-backed offline cache:
 * - `pending-uploads`: videos recorded while offline, auto-synced on reconnect.
 * - `offline-feed`: the last feed items so the app shell has content offline.
 */
export function useOfflineCache() {
  const savePendingUpload = useCallback(
    async (blob: Blob, durationSeconds: number): Promise<string> => {
      const db = await getDb();
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await db.put("pending-uploads", {
        id,
        blob,
        durationSeconds,
        createdAt: Date.now(),
      });
      return id;
    },
    [],
  );

  const getPendingUploads = useCallback(async (): Promise<PendingUpload[]> => {
    const db = await getDb();
    return db.getAll("pending-uploads");
  }, []);

  const removePendingUpload = useCallback(async (id: string): Promise<void> => {
    const db = await getDb();
    await db.delete("pending-uploads", id);
  }, []);

  const cacheFeed = useCallback(async (items: FeedItem[]): Promise<void> => {
    const db = await getDb();
    await db.put("offline-feed", { id: FEED_KEY, items, savedAt: Date.now() });
  }, []);

  const getCachedFeed = useCallback(async (): Promise<FeedItem[]> => {
    const db = await getDb();
    const row = await db.get("offline-feed", FEED_KEY);
    return row?.items ?? [];
  }, []);

  return {
    savePendingUpload,
    getPendingUploads,
    removePendingUpload,
    cacheFeed,
    getCachedFeed,
  };
}
