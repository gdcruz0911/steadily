import type { SupabaseClient } from "@supabase/supabase-js";

import type { MedicationRoutineInput } from "@/lib/validation/medications";

export type MedicationRoutine = MedicationRoutineInput & {
  createdAt: string;
  id: string;
  updatedAt: string;
};

type MedicationRow = {
  color_label: MedicationRoutineInput["colorLabel"];
  created_at: string;
  display_name: string;
  dose_type: MedicationRoutineInput["doseType"];
  has_loading_phase: boolean;
  id: string;
  interval_days: number;
  loading_dose_count: number | null;
  loading_interval_days: number | null;
  updated_at: string;
};

function toMedicationRoutine(row: MedicationRow): MedicationRoutine {
  return {
    colorLabel: row.color_label,
    createdAt: row.created_at,
    displayName: row.display_name,
    doseType: row.dose_type,
    hasLoadingPhase: row.has_loading_phase,
    id: row.id,
    intervalDays: row.interval_days,
    loadingDoseCount: row.loading_dose_count ?? undefined,
    loadingIntervalDays: row.loading_interval_days ?? undefined,
    updatedAt: row.updated_at,
  };
}

async function getAuthenticatedUserId(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication is required.");
  }

  return user.id;
}

function toRowInput(input: MedicationRoutineInput) {
  return {
    color_label: input.colorLabel,
    display_name: input.displayName,
    dose_type: input.doseType,
    has_loading_phase: input.hasLoadingPhase,
    interval_days: input.intervalDays,
    loading_dose_count: input.hasLoadingPhase ? input.loadingDoseCount : null,
    loading_interval_days: input.hasLoadingPhase ? input.loadingIntervalDays : null,
  };
}

export async function listMedicationRoutines(supabase: SupabaseClient) {
  const userId = await getAuthenticatedUserId(supabase);
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Unable to load medication routines.");
  }

  return (data as MedicationRow[]).map(toMedicationRoutine);
}

export async function getMedicationRoutine(supabase: SupabaseClient, id: string) {
  await getAuthenticatedUserId(supabase);
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load this medication routine.");
  }

  return data ? toMedicationRoutine(data as MedicationRow) : null;
}

export async function createMedicationRoutine(
  supabase: SupabaseClient,
  input: MedicationRoutineInput,
) {
  const userId = await getAuthenticatedUserId(supabase);
  const { data, error } = await supabase
    .from("medications")
    .insert({ ...toRowInput(input), user_id: userId })
    .select("*")
    .single();

  if (error) {
    throw new Error("Unable to save this medication routine.");
  }

  return toMedicationRoutine(data as MedicationRow);
}

export async function updateMedicationRoutine(
  supabase: SupabaseClient,
  id: string,
  input: MedicationRoutineInput,
) {
  await getAuthenticatedUserId(supabase);
  const { data, error } = await supabase
    .from("medications")
    .update(toRowInput(input))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to update this medication routine.");
  }

  return data ? toMedicationRoutine(data as MedicationRow) : null;
}

export async function deleteMedicationRoutine(supabase: SupabaseClient, id: string) {
  await getAuthenticatedUserId(supabase);
  const { error } = await supabase.from("medications").delete().eq("id", id);

  if (error) {
    throw new Error("Unable to delete this medication routine.");
  }
}
