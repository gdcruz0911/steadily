import { z } from "zod";

export const authCredentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must contain at least 8 characters.").max(72),
});

export type AuthFormState = {
  error?: string;
  message?: string;
};

export const initialAuthFormState: AuthFormState = {};
