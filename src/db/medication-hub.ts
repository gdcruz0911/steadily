import type { SupabaseClient } from "@supabase/supabase-js";

export type MedicationHubCard = {
  doseTypeLabel: string;
  id: string;
  lastDoseAt: string | null;
  name: string;
  officialInformation: {
    sourceUrl: string | null;
    status: "confirmed" | "needs_confirmation" | "unavailable";
  };
  pendingCheckinCount: number;
  routeOrForm: string | null;
};

type MedicationRow = {
  display_name: string;
  dose_type: "clinic_infusion" | "oral" | "self_injection";
  id: string;
};

type DoseRow = {
  administered_at: string;
  medication_id: string;
};

type DoseRelation = Array<{ medication_id: string }> | { medication_id: string } | null;

type CheckinRow = {
  doses: DoseRelation;
};

type ReferenceRow = {
  formulation_or_route: string | null;
  medication_id: string;
  source_url: string | null;
  status: MedicationHubCard["officialInformation"]["status"];
};

const doseTypeLabels = {
  clinic_infusion: "Clinic infusion routine",
  oral: "Oral routine",
  self_injection: "Self-injection routine",
} as const;

async function getAuthenticatedUserId(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication is required.");
  }

  return user.id;
}

function relatedMedicationId(doses: DoseRelation) {
  const dose = Array.isArray(doses) ? doses[0] : doses;
  return dose?.medication_id ?? null;
}

export async function listMedicationHubCards(supabase: SupabaseClient) {
  const userId = await getAuthenticatedUserId(supabase);
  const { data: medicationData, error: medicationError } = await supabase
    .from("medications")
    .select("id, display_name, dose_type")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (medicationError) {
    throw new Error("Unable to load medication routines.");
  }

  const medications = medicationData as MedicationRow[];
  if (!medications.length) {
    return [] as MedicationHubCard[];
  }

  const medicationIds = medications.map((medication) => medication.id);
  const [dosesResult, checkinsResult, referencesResult] = await Promise.all([
    supabase
      .from("doses")
      .select("medication_id, administered_at")
      .eq("user_id", userId)
      .in("medication_id", medicationIds)
      .order("administered_at", { ascending: false }),
    supabase
      .from("checkins")
      .select("doses(medication_id)")
      .eq("user_id", userId)
      .eq("status", "pending"),
    supabase
      .from("medication_references")
      .select("medication_id, status, source_url, formulation_or_route")
      .in("medication_id", medicationIds),
  ]);

  if (dosesResult.error || checkinsResult.error || referencesResult.error) {
    throw new Error("Unable to load medication hub records.");
  }

  const mostRecentDoseByMedication = new Map<string, string>();
  for (const dose of dosesResult.data as DoseRow[]) {
    if (!mostRecentDoseByMedication.has(dose.medication_id)) {
      mostRecentDoseByMedication.set(dose.medication_id, dose.administered_at);
    }
  }

  const pendingCheckinsByMedication = new Map<string, number>();
  for (const checkin of checkinsResult.data as CheckinRow[]) {
    const medicationId = relatedMedicationId(checkin.doses);
    if (medicationId && medicationIds.includes(medicationId)) {
      pendingCheckinsByMedication.set(
        medicationId,
        (pendingCheckinsByMedication.get(medicationId) ?? 0) + 1,
      );
    }
  }

  const referencesByMedication = new Map(
    (referencesResult.data as ReferenceRow[]).map((reference) => [reference.medication_id, reference]),
  );

  return medications.map((medication): MedicationHubCard => {
    const reference = referencesByMedication.get(medication.id);

    return {
      doseTypeLabel: doseTypeLabels[medication.dose_type],
      id: medication.id,
      lastDoseAt: mostRecentDoseByMedication.get(medication.id) ?? null,
      name: medication.display_name,
      officialInformation: {
        sourceUrl: reference?.status === "confirmed" ? reference.source_url : null,
        status: reference?.status ?? "needs_confirmation",
      },
      pendingCheckinCount: pendingCheckinsByMedication.get(medication.id) ?? 0,
      routeOrForm: reference?.status === "confirmed" ? reference.formulation_or_route : null,
    };
  });
}
