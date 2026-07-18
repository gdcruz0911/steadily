"use client";

import { createBrowserClient } from "@supabase/ssr";

function getPublicSupabaseEnvironment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing public Supabase environment variables.");
  }

  return { anonKey, url };
}

export function createSupabaseBrowserClient() {
  const { anonKey, url } = getPublicSupabaseEnvironment();

  return createBrowserClient(url, anonKey);
}
