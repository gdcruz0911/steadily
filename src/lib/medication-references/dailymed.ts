import type { MedicationRoutineInput } from "@/lib/validation/medications";

const DAILYMED_ORIGIN = "https://dailymed.nlm.nih.gov";
const DAILYMED_SERVICE_URL = `${DAILYMED_ORIGIN}/dailymed/services/v2/spls.json`;
const DAILYMED_LABEL_URL = `${DAILYMED_ORIGIN}/dailymed/drugInfo.cfm?setid=`;
const SET_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type OfficialSourceCandidate = {
  confirmedProductName: string;
  formulationOrRoute: string;
  manufacturerOrLabeler: string | null;
  officialTitle: string;
  sourceIdentifier: string;
  sourceRevisionDate: string | null;
  sourceUrl: string;
};

export interface OfficialSourceAdapter {
  getByIdentifier(identifier: string): Promise<OfficialSourceCandidate | null>;
  search(input: {
    medicineName: string;
    selectedFormOrRoute: string;
  }): Promise<OfficialSourceCandidate[]>;
}

type DailyMedSearchResponse = {
  data?: Array<{
    published_date?: string;
    setid?: string;
    title?: string;
  }>;
};

function textFromXml(xml: string, localName: string) {
  const match = xml.match(new RegExp(`<[^>]*${localName}[^>]*>([\\s\\S]*?)<\\/[^>]*${localName}>`, "i"));
  return match?.[1]
    ?.replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim() ?? null;
}

function attributeFromXml(xml: string, localName: string, attribute: string) {
  const element = xml.match(new RegExp(`<[^>]*${localName}[^>]*>`, "i"))?.[0];
  const value = element?.match(new RegExp(`${attribute}="([^"]+)"`, "i"))?.[1];
  return value?.trim() ?? null;
}

function asIsoDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString().slice(0, 10);
}

function titleDetails(title: string) {
  const [nameAndForm = title, labeler] = title.split(/\s*\[|\]$/);
  const words = nameAndForm.trim().split(/\s+/);
  const formulation = words.slice(Math.max(1, words.length - 3)).join(" ");

  return {
    confirmedProductName: words.slice(0, Math.max(1, words.length - 3)).join(" "),
    formulationOrRoute: formulation || "Official formulation not listed",
    manufacturerOrLabeler: labeler?.trim() || null,
  };
}

function candidateFromSearchResult(result: NonNullable<DailyMedSearchResponse["data"]>[number]) {
  if (!result.setid || !SET_ID_PATTERN.test(result.setid) || !result.title) {
    return null;
  }

  const details = titleDetails(result.title);
  return {
    ...details,
    officialTitle: result.title,
    sourceIdentifier: result.setid,
    sourceRevisionDate: asIsoDate(result.published_date),
    sourceUrl: `${DAILYMED_LABEL_URL}${result.setid}`,
  } satisfies OfficialSourceCandidate;
}

export function selectedFormOrRoute(doseType: MedicationRoutineInput["doseType"]) {
  return {
    clinic_infusion: "infusion",
    oral: "oral",
    self_injection: "injection",
  }[doseType];
}

export function extractDailyMedSetId(value: string) {
  const trimmed = value.trim();
  if (SET_ID_PATTERN.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname !== "dailymed.nlm.nih.gov") {
      return null;
    }

    const setId = url.searchParams.get("setid");
    return setId && SET_ID_PATTERN.test(setId) ? setId.toLowerCase() : null;
  } catch {
    return null;
  }
}

export const dailyMedAdapter: OfficialSourceAdapter = {
  async search({ medicineName, selectedFormOrRoute }) {
    const url = new URL(DAILYMED_SERVICE_URL);
    url.searchParams.set("drug_name", medicineName);
    url.searchParams.set("name_type", "both");
    url.searchParams.set("pagesize", "10");

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("DailyMed search failed.");
    }

    const payload = (await response.json()) as DailyMedSearchResponse;
    const queryWords = selectedFormOrRoute.toLowerCase().split(/\s+/);
    return (payload.data ?? [])
      .map(candidateFromSearchResult)
      .filter((candidate): candidate is OfficialSourceCandidate => candidate !== null)
      .filter((candidate) =>
        queryWords.some((word) => candidate.officialTitle.toLowerCase().includes(word)),
      );
  },

  async getByIdentifier(identifier) {
    if (!SET_ID_PATTERN.test(identifier)) {
      return null;
    }

    const response = await fetch(
      `${DAILYMED_ORIGIN}/dailymed/services/v2/spls/${identifier}.xml`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      return null;
    }

    const xml = await response.text();
    const title = textFromXml(xml, "title");
    if (!title) {
      return null;
    }

    const productName = titleDetails(title).confirmedProductName;
    const formulation = attributeFromXml(xml, "formCode", "displayName") ?? titleDetails(title).formulationOrRoute;
    const route = attributeFromXml(xml, "routeCode", "displayName");
    const labeler = textFromXml(xml, "manufacturerOrganization") ?? titleDetails(title).manufacturerOrLabeler;
    const revision = attributeFromXml(xml, "effectiveTime", "value");

    return {
      confirmedProductName: productName,
      formulationOrRoute: route ? `${formulation} (${route})` : formulation,
      manufacturerOrLabeler: labeler,
      officialTitle: title,
      sourceIdentifier: identifier.toLowerCase(),
      sourceRevisionDate: revision && /^\d{8}$/.test(revision)
        ? `${revision.slice(0, 4)}-${revision.slice(4, 6)}-${revision.slice(6, 8)}`
        : null,
      sourceUrl: `${DAILYMED_LABEL_URL}${identifier.toLowerCase()}`,
    };
  },
};
