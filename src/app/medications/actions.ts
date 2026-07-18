"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createMedicationRoutine,
  deleteMedicationRoutine,
  updateMedicationRoutine,
} from "@/db/medications";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseMedicationRoutineFormData } from "@/lib/validation/medications";

export type MedicationFormState = {
  error?: string;
};

function getValidationError(formData: FormData) {
  const parsed = parseMedicationRoutineFormData(formData);

  if (parsed.success) {
    return { input: parsed.data };
  }

  return {
    error: parsed.error.issues[0]?.message ?? "Check the routine details.",
  };
}

export async function createMedication(
  _previousState: MedicationFormState,
  formData: FormData,
): Promise<MedicationFormState> {
  const result = getValidationError(formData);

  if ("error" in result) {
    return { error: result.error };
  }

  const supabase = await createSupabaseServerClient();

  try {
    await createMedicationRoutine(supabase, result.input);
  } catch {
    return { error: "Unable to save this medication routine." };
  }

  revalidatePath("/medications");
  redirect(formData.get("returnTo") === "dashboard" ? "/dashboard" : "/medications");
}

export async function updateMedication(
  id: string,
  _previousState: MedicationFormState,
  formData: FormData,
): Promise<MedicationFormState> {
  const result = getValidationError(formData);

  if ("error" in result) {
    return { error: result.error };
  }

  const supabase = await createSupabaseServerClient();

  try {
    const updated = await updateMedicationRoutine(supabase, id, result.input);

    if (!updated) {
      return { error: "This medication routine is unavailable." };
    }
  } catch {
    return { error: "Unable to update this medication routine." };
  }

  revalidatePath("/medications");
  redirect("/medications");
}

export async function deleteMedication(id: string) {
  const supabase = await createSupabaseServerClient();

  try {
    await deleteMedicationRoutine(supabase, id);
  } catch {
    redirect("/medications");
  }

  revalidatePath("/medications");
  redirect("/medications");
}
