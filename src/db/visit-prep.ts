import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  VisitPrepCheckin,
  VisitPrepData,
  VisitPrepDose,
  VisitPrepMedication,
  VisitPrepRangeDays,
} from "@/lib/visit-prep";

type MedicationRelation = Array<{ display_name: string }> | { display_name: string } | null;

type DoseRelation = Array<{
  administered_at: string;
  medications: MedicationRelation;
}> | {
  administered_at: string;
  medications: MedicationRelation;
} | null;

type DoseRow = {
  administered_at: string;
  id: string;
  medications: MedicationRelation;
};

type CheckinRow = {
  completed_at: string | null;
  dose_id: string;
  doses: DoseRelation;
  fatigue: number | null;
  fever: number | null;
  gi_symptoms: number | null;
  headache: number | null;
  id: string;
  injection_site_reaction: number | null;
  joint_pain: number | null;
  scheduled_at: string;
  status: VisitPrepCheckin["status"];
  window: VisitPrepCheckin["window"];
};

function relatedMedicationName(medications: MedicationRelation) {
  const medication = Array.isArray(medications) ? medications[0] : medications;
  return medication?.display_name ?? "Medication routine";
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

function rangeStart(rangeDays: VisitPrepRangeDays, now: Date) {
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - rangeDays);
  return start.toISOString();
}

function toVisitPrepDose(row: DoseRow): VisitPrepDose {
  return {
    administeredAt: row.administered_at,
    id: row.id,
    medicationName: relatedMedicationName(row.medications),
  };
}

function toVisitPrepCheckin(row: CheckinRow): VisitPrepCheckin {
  const dose = Array.isArray(row.doses) ? row.doses[0] : row.doses;

  return {
    administeredAt: dose?.administered_at ?? row.scheduled_at,
    completedAt: row.completed_at,
    doseId: row.dose_id,
    id: row.id,
    medicationName: relatedMedicationName(dose?.medications ?? null),
    scheduledAt: row.scheduled_at,
    scores: {
      fatigue: row.fatigue,
      fever: row.fever,
      giSymptoms: row.gi_symptoms,
      headache: row.headache,
      injectionSiteReaction: row.injection_site_reaction,
      jointPain: row.joint_pain,
    },
    status: row.status,
    window: row.window,
  };
}

export async function getVisitPrepData(
  supabase: SupabaseClient,
  rangeDays: VisitPrepRangeDays,
) {
  const userId = await getAuthenticatedUserId(supabase);
  const now = new Date();
  const start = rangeStart(rangeDays, now);
  const end = now.toISOString();

  const [medicationsResult, dosesResult, checkinsResult] = await Promise.all([
    supabase
      .from("medications")
      .select("id, display_name")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("doses")
      .select("id, administered_at, medications(display_name)")
      .eq("user_id", userId)
      .gte("administered_at", start)
      .lte("administered_at", end)
      .order("administered_at", { ascending: false }),
    supabase
      .from("checkins")
      .select("id, dose_id, window, scheduled_at, status, completed_at, injection_site_reaction, fatigue, headache, gi_symptoms, fever, joint_pain, doses(administered_at, medications(display_name))")
      .eq("user_id", userId)
      .gte("scheduled_at", start)
      .lte("scheduled_at", end)
      .order("scheduled_at", { ascending: false }),
  ]);

  if (medicationsResult.error || dosesResult.error || checkinsResult.error) {
    throw new Error("Unable to load visit preparation records.");
  }

  return {
    checkins: (checkinsResult.data as CheckinRow[]).map(toVisitPrepCheckin),
    doses: (dosesResult.data as DoseRow[]).map(toVisitPrepDose),
    medications: (medicationsResult.data as Array<{ display_name: string; id: string }>).map(
      (medication): VisitPrepMedication => ({ id: medication.id, name: medication.display_name }),
    ),
    rangeDays,
  } satisfies VisitPrepData;
}
