export interface ILikeRepository {
  videoExists(videoId: string): Promise<boolean>;
  /** Create a like if absent. Returns true if a new like was created. */
  add(userId: string, videoId: string): Promise<boolean>;
  /** Remove a like if present. Returns true if a like was removed. */
  remove(userId: string, videoId: string): Promise<boolean>;
  countForVideo(videoId: string): Promise<number>;
  exists(userId: string, videoId: string): Promise<boolean>;
}
