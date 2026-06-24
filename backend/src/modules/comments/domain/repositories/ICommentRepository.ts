import { Comment } from "@/modules/comments/domain/entities/Comment";

export interface CreateCommentInput {
  userId: string;
  videoId: string;
  text: string;
}

export interface ListCommentsInput {
  videoId: string;
  cursor?: string;
  limit: number;
}

export interface ICommentRepository {
  videoExists(videoId: string): Promise<boolean>;
  create(input: CreateCommentInput): Promise<Comment>;
  /** Returns up to `limit + 1` rows (createdAt DESC) for cursor paging. */
  list(input: ListCommentsInput): Promise<Comment[]>;
  findById(id: string): Promise<{ id: string; userId: string } | null>;
  delete(id: string): Promise<void>;
}
