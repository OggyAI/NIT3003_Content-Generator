"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, type LoginState } from "./actions";
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
  toggleClass,
} from "../ui";

const initialState: LoginState = {};

export default function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [clientErrors, setClientErrors] = useState<LoginState["fieldErrors"]>({});
  const [showPassword, setShowPassword] = useState(false);

  const errors = { ...state.fieldErrors, ...clientErrors };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    const found: LoginState["fieldErrors"] = {};
    const emailError = validateEmail(String(fd.get("email") ?? ""));
    if (emailError) found.email = emailError;
    if (!String(fd.get("password") ?? "")) found.password = "Enter your password.";
    if (Object.keys(found).length > 0) {
      e.preventDefault();
      setClientErrors(found);
      return;
    }
    setClientErrors({});
  }

  return (
    <div>
      <h1 className={titleClass}>Log in</h1>
      <p className={introClass}>Welcome back. Log in to manage your content.</p>

      {notice && (
        <p role="status" className="mt-4 rounded-control border border-green-200 bg-success-light p-3 text-sm text-green-800">
          {notice}
        </p>
      )}

      {state.formError && (
        <p role="alert" className={formErrorClass}>
          {state.formError}
        </p>
      )}

      <form action={formAction} onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <input type="hidden" name="next" value={next} />

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
            defaultValue={state.email}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass(!!errors.email)}
          />
          {errors.email && (
            <p id="email-error" className={fieldErrorClass}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <Link href="/forgot-password" className={`text-sm ${linkClass}`}>
              Forgot your password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={inputClass(!!errors.password) + " pr-16"}
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className={toggleClass}>
              {showPassword ? "Hide" : "Show"}
              <span className="sr-only"> password</span>
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className={fieldErrorClass}>
              {errors.password}
            </p>
          )}
        </div>

        <button type="submit" disabled={pending} aria-busy={pending} className={submitClass}>
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className={footerClass}>
        New here?{" "}
        <Link href="/register" className={linkClass}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
