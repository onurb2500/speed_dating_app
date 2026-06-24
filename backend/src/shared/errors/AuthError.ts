import { AppError } from "@/shared/errors/AppError";

/** 401 — missing/invalid credentials or token. */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", code = "UNAUTHORIZED") {
    super(message, 401, code);
  }
}

/** 403 — authenticated but not allowed. */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", code = "FORBIDDEN") {
    super(message, 403, code);
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super("Invalid email or password", "INVALID_CREDENTIALS");
  }
}

export class InvalidRefreshTokenError extends UnauthorizedError {
  constructor() {
    super("Refresh token is invalid or revoked", "INVALID_REFRESH_TOKEN");
  }
}

export class RefreshTokenExpiredError extends UnauthorizedError {
  constructor() {
    super("Refresh token has expired", "REFRESH_TOKEN_EXPIRED");
  }
}
