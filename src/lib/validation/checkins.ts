import { z } from "zod";

export const checkinScoreFields = [
  "injectionSiteReaction",
  "fatigue",
  "headache",
  "giSymptoms",
  "fever",
  "jointPain",
] as const;

export const checkinScoreLabels: Record<(typeof checkinScoreFields)[number], string> = {
  fatigue: "Fatigue",
  fever: "Fever",
  giSymptoms: "GI symptoms",
  headache: "Headache",
  injectionSiteReaction: "Injection site reaction",
  jointPain: "Joint pain",
};

const score = z
  .string()
  .trim()
  .regex(/^[0-5]$/, "Choose a score from 0 to 5.")
  .transform(Number);

export const completeCheckinSchema = z.object({
  checkinId: z.string().uuid("This check-in is unavailable."),
  fatigue: score,
  fever: score,
  giSymptoms: score,
  headache: score,
  injectionSiteReaction: score,
  jointPain: score,
});

export type CompleteCheckinInput = z.infer<typeof completeCheckinSchema>;

export const skipCheckinSchema = z.object({
  checkinId: z.string().uuid("This check-in is unavailable."),
});

export function parseCompleteCheckinFormData(formData: FormData) {
  return completeCheckinSchema.safeParse({
    checkinId: formData.get("checkinId"),
    fatigue: formData.get("fatigue"),
    fever: formData.get("fever"),
    giSymptoms: formData.get("giSymptoms"),
    headache: formData.get("headache"),
    injectionSiteReaction: formData.get("injectionSiteReaction"),
    jointPain: formData.get("jointPain"),
  });
}

export function parseSkipCheckinFormData(formData: FormData) {
  return skipCheckinSchema.safeParse({ checkinId: formData.get("checkinId") });
}
