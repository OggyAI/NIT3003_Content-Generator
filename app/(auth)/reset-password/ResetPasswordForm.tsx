"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { resetPassword, type ResetPasswordState } from "./actions";
import { PASSWORD_RULES, validateNewPassword } from "../validation";
import {
  fieldErrorClass,
  formErrorClass,
  inputClass,
  introClass,
  labelClass,
  linkClass,
  ruleClass,
  submitClass,
  titleClass,
  toggleClass,
} from "../ui";

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
      <h1 className={titleClass}>Choose a new password</h1>
      <p className={introClass}>You&apos;ll be logged in once it&apos;s saved.</p>

      {state.formError && (
        <p role="alert" className={formErrorClass}>
          {state.formError}
        </p>
      )}

      <form action={formAction} onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        {/* New password */}
        <div>
          <label htmlFor="password" className={labelClass}>
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
            <button type="button" onClick={() => setShowPassword((s) => !s)} className={toggleClass}>
              {showPassword ? "Hide" : "Show"}
              <span className="sr-only"> passwords</span>
            </button>
          </div>

          {/* Live NFR-01 checklist, same as the register form */}
          <ul id="password-rules" className="mt-2 space-y-1 text-sm">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <li key={rule.label} className={ruleClass(ok)}>
                  <span aria-hidden="true">{ok ? "✓" : "○"}</span> {rule.label}
                  <span className="sr-only">{ok ? " (met)" : " (not met)"}</span>
                </li>
              );
            })}
          </ul>
          {errors.password && <p className={fieldErrorClass}>{errors.password}</p>}
        </div>

        {/* Confirm new password */}
        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
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
            <p id="confirmPassword-error" className={fieldErrorClass}>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button type="submit" disabled={pending} aria-busy={pending} className={submitClass}>
          {pending ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}

export function LinkExpired() {
  return (
    <div role="alert" className="space-y-4">
      <h1 className={titleClass}>Reset link expired</h1>
      <p className="text-muted">
        This password reset link is invalid or has expired. Links work once and only for an hour.
      </p>
      <Link href="/forgot-password" className={`inline-block ${linkClass}`}>
        Request a new link
      </Link>
    </div>
  );
}
