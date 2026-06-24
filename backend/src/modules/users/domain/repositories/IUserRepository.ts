import { User, SavedPrompt } from "@/modules/users/domain/entities/User";

export interface UpdateUserInput {
  displayName?: string;
  avatarUrl?: string | null;
  savedPrompts?: SavedPrompt[];
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  update(id: string, input: UpdateUserInput): Promise<User>;
}
