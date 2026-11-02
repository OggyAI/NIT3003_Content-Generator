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
        <h1 className="text-2xl font-semibold text-slate-900">Check your email</h1>
        <p className="text-slate-600">{state.success}</p>
        <Link href="/login" className="inline-block font-medium text-[#1E3A8A] underline">
          Go to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-600">
        Set up your business once, then generate content in your brand voice.
      </p>

      {state.formError && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {state.formError}
        </p>
      )}

      <form action={formAction} onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        {/* Business name */}
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-slate-800">
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
            <p id="businessName-error" className="mt-1 text-sm text-red-600">
              {errors.businessName}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-800">
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
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email}{" "}
              {errors.email.includes("already exists") && (
                <Link href="/login" className="font-medium underline">
                  Log in
                </Link>
              )}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-800">
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
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-2 my-auto h-8 px-2 text-sm text-slate-600 hover:text-slate-900"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Live checklist: each rule ticks off as the user types (NFR-08 feedback) */}
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
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-[#1E3A8A] px-4 py-2.5 font-medium text-white hover:bg-[#1E3A8A]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
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