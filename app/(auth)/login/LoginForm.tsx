"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, type LoginState } from "./actions";
import { validateEmail } from "../validation";

const initialState: LoginState = {};

export default function LoginForm({ next }: { next: string }) {
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
      <h1 className="text-2xl font-semibold text-slate-900">Log in</h1>
      <p className="mt-1 text-sm text-slate-600">Welcome back. Log in to manage your content.</p>

      {state.formError && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {state.formError}
        </p>
      )}

      <form action={formAction} onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <input type="hidden" name="next" value={next} />

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
            defaultValue={state.email}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass(!!errors.email)}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email}
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
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
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
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-[#1E3A8A] px-4 py-2.5 font-medium text-white hover:bg-[#1E3A8A]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        New here?{" "}
        <Link href="/register" className="font-medium text-[#1E3A8A] underline">
          Create an account
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