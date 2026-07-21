import { describe, expect, it } from "vitest";

import { createVisitPrepCopy, getRecordedScores, parseVisitPrepRange } from "@/lib/visit-prep";

describe("visit prep", () => {
  it("uses only the supported 7-day and 30-day ranges", () => {
    expect(parseVisitPrepRange(undefined)).toBe(7);
    expect(parseVisitPrepRange("30")).toBe(30);
    expect(parseVisitPrepRange("90")).toBe(7);
  });

  it("copies factual records and omits scores that were not recorded", () => {
    const copy = createVisitPrepCopy({
      checkins: [{
        administeredAt: "2026-07-18T12:00:00.000Z",
        completedAt: "2026-07-19T12:00:00.000Z",
        doseId: "test-dose",
        id: "test-checkin",
        medicationName: "Synthetic routine",
        scheduledAt: "2026-07-19T12:00:00.000Z",
        scores: {
          fatigue: 3,
          fever: null,
          giSymptoms: null,
          headache: null,
          injectionSiteReaction: 1,
          jointPain: null,
        },
        status: "completed",
        window: "24h",
      }],
      doses: [{
        administeredAt: "2026-07-18T12:00:00.000Z",
        id: "test-dose",
        medicationName: "Synthetic routine",
      }],
      medications: [{ id: "test-medication", name: "Synthetic routine" }],
      rangeDays: 7,
    });

    expect(copy).toContain("Date range: Last 7 days");
    expect(copy).toContain("Synthetic routine: 24h check-in completed");
    expect(copy).toContain("Fatigue: 3");
    expect(copy).toContain("Injection-site reaction: 1");
    expect(copy).not.toContain("Fever:");
    expect(copy).toContain("not medical advice");
  });

  it("returns only non-null score values for display", () => {
    expect(getRecordedScores({
      fatigue: null,
      fever: 0,
      giSymptoms: null,
      headache: null,
      injectionSiteReaction: null,
      jointPain: 5,
    })).toEqual([
      { label: "Fever", value: 0 },
      { label: "Joint pain", value: 5 },
    ]);
  });
});
