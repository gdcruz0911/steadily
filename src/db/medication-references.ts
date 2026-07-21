import type { SupabaseClient } from "@supabase/supabase-js";

import type { OfficialSourceCandidate } from "@/lib/medication-references/dailymed";

export type MedicationReference = {
  confirmedProductName: string | null;
  formulationOrRoute: string | null;
  officialTitle: string | null;
  retrievedAt: string | null;
  sourceRevisionDate: string | null;
  sourceUrl: string | null;
  status: "needs_confirmation" | "confirmed" | "unavailable";
  userConfirmedAt: string | null;
};

type MedicationReferenceRow = {
  confirmed_product_name: string | null;
  formulation_or_route: string | null;
  official_title: string | null;
  retrieved_at: string | null;
  source_revision_date: string | null;
  source_url: string | null;
  status: MedicationReference["status"];
  user_confirmed_at: string | null;
};

async function requireAuthenticatedUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication is required.");
  }
}

function toMedicationReference(row: MedicationReferenceRow): MedicationReference {
  return {
    confirmedProductName: row.confirmed_product_name,
    formulationOrRoute: row.formulation_or_route,
    officialTitle: row.official_title,
    retrievedAt: row.retrieved_at,
    sourceRevisionDate: row.source_revision_date,
    sourceUrl: row.source_url,
    status: row.status,
    userConfirmedAt: row.user_confirmed_at,
  };
}

export async function getMedicationReference(
  supabase: SupabaseClient,
  medicationId: string,
) {
  await requireAuthenticatedUser(supabase);
  const { data, error } = await supabase
    .from("medication_references")
    .select("*")
    .eq("medication_id", medicationId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load the official reference.");
  }

  return data ? toMedicationReference(data as MedicationReferenceRow) : null;
}

export async function saveConfirmedMedicationReference(
  supabase: SupabaseClient,
  medicationId: string,
  candidate: OfficialSourceCandidate,
) {
  await requireAuthenticatedUser(supabase);
  const now = new Date().toISOString();
  const { error } = await supabase.from("medication_references").upsert(
    {
      medication_id: medicationId,
      source_provider: "dailymed",
      source_identifier: candidate.sourceIdentifier,
      source_url: candidate.sourceUrl,
      official_title: candidate.officialTitle,
      confirmed_product_name: candidate.confirmedProductName,
      formulation_or_route: candidate.formulationOrRoute,
      source_revision_date: candidate.sourceRevisionDate,
      retrieved_at: now,
      user_confirmed_at: now,
      status: "confirmed",
    },
    { onConflict: "medication_id" },
  );

  if (error) {
    throw new Error("Unable to save the official reference.");
  }
}

export async function saveUnavailableMedicationReference(
  supabase: SupabaseClient,
  medicationId: string,
) {
  await requireAuthenticatedUser(supabase);
  const { error } = await supabase.from("medication_references").upsert(
    {
      medication_id: medicationId,
      source_provider: null,
      source_identifier: null,
      source_url: null,
      official_title: null,
      confirmed_product_name: null,
      formulation_or_route: null,
      source_revision_date: null,
      retrieved_at: null,
      user_confirmed_at: null,
      status: "unavailable",
    },
    { onConflict: "medication_id" },
  );

  if (error) {
    throw new Error("Unable to save the unavailable reference state.");
  }
}
