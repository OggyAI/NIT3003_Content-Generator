"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { validateEmail } from "../validation";

export type ForgotPasswordState = {
  fieldError?: string;
  sent?: boolean;
  email?: string; // sent back so the email box refills after an error
};

export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  // 1. Only check the email looks valid. This doesn't reveal whether an account exists.
  const fieldError = validateEmail(email);
  if (fieldError) return { fieldError, email };

  // 2. The link in the email comes back to THIS site (localhost or Vercel),
  //    to /auth/confirm, which logs the user in and opens /reset-password.
  const h = await headers();
  const origin = h.get("origin") ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });

  // 3. Same message whether or not the email has an account, and even if sending
  //    failed, so nobody can use this form to find out who has an account.
  if (error) console.error("resetPasswordForEmail failed:", error);
  return { sent: true };
}
