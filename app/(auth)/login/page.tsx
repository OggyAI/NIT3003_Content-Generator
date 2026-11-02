import LoginForm from "./LoginForm";

// Reads ?next=/somewhere from the address (set by proxy.ts when a logged-out
// user tries to open a protected page) and passes it to the form.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginForm next={next ?? "/dashboard"} />;
}