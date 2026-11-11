"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext, validateEmail } from "../validation";

export type LoginState = {
  fieldErrors?: { email?: string; password?: string };
  formError?: string;
  email?: string; // sent back so the email box refills after an error
};

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  // 1. Basic checks before contacting Supabase
  const fieldErrors: LoginState["fieldErrors"] = {};
  const emailError = validateEmail(email);
  if (emailError) fieldErrors.email = emailError;
  if (!password) fieldErrors.password = "Enter your password.";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, email };

  // 2. Ask Supabase to check the email and password (FR-02)
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { formError: "Please confirm your email first, using the link we sent you.", email };
    }
    if (error.code === "invalid_credentials" || error.status === 400) {
      // Deliberately vague: never reveal whether the email exists.
      return { formError: "Incorrect email or password.", email };
    }
    console.error("signIn failed:", error);
    return { formError: "We couldn't log you in. Try again in a moment.", email };
  }

  // 3. Success: go where they were trying to go, or the dashboard
  redirect(safeNext(next));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}