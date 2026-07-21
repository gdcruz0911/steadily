"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createDoseRecord } from "@/db/doses";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseDoseFormData } from "@/lib/validation/doses";

export type DoseFormState = {
  error?: string;
};

export async function createDose(
  _previousState: DoseFormState,
  formData: FormData,
): Promise<DoseFormState> {
  const parsed = parseDoseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check this dose record." };
  }

  const supabase = await createSupabaseServerClient();
  try {
    await createDoseRecord(supabase, parsed.data);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("An injection site")) {
      return { error: error.message };
    }

    return { error: "Unable to save this dose record." };
  }

  revalidatePath("/doses");
  revalidatePath("/dashboard");
  redirect("/doses");
}
