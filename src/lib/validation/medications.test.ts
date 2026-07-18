import { describe, expect, it } from "vitest";

import { medicationRoutineSchema } from "@/lib/validation/medications";

describe("medicationRoutineSchema", () => {
  it("accepts a routine with a loading phase", () => {
    expect(
      medicationRoutineSchema.safeParse({
        colorLabel: "teal",
        displayName: "Example routine",
        doseType: "self_injection",
        hasLoadingPhase: true,
        intervalDays: 14,
        loadingDoseCount: 2,
        loadingIntervalDays: 7,
      }).success,
    ).toBe(true);
  });

  it("rejects a loading phase without its required values", () => {
    expect(
      medicationRoutineSchema.safeParse({
        colorLabel: "teal",
        displayName: "Example routine",
        doseType: "oral",
        hasLoadingPhase: true,
        intervalDays: 30,
      }).success,
    ).toBe(false);
  });
});
