"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { resetPassword, type ResetPasswordState } from "./actions";
import { PASSWORD_RULES, validateNewPassword } from "../validation";

const initialState: ResetPasswordState = {};

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPassword, initialState);
  const [clientErrors, setClientErrors] = useState<ResetPasswordState["fieldErrors"]>({});
  // Controlled, so the boxes keep their value if the server sends back an error
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const errors = { ...state.fieldErrors, ...clientErrors };

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    const found = validateNewPassword(password, confirmPassword);
    if (Object.keys(found).length > 0) {
      e.preventDefault();
      setClientErrors(found);
      return;
    }
    setClientErrors({});
  }

  if (state.linkExpired) return <LinkExpired />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Choose a new password</h1>
      <p className="mt-1 text-sm text-slate-600">You&apos;ll be logged in once it&apos;s saved.</p>

      {state.formError && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {state.formError}
        </p>
      )}

      <form action={formAction} onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        {/* New password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-800">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setClientErrors((prev) => ({ ...prev, password: undefined }));
              }}
              aria-invalid={!!errors.password}
              aria-describedby="password-rules"
              className={inputClass(!!errors.password) + " pr-16"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-2 my-auto h-8 px-2 text-sm text-slate-600 hover:text-slate-900"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Live NFR-01 checklist, same as the register form */}
          <ul id="password-rules" className="mt-2 space-y-1 text-sm">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <li key={rule.label} className={ok ? "text-[#15803D]" : "text-slate-500"}>
                  <span aria-hidden="true">{ok ? "✓" : "○"}</span> {rule.label}
                  <span className="sr-only">{ok ? " (met)" : " (not met)"}</span>
                </li>
              );
            })}
          </ul>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        {/* Confirm new password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-800">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setClientErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            className={inputClass(!!errors.confirmPassword)}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-[#1E3A8A] px-4 py-2.5 font-medium text-white hover:bg-[#1E3A8A]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}

export function LinkExpired() {
  return (
    <div role="alert" className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Reset link expired</h1>
      <p className="text-slate-600">
        This password reset link is invalid or has expired. Links work once and only for an hour.
      </p>
      <Link href="/forgot-password" className="inline-block font-medium text-[#1E3A8A] underline">
        Request a new link
      </Link>
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
