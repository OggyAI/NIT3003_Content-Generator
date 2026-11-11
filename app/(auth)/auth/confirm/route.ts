// /auth/confirm: where the link in Supabase's password reset email lands.
// It swaps the one-time code in the link for a login session (cookies),
// then sends the user on to ?next= (normally /reset-password).
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "../../validation";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next") ?? "/dashboard");

  const supabase = await createClient();
  let ok = false;

  if (code) {
    // Default Supabase email link (PKCE). Only works in the same browser that
    // asked for the reset, because that browser holds the matching secret cookie.
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) console.error("exchangeCodeForSession failed:", error);
    ok = !error;
  } else if (tokenHash && type) {
    // Link style used if the email template is changed to send token_hash.
    // Works in any browser.
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) console.error("verifyOtp failed:", error);
    ok = !error;
  }

  if (ok) return NextResponse.redirect(new URL(next, origin));

  // Missing, used or expired link: ask for a new one
  return NextResponse.redirect(new URL("/forgot-password?error=link", origin));
}
