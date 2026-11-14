import LoginForm from "./LoginForm";

// Reads ?next=/somewhere from the address (set by proxy.ts when a logged-out
// user tries to open a protected page) and passes it to the form.
// ?deleted=1 comes from Settings › Delete account.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; deleted?: string }>;
}) {
  const { next, deleted } = await searchParams;
  return (
    <LoginForm
      next={next ?? "/dashboard"}
      notice={deleted === "1" ? "Your account and all its drafts have been deleted." : undefined}
    />
  );
}