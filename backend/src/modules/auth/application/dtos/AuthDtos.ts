export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
}

/** Result returned by register/login/refresh use cases. */
export interface SessionResult {
  accessToken: string;
  /** Raw refresh token — controller sets it as an httpOnly cookie. */
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  user: PublicUser;
}
