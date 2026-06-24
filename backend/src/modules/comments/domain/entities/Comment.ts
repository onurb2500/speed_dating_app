export interface CommentAuthor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

/** Comment entity with embedded author projection. */
export interface Comment {
  id: string;
  videoId: string;
  text: string;
  author: CommentAuthor;
  createdAt: Date;
}
