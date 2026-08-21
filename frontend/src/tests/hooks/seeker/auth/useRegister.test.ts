import { describe, expect, it } from "vitest";
import { registerSchema } from "@/hooks/seeker/auth/useRegister";

function validPayload(overrides: Partial<Record<string, string>> = {}) {
  return {
    name: "山田太郎",
    email: "taro@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    comment: "よろしくお願いします",
    portfolioUrl: "https://example.com",
    birthDate: "1995-05-05",
    ...overrides,
  };
}

describe("registerSchema", () => {
  it("accepts a fully valid payload", () => {
    expect(registerSchema.safeParse(validPayload()).success).toBe(true);
  });

  it("accepts an empty portfolioUrl (optional field)", () => {
    const result = registerSchema.safeParse(validPayload({ portfolioUrl: "" }));
    expect(result.success).toBe(true);
  });

  it("rejects a non-URL portfolioUrl", () => {
    const result = registerSchema.safeParse(
      validPayload({ portfolioUrl: "not-a-url" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const result = registerSchema.safeParse(
      validPayload({ email: "not-an-email" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse(
      validPayload({ password: "short", passwordConfirmation: "short" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a mismatched password confirmation, attached to that field", () => {
    const result = registerSchema.safeParse(
      validPayload({ passwordConfirmation: "different-password" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["passwordConfirmation"]);
    }
  });

  it("rejects an empty name", () => {
    const result = registerSchema.safeParse(validPayload({ name: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects a comment longer than 200 characters", () => {
    const result = registerSchema.safeParse(
      validPayload({ comment: "あ".repeat(201) }),
    );
    expect(result.success).toBe(false);
  });
});
