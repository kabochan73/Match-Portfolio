import { describe, expect, it } from "vitest";
import { updateProfileSchema } from "@/hooks/seeker/useUpdateProfile";

function validPayload(overrides: Partial<Record<string, string>> = {}) {
  return {
    name: "山田太郎",
    comment: "よろしくお願いします",
    portfolioUrl: "https://example.com",
    birthDate: "1995-05-05",
    ...overrides,
  };
}

describe("seeker updateProfileSchema", () => {
  it("accepts a fully valid payload", () => {
    expect(updateProfileSchema.safeParse(validPayload()).success).toBe(true);
  });

  it("accepts an empty portfolioUrl (optional field)", () => {
    const result = updateProfileSchema.safeParse(
      validPayload({ portfolioUrl: "" }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects a non-URL portfolioUrl", () => {
    const result = updateProfileSchema.safeParse(
      validPayload({ portfolioUrl: "not-a-url" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = updateProfileSchema.safeParse(validPayload({ name: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects a comment longer than 200 characters", () => {
    const result = updateProfileSchema.safeParse(
      validPayload({ comment: "あ".repeat(201) }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects an empty birthDate", () => {
    const result = updateProfileSchema.safeParse(
      validPayload({ birthDate: "" }),
    );
    expect(result.success).toBe(false);
  });
});
