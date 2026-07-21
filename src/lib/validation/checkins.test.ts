import { describe, expect, it } from "vitest";

import { parseCompleteCheckinFormData, parseSkipCheckinFormData } from "@/lib/validation/checkins";

const checkinId = "7ad90ea2-a83e-4a6f-8f86-a6c304816907";

function formData(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }
  return data;
}

describe("check-in validation", () => {
  it("accepts all six structured scores from 0 to 5", () => {
    const result = parseCompleteCheckinFormData(
      formData({
        checkinId,
        fatigue: "3",
        fever: "0",
        giSymptoms: "2",
        headache: "1",
        injectionSiteReaction: "4",
        jointPain: "5",
      }),
    );

    expect(result.success).toBe(true);
  });

  it("rejects malformed check-ins and out-of-range scores", () => {
    const result = parseCompleteCheckinFormData(
      formData({
        checkinId: "not-a-uuid",
        fatigue: "6",
        fever: "0",
        giSymptoms: "2",
        headache: "1",
        injectionSiteReaction: "4",
        jointPain: "5",
      }),
    );

    expect(result.success).toBe(false);
  });

  it("accepts a valid explicit skip request", () => {
    expect(parseSkipCheckinFormData(formData({ checkinId })).success).toBe(true);
  });
});
