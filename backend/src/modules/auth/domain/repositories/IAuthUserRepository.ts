import { AuthUserRecord } from "@/modules/auth/domain/entities/AuthToken";

export interface CreateAuthUserInput {
  email: string;
  passwordHash: string;
  displayName: string;
}

/**
 * Credentials projection of the user store, owned by the auth module.
 * (The users module owns profile reads/updates via its own repository.)
 */
export interface IAuthUserRepository {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  findById(id: string): Promise<AuthUserRecord | null>;
  emailExists(email: string): Promise<boolean>;
  create(input: CreateAuthUserInput): Promise<AuthUserRecord>;
}
