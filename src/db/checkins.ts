import type { SupabaseClient } from "@supabase/supabase-js";

import type { CompleteCheckinInput } from "@/lib/validation/checkins";

export type CheckinStatus = "completed" | "pending" | "skipped";
export type CheckinWindow = "24h" | "72h";

export type CheckinRecord = {
  administeredAt: string;
  completedAt: string | null;
  createdAt: string;
  doseId: string;
  id: string;
  medicationName: string;
  scheduledAt: string;
  scores: {
    fatigue: number | null;
    fever: number | null;
    giSymptoms: number | null;
    headache: number | null;
    injectionSiteReaction: number | null;
    jointPain: number | null;
  };
  status: CheckinStatus;
  window: CheckinWindow;
};

export type CheckinHistoryGroup = {
  administeredAt: string;
  doseId: string;
  medicationName: string;
  checkins: CheckinRecord[];
};

type CheckinRow = {
  completed_at: string | null;
  created_at: string;
  dose_id: string;
  doses: Array<{
    administered_at: string;
    medications: Array<{ display_name: string }> | null;
  }> | null;
  fatigue: number | null;
  fever: number | null;
  gi_symptoms: number | null;
  headache: number | null;
  id: string;
  injection_site_reaction: number | null;
  joint_pain: number | null;
  scheduled_at: string;
  status: CheckinStatus;
  window: CheckinWindow;
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

function toCheckinRecord(row: CheckinRow): CheckinRecord {
  const dose = row.doses?.[0];

  return {
    administeredAt: dose?.administered_at ?? row.scheduled_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    doseId: row.dose_id,
    id: row.id,
    medicationName: dose?.medications?.[0]?.display_name ?? "Medication routine",
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

function checkinQuery(supabase: SupabaseClient) {
  return supabase
    .from("checkins")
    .select(
      "id, dose_id, window, scheduled_at, status, completed_at, injection_site_reaction, fatigue, headache, gi_symptoms, fever, joint_pain, created_at, doses(administered_at, medications(display_name))",
    );
}

export async function listDueCheckins(supabase: SupabaseClient) {
  const userId = await getAuthenticatedUserId(supabase);
  const { data, error } = await checkinQuery(supabase)
    .eq("user_id", userId)
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true });

  if (error) {
    throw new Error("Unable to load due check-ins.");
  }

  return (data as CheckinRow[]).map(toCheckinRecord);
}

export async function listCheckinHistory(supabase: SupabaseClient) {
  const userId = await getAuthenticatedUserId(supabase);
  const { data, error } = await checkinQuery(supabase)
    .eq("user_id", userId)
    .order("scheduled_at", { ascending: true })
    .limit(100);

  if (error) {
    throw new Error("Unable to load check-in history.");
  }

  const groups = new Map<string, CheckinHistoryGroup>();
  for (const checkin of (data as CheckinRow[]).map(toCheckinRecord)) {
    const current = groups.get(checkin.doseId);
    if (current) {
      current.checkins.push(checkin);
      continue;
    }

    groups.set(checkin.doseId, {
      administeredAt: checkin.administeredAt,
      checkins: [checkin],
      doseId: checkin.doseId,
      medicationName: checkin.medicationName,
    });
  }

  return Array.from(groups.values()).sort(
    (left, right) => new Date(right.administeredAt).valueOf() - new Date(left.administeredAt).valueOf(),
  );
}

export async function completeCheckinRecord(
  supabase: SupabaseClient,
  input: CompleteCheckinInput,
) {
  const userId = await getAuthenticatedUserId(supabase);
  const { data, error } = await supabase
    .from("checkins")
    .update({
      completed_at: new Date().toISOString(),
      fatigue: input.fatigue,
      fever: input.fever,
      gi_symptoms: input.giSymptoms,
      headache: input.headache,
      injection_site_reaction: input.injectionSiteReaction,
      joint_pain: input.jointPain,
      status: "completed",
    })
    .eq("id", input.checkinId)
    .eq("user_id", userId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    throw new Error("This check-in is unavailable.");
  }
}

export async function skipCheckinRecord(supabase: SupabaseClient, checkinId: string) {
  const userId = await getAuthenticatedUserId(supabase);
  const { data, error } = await supabase
    .from("checkins")
    .update({ status: "skipped" })
    .eq("id", checkinId)
    .eq("user_id", userId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    throw new Error("This check-in is unavailable.");
  }
}
