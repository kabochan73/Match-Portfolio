import { describe, expect, it } from "vitest";
import { jobPostingSchema } from "@/hooks/company/useJobPostings";

function validPayload(overrides: Partial<Record<string, string>> = {}) {
  return {
    title: "Webエンジニア",
    description: "自社サービスの開発をお任せします。",
    desiredCandidate: "実務経験3年以上",
    employmentType: "full_time",
    prefecture: "東京都",
    salaryMin: "4000000",
    salaryMax: "6000000",
    ...overrides,
  };
}

describe("jobPostingSchema", () => {
  it("accepts a fully valid payload", () => {
    expect(jobPostingSchema.safeParse(validPayload()).success).toBe(true);
  });

  it("accepts each valid employmentType value", () => {
    for (const employmentType of ["full_time", "part_time", "contract"]) {
      const result = jobPostingSchema.safeParse(
        validPayload({ employmentType }),
      );
      expect(result.success).toBe(true);
    }
  });

  it("rejects an invalid employmentType", () => {
    const result = jobPostingSchema.safeParse(
      validPayload({ employmentType: "freelance" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects an empty title", () => {
    const result = jobPostingSchema.safeParse(validPayload({ title: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects an empty prefecture", () => {
    const result = jobPostingSchema.safeParse(validPayload({ prefecture: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects an empty salaryMin/salaryMax", () => {
    expect(
      jobPostingSchema.safeParse(validPayload({ salaryMin: "" })).success,
    ).toBe(false);
    expect(
      jobPostingSchema.safeParse(validPayload({ salaryMax: "" })).success,
    ).toBe(false);
  });
});
