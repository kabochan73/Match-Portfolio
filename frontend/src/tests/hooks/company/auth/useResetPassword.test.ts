import { describe, expect, it } from "vitest";
import { resetPasswordSchema } from "@/hooks/company/auth/useResetPassword";

describe("company resetPasswordSchema", () => {
  it("accepts matching passwords of at least 8 characters", () => {
    const result = resetPasswordSchema.safeParse({
      password: "password123",
      passwordConfirmation: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = resetPasswordSchema.safeParse({
      password: "short",
      passwordConfirmation: "short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a mismatched password confirmation, attached to that field", () => {
    const result = resetPasswordSchema.safeParse({
      password: "password123",
      passwordConfirmation: "different-password",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["passwordConfirmation"]);
    }
  });
});
