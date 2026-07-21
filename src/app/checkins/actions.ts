"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { completeCheckinRecord, skipCheckinRecord } from "@/db/checkins";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseCompleteCheckinFormData, parseSkipCheckinFormData } from "@/lib/validation/checkins";

export type CompleteCheckinState = {
  error?: string;
};

function refreshCheckinPaths() {
  revalidatePath("/checkins");
  revalidatePath("/dashboard");
}

export async function completeCheckin(
  _previousState: CompleteCheckinState,
  formData: FormData,
): Promise<CompleteCheckinState> {
  const parsed = parseCompleteCheckinFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the scores and try again." };
  }

  const supabase = await createSupabaseServerClient();
  try {
    await completeCheckinRecord(supabase, parsed.data);
  } catch {
    return { error: "This check-in is unavailable." };
  }

  refreshCheckinPaths();
  redirect("/checkins");
}

export async function skipCheckin(formData: FormData) {
  const parsed = parseSkipCheckinFormData(formData);
  if (!parsed.success) {
    redirect("/checkins");
  }

  const supabase = await createSupabaseServerClient();
  try {
    await skipCheckinRecord(supabase, parsed.data.checkinId);
  } catch {
    redirect("/checkins");
  }

  refreshCheckinPaths();
  redirect("/checkins");
}
