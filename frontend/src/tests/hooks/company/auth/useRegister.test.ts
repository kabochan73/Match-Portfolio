import { describe, expect, it } from "vitest";
import { registerSchema } from "@/hooks/company/auth/useRegister";

function validPayload(overrides: Partial<Record<string, string>> = {}) {
  return {
    name: "株式会社テスト",
    email: "company@example.com",
    password: "password123",
    passwordConfirmation: "password123",
    ...overrides,
  };
}

describe("company registerSchema", () => {
  it("accepts a fully valid payload", () => {
    expect(registerSchema.safeParse(validPayload()).success).toBe(true);
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

  it("rejects an empty company name", () => {
    const result = registerSchema.safeParse(validPayload({ name: "" }));
    expect(result.success).toBe(false);
  });
});
