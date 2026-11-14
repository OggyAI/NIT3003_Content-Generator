"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";
import { validateEmail } from "../validation";
import {
  fieldErrorClass,
  footerClass,
  formErrorClass,
  inputClass,
  introClass,
  labelClass,
  linkClass,
  submitClass,
  titleClass,
} from "../ui";

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
        <h1 className={titleClass}>Check your email</h1>
        <p className="text-muted">
          If that email has an account, we&apos;ve sent a link to reset your password. The link
          works once and expires after an hour.
        </p>
        <p className="text-sm text-muted">
          Didn&apos;t get it? Check your spam folder, or wait a few minutes and try again.
        </p>
        <Link href="/login" className={`inline-block ${linkClass}`}>
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className={titleClass}>Forgot your password?</h1>
      <p className={introClass}>
        Enter the email you signed up with and we&apos;ll send you a link to choose a new password.
      </p>

      {linkExpired && (
        <p role="alert" className={formErrorClass}>
          That reset link is invalid or has expired. Request a new one below.
        </p>
      )}

      <form action={formAction} onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <div>
          <label htmlFor="email" className={labelClass}>
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
            <p id="email-error" className={fieldErrorClass}>
              {error}
            </p>
          )}
        </div>

        <button type="submit" disabled={pending} aria-busy={pending} className={submitClass}>
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className={footerClass}>
        Remembered it?{" "}
        <Link href="/login" className={linkClass}>
          Log in
        </Link>
      </p>
    </div>
  );
}
