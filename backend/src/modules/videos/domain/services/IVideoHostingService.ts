/** Abstraction over the video hosting provider (Mux). */

export interface DirectUpload {
  uploadId: string;
  uploadUrl: string;
}

export interface MuxWebhookEvent {
  type: string;
  data: {
    id?: string;
    upload_id?: string;
    asset_id?: string;
    playback_ids?: { id: string }[];
    duration?: number;
  };
}

export interface IVideoHostingService {
  /** Create a Mux Direct Upload and return the upload id + signed URL. */
  createDirectUpload(corsOrigin: string): Promise<DirectUpload>;

  /**
   * Verify the Mux webhook signature against the raw request body.
   * Throws if invalid; returns the parsed event if valid.
   */
  verifyWebhook(rawBody: Buffer | string, signature: string): MuxWebhookEvent;

  /** Delete an asset (best-effort cleanup on video deletion). */
  deleteAsset(assetId: string): Promise<void>;
}
