import Mux from "@mux/mux-node";
import {
  IVideoHostingService,
  DirectUpload,
  MuxWebhookEvent,
} from "@/modules/videos/domain/services/IVideoHostingService";
import { env } from "@/config/env";
import { MAX_VIDEO_DURATION } from "@/config/constants";
import { UnauthorizedError } from "@/shared/errors";

/** Mux implementation of the video hosting service. */
export class MuxService implements IVideoHostingService {
  private readonly mux: Mux;

  constructor() {
    this.mux = new Mux({
      tokenId: env.MUX_TOKEN_ID,
      tokenSecret: env.MUX_TOKEN_SECRET,
    });
  }

  async createDirectUpload(corsOrigin: string): Promise<DirectUpload> {
    const upload = await this.mux.video.uploads.create({
      cors_origin: corsOrigin,
      // Cap server-side too: reject assets longer than the limit.
      test: env.NODE_ENV !== "production" ? true : undefined,
      new_asset_settings: {
        playback_policy: ["public"],
        max_resolution_tier: "1080p",
      },
    });

    if (!upload.url) {
      throw new Error("Mux did not return an upload URL");
    }

    return { uploadId: upload.id, uploadUrl: upload.url };
  }

  verifyWebhook(rawBody: Buffer | string, signature: string): MuxWebhookEvent {
    const payload =
      typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
    try {
      this.mux.webhooks.verifySignature(
        payload,
        { "mux-signature": signature },
        env.MUX_WEBHOOK_SECRET,
      );
    } catch {
      throw new UnauthorizedError(
        "Invalid Mux webhook signature",
        "INVALID_WEBHOOK_SIGNATURE",
      );
    }
    return JSON.parse(payload) as MuxWebhookEvent;
  }

  async deleteAsset(assetId: string): Promise<void> {
    await this.mux.video.assets.delete(assetId);
  }
}

/** Re-exported so callers can reference the duration cap if needed. */
export const MUX_MAX_DURATION = MAX_VIDEO_DURATION;
