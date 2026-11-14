// Shown for any URL that doesn't match a page.
import Link from "next/link";
import StatusPage from "@/components/StatusPage";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <StatusPage
      eyebrow="404 · Page not found"
      title="We can't find that page"
      text="The link may be broken, or the page may have moved. Check the address, or go back to your dashboard."
      actions={
        <>
          <Link href="/dashboard" className={buttonClasses()}>
            Go to dashboard
          </Link>
          <Link href="/history" className={buttonClasses("secondary")}>
            Draft history
          </Link>
        </>
      }
    />
  );
}
