export const visitPrepRangeOptions = [7, 30] as const;

export type VisitPrepRangeDays = (typeof visitPrepRangeOptions)[number];

export type VisitPrepMedication = {
  id: string;
  name: string;
};

export type VisitPrepDose = {
  administeredAt: string;
  id: string;
  medicationName: string;
};

export type VisitPrepCheckin = {
  administeredAt: string;
  completedAt: string | null;
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
  status: "completed" | "pending" | "skipped";
  window: "24h" | "72h";
};

export type VisitPrepData = {
  checkins: VisitPrepCheckin[];
  doses: VisitPrepDose[];
  medications: VisitPrepMedication[];
  rangeDays: VisitPrepRangeDays;
};

const scoreLabels = {
  fatigue: "Fatigue",
  fever: "Fever",
  giSymptoms: "GI symptoms",
  headache: "Headache",
  injectionSiteReaction: "Injection-site reaction",
  jointPain: "Joint pain",
} as const;

export function parseVisitPrepRange(value: string | undefined): VisitPrepRangeDays {
  return value === "30" ? 30 : 7;
}

export function getRecordedScores(scores: VisitPrepCheckin["scores"]) {
  return (Object.entries(scores) as Array<[keyof typeof scoreLabels, number | null]>)
    .filter(([, value]) => value !== null)
    .map(([key, value]) => ({ label: scoreLabels[key], value }));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function createVisitPrepCopy(data: VisitPrepData) {
  const lines = [
    "Steadily personal record for visit discussion",
    `Date range: Last ${data.rangeDays} days`,
    "",
    "Medication routines",
  ];

  lines.push(...(data.medications.length
    ? data.medications.map((medication) => `- ${medication.name}`)
    : ["- No medication routines recorded."]));

  lines.push("", "Recorded doses");
  lines.push(...(data.doses.length
    ? data.doses.map((dose) => `- ${dose.medicationName}: ${formatDateTime(dose.administeredAt)}`)
    : ["- No doses recorded in this range."]));

  lines.push("", "Check-ins");
  if (!data.checkins.length) {
    lines.push("- No check-ins scheduled in this range.");
  }

  for (const checkin of data.checkins) {
    lines.push(
      `- ${checkin.medicationName}: ${checkin.window} check-in ${checkin.status}; scheduled ${formatDateTime(checkin.scheduledAt)}`,
    );

    if (checkin.completedAt) {
      lines.push(`  Completed: ${formatDateTime(checkin.completedAt)}`);
    }

    const scores = getRecordedScores(checkin.scores);
    if (scores.length) {
      lines.push(`  Scores: ${scores.map((score) => `${score.label}: ${score.value}`).join("; ")}`);
    }
  }

  lines.push("", "This is a personal record for discussion with a clinician, not medical advice.");
  return lines.join("\n");
}
