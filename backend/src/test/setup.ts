import { generateKeyPairSync } from "node:crypto";

/**
 * Test environment bootstrap. Runs before any module (including config/env)
 * is imported, so the Zod env schema validates and JWT signing works with a
 * real RSA key pair.
 */
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

process.env.NODE_ENV = "test";
process.env.PORT = "3001";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.JWT_PRIVATE_KEY = privateKey;
process.env.JWT_PUBLIC_KEY = publicKey;
process.env.REFRESH_TOKEN_SECRET = "x".repeat(64);
process.env.MUX_TOKEN_ID = "test-mux-id";
process.env.MUX_TOKEN_SECRET = "test-mux-secret";
process.env.MUX_WEBHOOK_SECRET = "test-webhook-secret";
process.env.CORS_ORIGINS = "http://localhost:3000";
