import { AppError } from "@/shared/errors/AppError";

/** 404 — resource not found. */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(message, 404, code);
  }
}

/** 409 — state conflict (e.g. already confirmed). */
export class ConflictError extends AppError {
  constructor(message = "Conflict", code = "CONFLICT") {
    super(message, 409, code);
  }
}
