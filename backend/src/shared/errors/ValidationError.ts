import { AppError } from "@/shared/errors/AppError";

/** 422 — request failed validation or a business rule. */
export class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    code = "VALIDATION_ERROR",
    public readonly details?: unknown,
  ) {
    super(message, 422, code);
  }
}

export class EmailTakenError extends ValidationError {
  constructor() {
    super("Email is already registered", "EMAIL_TAKEN");
  }
}

export class DurationExceededError extends ValidationError {
  constructor() {
    super("Video exceeds the maximum duration", "DURATION_EXCEEDS_LIMIT");
  }
}
