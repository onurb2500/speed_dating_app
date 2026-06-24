import {
  IUserRepository,
  UpdateUserInput,
} from "@/modules/users/domain/repositories/IUserRepository";
import { User } from "@/modules/users/domain/entities/User";
import { NotFoundError } from "@/shared/errors";

export class UpdateUserProfileUseCase {
  constructor(private readonly users: IUserRepository) {}

  async execute(userId: string, input: UpdateUserInput): Promise<User> {
    const existing = await this.users.findById(userId);
    if (!existing) {
      throw new NotFoundError("User not found", "NOT_FOUND");
    }
    return this.users.update(userId, input);
  }
}
