"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";
import { validateEmail } from "../validation";

const initialState: ForgotPasswordState = {};

export default function ForgotPasswordForm({ linkExpired }: { linkExpired: boolean }) {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);
  const [clientError, setClientError] = useState<string>();

  const error = clientError ?? state.fieldError;

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    const found = validateEmail(String(new FormData(e.currentTarget).get("email") ?? ""));
    if (found) {
      e.preventDefault();
      setClientError(found);
      return;
    }
    setClientError(undefined);
  }

  if (state.sent) {
    return (
      <div role="status" className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Check your email</h1>
        <p className="text-slate-600">
          If that email has an account, we&apos;ve sent a link to reset your password. The link
          works once and expires after an hour.
        </p>
        <p className="text-sm text-slate-600">
          Didn&apos;t get it? Check your spam folder, or wait a few minutes and try again.
        </p>
        <Link href="/login" className="inline-block font-medium text-[#1E3A8A] underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Forgot your password?</h1>
      <p className="mt-1 text-sm text-slate-600">
        Enter the email you signed up with and we&apos;ll send you a link to choose a new password.
      </p>

      {linkExpired && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          That reset link is invalid or has expired. Request a new one below.
        </p>
      )}

      <form action={formAction} onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-800">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email}
            onChange={() => setClientError(undefined)}
            aria-invalid={!!error}
            aria-describedby={error ? "email-error" : undefined}
            className={inputClass(!!error)}
          />
          {error && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-[#1E3A8A] px-4 py-2.5 font-medium text-white hover:bg-[#1E3A8A]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-[#1E3A8A] underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    "mt-1 block w-full rounded-md border px-3 py-2 text-slate-900 shadow-sm",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]",
    hasError ? "border-red-500" : "border-slate-300",
  ].join(" ");
}
