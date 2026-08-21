import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "@/hooks/company/useUpdateProfile";

describe("company updateProfileSchema", () => {
  it("accepts a payload with only the required name field", () => {
    const result = updateProfileSchema.safeParse({ name: "株式会社テスト" });
    expect(result.success).toBe(true);
  });

  it("accepts an empty websiteUrl (optional field)", () => {
    const result = updateProfileSchema.safeParse({
      name: "株式会社テスト",
      websiteUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-URL websiteUrl", () => {
    const result = updateProfileSchema.safeParse({
      name: "株式会社テスト",
      websiteUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty company name", () => {
    const result = updateProfileSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a phoneNumber longer than 255 characters", () => {
    const result = updateProfileSchema.safeParse({
      name: "株式会社テスト",
      phoneNumber: "0".repeat(256),
    });
    expect(result.success).toBe(false);
  });
});
