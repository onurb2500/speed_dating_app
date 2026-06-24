import { describe, it, expect } from "vitest";
import { buildCursorPage, clampLimit } from "@/shared/utils/pagination";
import { signAccessToken, verifyAccessToken } from "@/shared/utils/jwt";
import {
  hashPassword,
  verifyPassword,
  generateRefreshToken,
  hashRefreshToken,
} from "@/shared/utils/hash";

describe("pagination", () => {
  it("detects more pages and slices the extra item", () => {
    const rows = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const page = buildCursorPage(rows, 2);
    expect(page.items).toHaveLength(2);
    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).toBe("b");
  });

  it("reports no more pages when under the limit", () => {
    const page = buildCursorPage([{ id: "a" }], 2);
    expect(page.hasMore).toBe(false);
    expect(page.nextCursor).toBeNull();
  });

  it("clamps limits into range", () => {
    expect(clampLimit(undefined, 10, 20)).toBe(10);
    expect(clampLimit(50, 10, 20)).toBe(20);
    expect(clampLimit(-3, 10, 20)).toBe(10);
    expect(clampLimit(5, 10, 20)).toBe(5);
  });
});

describe("jwt", () => {
  it("round-trips an access token", () => {
    const token = signAccessToken({ sub: "user-1", email: "u@e.com" });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe("user-1");
    expect(payload.email).toBe("u@e.com");
  });

  it("rejects a tampered token", () => {
    expect(() => verifyAccessToken("not.a.jwt")).toThrow();
  });
});

describe("hash", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("password123");
    expect(hash).not.toBe("password123");
    expect(await verifyPassword("password123", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("derives a stable refresh-token hash", () => {
    const raw = generateRefreshToken();
    expect(hashRefreshToken(raw)).toBe(hashRefreshToken(raw));
    expect(hashRefreshToken(raw)).not.toBe(raw);
  });
});
