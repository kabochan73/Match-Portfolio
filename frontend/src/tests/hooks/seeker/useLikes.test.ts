import { describe, expect, it } from "vitest";
import { applySchema } from "@/hooks/seeker/useLikes";

describe("applySchema", () => {
  it("accepts a standard like with a motivation", () => {
    const result = applySchema.safeParse({
      likeType: "standard",
      motivation: "貴社の事業内容に強く共感したため志望しました。",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a super like", () => {
    const result = applySchema.safeParse({
      likeType: "super",
      motivation: "貴社の事業内容に強く共感したため志望しました。",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid likeType", () => {
    const result = applySchema.safeParse({
      likeType: "premium",
      motivation: "志望動機",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty motivation", () => {
    const result = applySchema.safeParse({
      likeType: "standard",
      motivation: "",
    });

    expect(result.success).toBe(false);
  });
});
