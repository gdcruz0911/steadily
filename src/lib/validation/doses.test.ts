import { describe, expect, it } from "vitest";

import { parseDoseFormData } from "@/lib/validation/doses";

const medicationId = "b2f2a168-8b18-43be-976a-e8a3de04818f";

function formData(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }
  return data;
}

describe("dose validation", () => {
  it("accepts a valid synthetic self-injection record", () => {
    const result = parseDoseFormData(
      formData({
        administeredAt: "2026-07-20T14:30:00.000Z",
        injectionSite: "abdomen-left",
        medicationId,
      }),
    );

    expect(result.success).toBe(true);
  });

  it("rejects malformed date, medication, and injection-site values", () => {
    const result = parseDoseFormData(
      formData({
        administeredAt: "not-a-date",
        injectionSite: "shoulder",
        medicationId: "not-a-uuid",
      }),
    );

    expect(result.success).toBe(false);
  });
});
