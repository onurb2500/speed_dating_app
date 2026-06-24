import { IUserRepository } from "@/modules/users/domain/repositories/IUserRepository";
import { User } from "@/modules/users/domain/entities/User";
import { NotFoundError } from "@/shared/errors";

export class GetUserProfileUseCase {
  constructor(private readonly users: IUserRepository) {}

  async execute(userId: string): Promise<User> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found", "NOT_FOUND");
    }
    return user;
  }
}
