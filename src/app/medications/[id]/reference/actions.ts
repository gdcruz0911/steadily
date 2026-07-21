"use server";

import { revalidatePath } from "next/cache";

import {
  saveConfirmedMedicationReference,
  saveUnavailableMedicationReference,
} from "@/db/medication-references";
import {
  dailyMedAdapter,
  extractDailyMedSetId,
  selectedFormOrRoute,
  type OfficialSourceCandidate,
} from "@/lib/medication-references/dailymed";
import { getMedicationRoutine } from "@/db/medications";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ReferenceLookupState = {
  candidates?: OfficialSourceCandidate[];
  error?: string;
  lookupComplete?: boolean;
  status?: "confirmed" | "unavailable";
};

export async function findOfficialInformation(
  medicationId: string,
  _previousState: ReferenceLookupState,
  formData: FormData,
): Promise<ReferenceLookupState> {
  if (formData.get("lookupConsent") !== "yes") {
    return { error: "Please confirm before searching DailyMed." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const medication = await getMedicationRoutine(supabase, medicationId);
    if (!medication) {
      return { error: "This medication routine is unavailable." };
    }

    const candidates = await dailyMedAdapter.search({
      medicineName: medication.displayName,
      selectedFormOrRoute: selectedFormOrRoute(medication.doseType),
    });
    return { candidates, lookupComplete: true };
  } catch {
    return { error: "Official information is unavailable right now. Please try again later." };
  }
}

async function confirmDailyMedIdentifier(medicationId: string, identifier: string) {
  const supabase = await createSupabaseServerClient();
  const medication = await getMedicationRoutine(supabase, medicationId);
  if (!medication) {
    return { error: "This medication routine is unavailable." };
  }

  const candidate = await dailyMedAdapter.getByIdentifier(identifier);
  if (!candidate) {
    return { error: "That DailyMed record could not be verified. Please choose another official record." };
  }

  try {
    await saveConfirmedMedicationReference(supabase, medicationId, candidate);
  } catch {
    return { error: "Unable to save the official reference." };
  }

  revalidatePath(`/medications/${medicationId}/reference`);
  return { status: "confirmed" as const };
}

export async function confirmOfficialInformation(
  medicationId: string,
  _previousState: ReferenceLookupState,
  formData: FormData,
): Promise<ReferenceLookupState> {
  const identifier = formData.get("sourceIdentifier");
  if (typeof identifier !== "string") {
    return { error: "Choose an official record before confirming." };
  }

  return confirmDailyMedIdentifier(medicationId, identifier);
}

export async function verifyAdvancedOfficialInformation(
  medicationId: string,
  _previousState: ReferenceLookupState,
  formData: FormData,
): Promise<ReferenceLookupState> {
  const source = formData.get("officialSource");
  const identifier = typeof source === "string" ? extractDailyMedSetId(source) : null;
  if (!identifier) {
    return { error: "Enter a valid DailyMed SET ID or DailyMed official URL." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const medication = await getMedicationRoutine(supabase, medicationId);
    if (!medication) {
      return { error: "This medication routine is unavailable." };
    }

    const candidate = await dailyMedAdapter.getByIdentifier(identifier);
    return candidate
      ? { candidates: [candidate], lookupComplete: true }
      : { error: "That DailyMed record could not be verified. Please try another official record." };
  } catch {
    return { error: "That DailyMed record could not be verified. Please try another official record." };
  }
}

export async function markOfficialInformationUnavailable(
  medicationId: string,
): Promise<ReferenceLookupState> {
  const supabase = await createSupabaseServerClient();

  try {
    await saveUnavailableMedicationReference(supabase, medicationId);
  } catch {
    return { error: "Unable to save this reference state." };
  }

  revalidatePath(`/medications/${medicationId}/reference`);
  return { status: "unavailable" as const };
}
