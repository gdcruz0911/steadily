import { z } from "zod";

export const medicationColorLabels = ["teal", "blue", "green", "amber", "rose"] as const;
export const medicationDoseTypes = [
  "self_injection",
  "clinic_infusion",
  "oral",
] as const;

export const medicationRoutineSchema = z
  .object({
    colorLabel: z.enum(medicationColorLabels),
    displayName: z.string().trim().min(1, "Enter a display name.").max(100),
    doseType: z.enum(medicationDoseTypes),
    hasLoadingPhase: z.boolean(),
    intervalDays: z.coerce.number().int().positive("Enter an interval of at least 1 day."),
    loadingDoseCount: z.coerce.number().int().positive().optional(),
    loadingIntervalDays: z.coerce.number().int().positive().optional(),
  })
  .superRefine((value, context) => {
    if (value.hasLoadingPhase && !value.loadingDoseCount) {
      context.addIssue({
        code: "custom",
        message: "Enter the number of loading doses.",
        path: ["loadingDoseCount"],
      });
    }

    if (value.hasLoadingPhase && !value.loadingIntervalDays) {
      context.addIssue({
        code: "custom",
        message: "Enter the loading interval.",
        path: ["loadingIntervalDays"],
      });
    }
  });

export type MedicationRoutineInput = z.infer<typeof medicationRoutineSchema>;

export function parseMedicationRoutineFormData(formData: FormData) {
  return medicationRoutineSchema.safeParse({
    colorLabel: formData.get("colorLabel"),
    displayName: formData.get("displayName"),
    doseType: formData.get("doseType"),
    hasLoadingPhase: formData.get("hasLoadingPhase") === "on",
    intervalDays: formData.get("intervalDays"),
    loadingDoseCount: formData.get("loadingDoseCount") || undefined,
    loadingIntervalDays: formData.get("loadingIntervalDays") || undefined,
  });
}
