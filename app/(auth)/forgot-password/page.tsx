import ForgotPasswordForm from "./ForgotPasswordForm";

// /auth/confirm sends people here with ?error=link when a reset link is
// invalid or expired, so the form can tell them to request a new one.
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <ForgotPasswordForm linkExpired={error === "link"} />;
}
