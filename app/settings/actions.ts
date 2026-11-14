'use server';
// Owner: Oggy. Settings server actions (UI overhaul Phase 2, plan approved by Karma 14 Nov 2026).
// Every sensitive change re-checks the current password on the server first, and every query
// uses the signed-in user's own Supabase client, so RLS applies (NFR-02). No service-role key.
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/types';
import { validateEmail, validateNewPassword } from '@/app/(auth)/validation';

type Client = SupabaseClient<Database>;

const TOO_MANY = 'Too many attempts. Wait a minute, then try again.';

// Sends logged-out requests to /login (proxy.ts normally catches them first)
async function signedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect('/login?next=/settings');
  return { supabase, userId: user.id, email: user.email };
}

/** Re-checks the current password. Returns a message for the field, or null when it's right. */
async function checkCurrentPassword(supabase: Client, email: string, password: string): Promise<string | null> {
  if (!password) return 'Enter your current password.';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) return null;
  if (error.code === 'invalid_credentials') return "That's not your current password.";
  if (error.status === 429) return TOO_MANY;
  console.error('[settings] password check failed:', error.code ?? error.message);
  return "We couldn't check your password. Try again in a moment.";
}

const hasErrors = (errors: Record<string, string | undefined>) => Object.values(errors).some(Boolean);

// ---------------------------------------------------------------------------
// Change password (NFR-01 rules, same as register and reset)

export type PasswordState = {
  fieldErrors?: { current?: string; password?: string; confirmPassword?: string };
  formError?: string;
  savedAt?: number;
};

export async function changePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const current = String(formData.get('current') ?? '');
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  const fieldErrors: NonNullable<PasswordState['fieldErrors']> = validateNewPassword(password, confirmPassword);
  if (!current) fieldErrors.current = 'Enter your current password.';
  else if (password && password === current) fieldErrors.password = 'Choose a password different from your current one.';
  if (hasErrors(fieldErrors)) return { fieldErrors };

  const { supabase, email } = await signedIn();
  const wrong = await checkCurrentPassword(supabase, email, current);
  if (wrong) return { fieldErrors: { current: wrong } };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === 'same_password') {
      return { fieldErrors: { password: 'Choose a password different from your current one.' } };
    }
    if (error.code === 'weak_password') return { fieldErrors: { password: error.message } };
    if (error.status === 429) return { formError: TOO_MANY };
    console.error('[settings] updateUser(password) failed:', error.code ?? error.message);
    return { formError: "We couldn't change your password. Try again in a moment." };
  }

  // Anyone still logged in elsewhere with the old password is logged out; this browser stays in
  const { error: signOutError } = await supabase.auth.signOut({ scope: 'others' });
  if (signOutError) console.error('[settings] signOut(others) failed:', signOutError.code ?? signOutError.message);

  return { savedAt: Date.now() };
}

// ---------------------------------------------------------------------------
// Change email. Email confirmation is OFF on this Supabase project (mailer_autoconfirm),
// so the change applies straight away; typing the new address twice guards against typos.

export type EmailState = {
  fieldErrors?: { newEmail?: string; confirmEmail?: string; current?: string };
  formError?: string;
  savedAt?: number;
  message?: string;
  // Sent back so the form can refill after an error (never the password)
  values?: { newEmail: string; confirmEmail: string };
};

export async function changeEmail(_prev: EmailState, formData: FormData): Promise<EmailState> {
  const newEmail = String(formData.get('newEmail') ?? '').trim().toLowerCase();
  const confirmEmail = String(formData.get('confirmEmail') ?? '').trim().toLowerCase();
  const current = String(formData.get('current') ?? '');
  const values = { newEmail, confirmEmail };

  const fieldErrors: NonNullable<EmailState['fieldErrors']> = {};
  const emailError = validateEmail(newEmail);
  if (emailError) fieldErrors.newEmail = emailError;
  if (!confirmEmail) fieldErrors.confirmEmail = 'Type the new email again.';
  else if (confirmEmail !== newEmail) fieldErrors.confirmEmail = "The two emails don't match.";
  if (!current) fieldErrors.current = 'Enter your current password.';
  if (hasErrors(fieldErrors)) return { fieldErrors, values };

  const { supabase, email } = await signedIn();
  if (newEmail === email.toLowerCase()) return { fieldErrors: { newEmail: "That's already your email." }, values };

  const wrong = await checkCurrentPassword(supabase, email, current);
  if (wrong) return { fieldErrors: { current: wrong }, values };

  const { data, error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) {
    if (error.code === 'email_exists' || /already (been )?registered|already exists/i.test(error.message)) {
      return { fieldErrors: { newEmail: 'That email is already used by another account.' }, values };
    }
    if (error.code === 'email_address_invalid') {
      return { fieldErrors: { newEmail: 'Enter a valid email, like name@business.com.' }, values };
    }
    if (error.status === 429) return { formError: TOO_MANY, values };
    console.error('[settings] updateUser(email) failed:', error.code ?? error.message);
    return { formError: "We couldn't change your email. Try again in a moment.", values };
  }

  revalidatePath('/settings');
  // If confirmation is ever switched on, Supabase keeps the address in new_email until it's confirmed
  const pending = Boolean(data.user?.new_email) && data.user?.email?.toLowerCase() !== newEmail;
  return {
    savedAt: Date.now(),
    message: pending
      ? `We've sent a confirmation link to ${newEmail}. Your email changes once you click it.`
      : `Your email is now ${newEmail}. Use it next time you log in.`,
  };
}
