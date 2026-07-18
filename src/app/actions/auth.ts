"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  authCredentialsSchema,
  type AuthFormState,
} from "@/lib/validation/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getConfirmationRedirectUrl(origin: string | null) {
  const baseUrl = origin ?? "http://localhost:3000";

  return new URL("/auth/confirm", baseUrl).toString();
}

export async function submitAuthForm(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const credentials = authCredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!credentials.success) {
    return { error: credentials.error.issues[0]?.message ?? "Check your details." };
  }

  const intent = formData.get("intent");
  const supabase = await createSupabaseServerClient();

  if (intent === "signup") {
    const requestHeaders = await headers();
    const { error } = await supabase.auth.signUp({
      email: credentials.data.email,
      password: credentials.data.password,
      options: {
        emailRedirectTo: getConfirmationRedirectUrl(
          requestHeaders.get("origin"),
        ),
      },
    });

    if (error) {
      return {
        message:
          "If this address can be used, check your email to verify your account.",
      };
    }

    return {
      message:
        "Check your email to verify your account before signing in.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword(credentials.data);

  if (error) {
    return { error: "Unable to sign in with those details." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
  redirect("/login?message=signed-out");
}
