"use client";

import { useActionState, useState } from "react";

import { submitAuthForm } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { initialAuthFormState } from "@/lib/validation/auth";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [state, formAction, isPending] = useActionState(
    submitAuthForm,
    initialAuthFormState,
  );

  const isLogin = mode === "login";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="email">
          Email address
        </label>
        <input
          autoComplete="email"
          className="min-h-12 w-full rounded-xl border bg-white px-3 text-base text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="password">
          Password
        </label>
        <input
          autoComplete={isLogin ? "current-password" : "new-password"}
          className="min-h-12 w-full rounded-xl border bg-white px-3 text-base text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
        <p className="text-sm text-[var(--muted-foreground)]">
          Use at least 8 characters.
        </p>
      </div>
      {state.error ? (
        <p aria-live="polite" className="text-sm font-medium text-[var(--error)]" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p aria-live="polite" className="text-sm font-medium text-[var(--success)]">
          {state.message}
        </p>
      ) : null}
      <Button disabled={isPending} name="intent" type="submit" value={mode}>
        {isPending ? "Please wait" : isLogin ? "Sign in" : "Create account"}
      </Button>
      <button
        className="min-h-11 rounded-xl px-1 text-sm font-medium text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        onClick={() => setMode(isLogin ? "signup" : "login")}
        type="button"
      >
        {isLogin ? "Create an account" : "I already have an account"}
      </button>
    </form>
  );
}
