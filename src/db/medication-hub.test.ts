import { describe, expect, it } from "vitest";

import { listMedicationHubCards } from "@/db/medication-hub";

const userId = "8d2c65d7-d818-4a7f-a1f3-a0fa918c98f3";
const medicationId = "a34f0d4a-855b-4b42-91b0-cd6b5597d5f0";

type QueryResult = { data: unknown[]; error: null };

function createQuery(result: QueryResult) {
  const filters: Array<[method: string, column: string, value: unknown]> = [];
  const query = {
    eq(column: string, value: unknown) {
      filters.push(["eq", column, value]);
      return query;
    },
    in(column: string, value: unknown) {
      filters.push(["in", column, value]);
      return query;
    },
    order() {
      return query;
    },
    select() {
      return query;
    },
    then<TResult1 = QueryResult, TResult2 = never>(
      resolve?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
      reject?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };

  return { filters, query };
}

describe("medication hub data", () => {
  it("uses authenticated owner data to assemble factual medication cards", async () => {
    const medications = createQuery({
      data: [{ display_name: "Synthetic routine", dose_type: "self_injection", id: medicationId }],
      error: null,
    });
    const doses = createQuery({
      data: [
        { administered_at: "2026-07-20T12:00:00.000Z", medication_id: medicationId },
        { administered_at: "2026-07-18T12:00:00.000Z", medication_id: medicationId },
      ],
      error: null,
    });
    const checkins = createQuery({
      data: [{ doses: { medication_id: medicationId } }, { doses: { medication_id: medicationId } }],
      error: null,
    });
    const references = createQuery({
      data: [{
        formulation_or_route: "Prefilled pen",
        medication_id: medicationId,
        source_url: "https://example.test/official-information",
        status: "confirmed",
      }],
      error: null,
    });

    const cards = await listMedicationHubCards({
      auth: { getUser: async () => ({ data: { user: { id: userId } } }) },
      from(table: "checkins" | "doses" | "medication_references" | "medications") {
        return { checkins, doses, medication_references: references, medications }[table].query;
      },
    } as never);

    expect(cards).toEqual([{
      doseTypeLabel: "Self-injection routine",
      id: medicationId,
      lastDoseAt: "2026-07-20T12:00:00.000Z",
      name: "Synthetic routine",
      officialInformation: {
        sourceUrl: "https://example.test/official-information",
        status: "confirmed",
      },
      pendingCheckinCount: 2,
      routeOrForm: "Prefilled pen",
    }]);
    expect(medications.filters).toContainEqual(["eq", "user_id", userId]);
    expect(doses.filters).toContainEqual(["eq", "user_id", userId]);
    expect(checkins.filters).toContainEqual(["eq", "user_id", userId]);
  });
});
