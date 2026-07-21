import { describe, expect, it } from "vitest";

import { listCheckinHistory } from "@/db/checkins";

const doseId = "a34f0d4a-855b-4b42-91b0-cd6b5597d5f0";
const userId = "8d2c65d7-d818-4a7f-a1f3-a0fa918c98f3";

function checkinRow(window: "24h" | "72h", scheduledAt: string) {
  return {
    completed_at: null,
    created_at: "2026-07-21T12:00:00.000Z",
    dose_id: doseId,
    doses: {
      administered_at: "2026-07-18T12:00:00.000Z",
      medications: { display_name: "Synthetic routine" },
    },
    fatigue: null,
    fever: null,
    gi_symptoms: null,
    headache: null,
    id: window === "24h" ? "e1b0d8f9-42c8-44de-a2c4-00535db9b597" : "a0dbd131-2e2a-42fc-a559-6e0a25937749",
    injection_site_reaction: null,
    joint_pain: null,
    scheduled_at: scheduledAt,
    status: "pending" as const,
    window,
  };
}

function historySupabase(rows: ReturnType<typeof checkinRow>[]) {
  const query = {
    eq: () => query,
    limit: async () => ({ data: rows, error: null }),
    order: () => query,
  };

  return {
    auth: { getUser: async () => ({ data: { user: { id: userId } } }) },
    from: () => ({ select: () => query }),
  };
}

describe("check-in history", () => {
  it("uses the linked dose administration time instead of a check-in scheduled time", async () => {
    const history = await listCheckinHistory(
      historySupabase([
        checkinRow("24h", "2026-07-19T12:00:00.000Z"),
        checkinRow("72h", "2026-07-21T12:00:00.000Z"),
      ]) as never,
    );

    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({
      administeredAt: "2026-07-18T12:00:00.000Z",
      medicationName: "Synthetic routine",
    });
    expect(history[0]?.checkins.map((checkin) => checkin.scheduledAt)).toEqual([
      "2026-07-19T12:00:00.000Z",
      "2026-07-21T12:00:00.000Z",
    ]);
  });
});
