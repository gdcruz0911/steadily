import { describe, expect, it } from "vitest";

import { psoriasisResearchUpdates } from "@/lib/updates";

describe("psoriasis research updates pilot", () => {
  it("contains a small fixed feed from the approved authoritative source types", () => {
    expect(psoriasisResearchUpdates).toHaveLength(6);

    for (const update of psoriasisResearchUpdates) {
      expect(update.dateLabel).not.toBe("");
      expect(update.description).not.toBe("");
      expect(update.sourceUrl).toMatch(/^https:\/\/(clinicaltrials\.gov|pubmed\.ncbi\.nlm\.nih\.gov|www\.fda\.gov|www\.niams\.nih\.gov)\//);
    }
  });

  it("keeps pilot copy neutral and non-personalized", () => {
    const copy = psoriasisResearchUpdates
      .map((update) => `${update.title} ${update.description}`)
      .join(" ")
      .toLowerCase();

    expect(copy).not.toContain("breakthrough");
    expect(copy).not.toContain("personalized");
    expect(copy).not.toContain("should take");
  });
});
