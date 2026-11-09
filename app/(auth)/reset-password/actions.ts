"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateNewPassword } from "../validation";

export type ResetPasswordState = {
  fieldErrors?: { password?: string; confirmPassword?: string };
  formError?: string;
  linkExpired?: boolean;
};

export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  // 1. Same NFR-01 checks as the browser, because a request can skip the browser
  const fieldErrors = validateNewPassword(password, confirmPassword);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  // 2. The email link logged the user in. If that session has gone, the link expired.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { linkExpired: true };

  // 3. Save the new password. Supabase hashes it for us.
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") {
      return { fieldErrors: { password: "Choose a password different from your old one." } };
    }
    if (error.code === "weak_password") {
      return { fieldErrors: { password: error.message } };
    }
    if (error.code === "session_expired" || error.code === "session_not_found") {
      return { linkExpired: true };
    }
    console.error("updateUser failed:", error);
    return { formError: "We couldn't change your password. Try again in a moment." };
  }

  // 4. Done: they're logged in with the new password
  redirect("/dashboard");
}
