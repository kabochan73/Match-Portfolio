import { describe, expect, it } from "vitest";
import { loginSchema } from "@/hooks/company/auth/useLogin";

describe("company loginSchema", () => {
  it("accepts a valid email and non-empty password", () => {
    const result = loginSchema.safeParse({
      email: "company@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a malformed email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "company@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});
