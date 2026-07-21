import { z } from "zod";

export const injectionSites = [
  "abdomen-left",
  "abdomen-right",
  "thigh-left",
  "thigh-right",
  "upper-arm-left",
  "upper-arm-right",
] as const;

export const doseSchema = z.object({
  administeredAt: z.string().datetime({ offset: true, message: "Enter a valid date and time." }),
  injectionSite: z.enum(injectionSites).optional(),
  medicationId: z.string().uuid("Choose a medication routine."),
});

export type DoseInput = z.infer<typeof doseSchema>;

export function parseDoseFormData(formData: FormData) {
  return doseSchema.safeParse({
    administeredAt: formData.get("administeredAt"),
    injectionSite: formData.get("injectionSite") || undefined,
    medicationId: formData.get("medicationId"),
  });
}
