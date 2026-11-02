"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateRegister, type FieldErrors } from "../validation";

export type RegisterState = {
  fieldErrors?: FieldErrors;
  formError?: string;
  success?: string;
  // Sent back so the form can refill after an error (never the password).
  values?: { email: string; businessName: string };
};

const DUPLICATE_EMAIL = "An account with this email already exists. Log in instead.";

export async function register(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const businessName = String(formData.get("businessName") ?? "").trim();
  const values = { email, businessName };

  // 1. Server-side validation. Never trust the browser alone (FR-01, NFR-01).
  const fieldErrors = validateRegister({ email, password, businessName });
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values };
  }

  // 2. Create the account. Supabase hashes the password for us (bcrypt).
  //    business_name goes into user metadata; Oggy's DB trigger reads it
  //    and creates the business_profile row.
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { business_name: businessName } },
  });

  if (error) {
    if (error.code === "user_already_exists" || /already registered/i.test(error.message)) {
      return { fieldErrors: { email: DUPLICATE_EMAIL }, values };
    }
    if (error.code === "weak_password") {
      return { fieldErrors: { password: error.message }, values };
    }
    console.error("signUp failed:", error);
    return { formError: "We couldn't create your account. Try again in a moment.", values };
  }

  // 3. When email confirmation is ON, Supabase doesn't return an error for a
  //    duplicate email (to stop people probing which emails exist). Instead it
  //    returns a user with an empty identities array.
  if (data.user && data.user.identities?.length === 0) {
    return { fieldErrors: { email: DUPLICATE_EMAIL }, values };
  }

  // 4a. Email confirmation OFF (dev): user is logged in, send them to set up their profile.
  if (data.session) {
    redirect("/profile?welcome=1");
  }

  // 4b. Email confirmation ON: they need to click the link first.
  return {
    success: `Account created. We've sent a confirmation link to ${email}. Click it, then log in.`,
  };
}