import type { SupabaseClient } from "@supabase/supabase-js";

import type { MedicationRoutine } from "@/db/medications";
import type { DoseInput } from "@/lib/validation/doses";

export type DoseRecord = {
  administeredAt: string;
  createdAt: string;
  id: string;
  injectionSite: string | null;
  medicationId: string;
  medicationName: string;
};

type DoseRow = {
  administered_at: string;
  created_at: string;
  id: string;
  injection_site: string | null;
  medication_id: string;
  medications: Array<{ display_name: string }> | null;
};

async function getAuthenticatedUserId(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication is required.");
  }

  return user.id;
}

function toDoseRecord(row: DoseRow): DoseRecord {
  return {
    administeredAt: row.administered_at,
    createdAt: row.created_at,
    id: row.id,
    injectionSite: row.injection_site,
    medicationId: row.medication_id,
    medicationName: row.medications?.[0]?.display_name ?? "Medication routine",
  };
}

export async function listDoseRecords(supabase: SupabaseClient) {
  const userId = await getAuthenticatedUserId(supabase);
  const { data, error } = await supabase
    .from("doses")
    .select("id, medication_id, administered_at, injection_site, created_at, medications(display_name)")
    .eq("user_id", userId)
    .order("administered_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error("Unable to load dose history.");
  }

  return (data as DoseRow[]).map(toDoseRecord);
}

export async function getLastTwoInjectionSites(
  supabase: SupabaseClient,
  medicationId: string,
) {
  const userId = await getAuthenticatedUserId(supabase);
  const { data, error } = await supabase
    .from("doses")
    .select("injection_site")
    .eq("user_id", userId)
    .eq("medication_id", medicationId)
    .not("injection_site", "is", null)
    .order("administered_at", { ascending: false })
    .limit(2);

  if (error) {
    throw new Error("Unable to load recent injection sites.");
  }

  return (data as Array<{ injection_site: string | null }>)
    .map((dose) => dose.injection_site)
    .filter((site): site is string => site !== null);
}

export async function createDoseRecord(
  supabase: SupabaseClient,
  input: DoseInput,
) {
  const userId = await getAuthenticatedUserId(supabase);
  const { data: medication, error: medicationError } = await supabase
    .from("medications")
    .select("id, dose_type")
    .eq("id", input.medicationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (medicationError || !medication) {
    throw new Error("This medication routine is unavailable.");
  }

  if (medication.dose_type !== "self_injection" && input.injectionSite) {
    throw new Error("An injection site is only available for self-injection routines.");
  }

  const { data, error } = await supabase
    .from("doses")
    .insert({
      administered_at: input.administeredAt,
      injection_site: medication.dose_type === "self_injection" ? input.injectionSite ?? null : null,
      medication_id: medication.id,
      user_id: userId,
    })
    .select("id, medication_id, administered_at, injection_site, created_at, medications(display_name)")
    .single();

  if (error) {
    throw new Error("Unable to save this dose record.");
  }

  return toDoseRecord(data as DoseRow);
}

export function getCalculatedNextDose(
  medication: MedicationRoutine,
  doses: DoseRecord[],
) {
  const mostRecent = doses.find((dose) => dose.medicationId === medication.id);
  if (!mostRecent) {
    return null;
  }

  const next = new Date(mostRecent.administeredAt);
  next.setDate(next.getDate() + medication.intervalDays);
  return next.toISOString();
}
