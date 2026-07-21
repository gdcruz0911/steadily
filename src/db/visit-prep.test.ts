import { describe, expect, it } from "vitest";

import { getVisitPrepData } from "@/db/visit-prep";

const userId = "8d2c65d7-d818-4a7f-a1f3-a0fa918c98f3";

type Filter = [method: "eq" | "gte" | "lte", column: string, value: string];

function createQuery(data: unknown[]) {
  const filters: Filter[] = [];
  const query = {
    eq(column: string, value: string) {
      filters.push(["eq", column, value]);
      return query;
    },
    gte(column: string, value: string) {
      filters.push(["gte", column, value]);
      return query;
    },
    lte(column: string, value: string) {
      filters.push(["lte", column, value]);
      return query;
    },
    order() {
      return query;
    },
    select() {
      return query;
    },
    then<TResult1 = { data: unknown[]; error: null }, TResult2 = never>(
      resolve?: ((value: { data: unknown[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
      reject?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) {
      return Promise.resolve({ data, error: null }).then(resolve, reject);
    },
  };

  return { filters, query };
}

describe("visit prep data access", () => {
  it("derives the owner from the session and scopes every source query to that owner", async () => {
    const medications = createQuery([{ display_name: "Synthetic routine", id: "test-medication" }]);
    const doses = createQuery([]);
    const checkins = createQuery([]);

    const visitPrep = await getVisitPrepData({
      auth: { getUser: async () => ({ data: { user: { id: userId } } }) },
      from(table: "medications" | "doses" | "checkins") {
        return { checkins, doses, medications }[table].query;
      },
    } as never, 7);

    expect(visitPrep.medications).toEqual([{ id: "test-medication", name: "Synthetic routine" }]);
    expect(medications.filters).toContainEqual(["eq", "user_id", userId]);
    expect(doses.filters).toContainEqual(["eq", "user_id", userId]);
    expect(checkins.filters).toContainEqual(["eq", "user_id", userId]);
  });
});
