import { describe, expect, it } from "vitest";

import { extractDailyMedSetId, selectedFormOrRoute } from "@/lib/medication-references/dailymed";

describe("DailyMed lookup helpers", () => {
  it("accepts an official DailyMed SET ID", () => {
    expect(extractDailyMedSetId("FDBFE194-B845-42C5-BB87-A48118BC72E7")).toBe(
      "fdbfe194-b845-42c5-bb87-a48118bc72e7",
    );
  });

  it("accepts an official DailyMed URL but rejects other hosts", () => {
    expect(
      extractDailyMedSetId(
        "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=fdbfe194-b845-42c5-bb87-a48118bc72e7",
      ),
    ).toBe("fdbfe194-b845-42c5-bb87-a48118bc72e7");
    expect(extractDailyMedSetId("https://example.test/?setid=fdbfe194-b845-42c5-bb87-a48118bc72e7")).toBeNull();
  });

  it("maps only the selected routine type to the lookup form or route", () => {
    expect(selectedFormOrRoute("self_injection")).toBe("injection");
    expect(selectedFormOrRoute("clinic_infusion")).toBe("infusion");
    expect(selectedFormOrRoute("oral")).toBe("oral");
  });
});
