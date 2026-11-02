// Shown for any URL that doesn't match a page.
import Link from "next/link";
import Card from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 text-center sm:p-10">
        <p className="text-sm font-semibold text-teal-700">404</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-2 text-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link href="/dashboard" className={`${buttonClasses()} mt-6`}>
          Back to Dashboard
        </Link>
      </Card>
    </main>
  );
}