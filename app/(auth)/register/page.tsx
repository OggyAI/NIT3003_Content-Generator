"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { register, type RegisterState } from "./actions";
import {
  PASSWORD_RULES,
  validateRegister,
  type FieldErrors,
  type RegisterFields,
} from "../validation";
import {
  fieldErrorClass,
  footerClass,
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

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, initialState);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Browser errors (instant) take priority; otherwise show what the server sent back.
  const errors: FieldErrors = { ...state.fieldErrors, ...clientErrors };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    const fields: RegisterFields = {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
      businessName: String(fd.get("businessName") ?? ""),
    };
    const found = validateRegister(fields);
    if (Object.keys(found).length > 0) {
      e.preventDefault(); // stops the server action from running
      setClientErrors(found);
      return;
    }
    setClientErrors({});
  }

  function clearError(field: keyof RegisterFields) {
    if (!clientErrors[field]) return;
    setClientErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  if (state.success) {
    return (
      <div role="status" className="space-y-4">
        <h1 className={titleClass}>Check your email</h1>
        <p className="text-muted">{state.success}</p>
        <Link href="/login" className={`inline-block ${linkClass}`}>
          Go to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className={titleClass}>Create your account</h1>
      <p className={introClass}>Set up your business once, then generate content in your brand voice.</p>

      {state.formError && (
        <p role="alert" className={formErrorClass}>
          {state.formError}
        </p>
      )}

      <form action={formAction} onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        {/* Business name */}
        <div>
          <label htmlFor="businessName" className={labelClass}>
            Business name
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            autoComplete="organization"
            defaultValue={state.values?.businessName}
            onChange={() => clearError("businessName")}
            aria-invalid={!!errors.businessName}
            aria-describedby={errors.businessName ? "businessName-error" : undefined}
            className={inputClass(!!errors.businessName)}
          />
          {errors.businessName && (
            <p id="businessName-error" className={fieldErrorClass}>
              {errors.businessName}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values?.email}
            onChange={() => clearError("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass(!!errors.email)}
          />
          {errors.email && (
            <p id="email-error" className={fieldErrorClass}>
              {errors.email}{" "}
              {errors.email.includes("already exists") && (
                <Link href="/login" className={linkClass}>
                  Log in
                </Link>
              )}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className={labelClass}>
            Password
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
                clearError("password");
              }}
              aria-invalid={!!errors.password}
              aria-describedby="password-rules"
              className={inputClass(!!errors.password) + " pr-16"}
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className={toggleClass}>
              {showPassword ? "Hide" : "Show"}
              <span className="sr-only"> password</span>
            </button>
          </div>

          {/* Live checklist: each rule ticks off as the user types (NFR-08 feedback) */}
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

        <button type="submit" disabled={pending} aria-busy={pending} className={submitClass}>
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className={footerClass}>
        Already have an account?{" "}
        <Link href="/login" className={linkClass}>
          Log in
        </Link>
      </p>
    </div>
  );
}
