import { describe, it, expect } from "vitest";
import { AxiosError } from "axios";
import {
  apiErrorMessage,
  apiErrorCode,
  setAccessToken,
  getAccessToken,
} from "@/lib/api";

function axiosErrorWith(data: unknown): AxiosError {
  const err = new AxiosError("Request failed");
  err.response = {
    data,
    status: 422,
    statusText: "Unprocessable",
    headers: {},
    config: {} as never,
  };
  return err;
}

describe("api error helpers", () => {
  it("extracts the message from an API error", () => {
    const err = axiosErrorWith({ error: { code: "X", message: "Email taken" } });
    expect(apiErrorMessage(err)).toBe("Email taken");
  });

  it("falls back when there is no structured error", () => {
    expect(apiErrorMessage(new Error("boom"), "fallback")).toBe("fallback");
  });

  it("extracts the error code", () => {
    const err = axiosErrorWith({ error: { code: "EMAIL_TAKEN" } });
    expect(apiErrorCode(err)).toBe("EMAIL_TAKEN");
    expect(apiErrorCode(new Error("x"))).toBeNull();
  });
});

describe("access token holder", () => {
  it("stores and clears the token", () => {
    setAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });
});
