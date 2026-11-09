import { createClient } from "@/lib/supabase/server";
import ResetPasswordForm, { LinkExpired } from "./ResetPasswordForm";

// Users arrive here from the reset email via /auth/confirm, which has just
// logged them in. No session means the link was missing, used or expired.
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? <ResetPasswordForm /> : <LinkExpired />;
}
