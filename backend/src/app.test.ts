import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "@/app";

const app = createApp();

describe("app", () => {
  it("responds to the health check", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("returns a structured 404 for unknown routes", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("rejects protected routes without a token", async () => {
    const res = await request(app).get("/users/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("validates request bodies (422)", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "not-an-email", password: "x" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
