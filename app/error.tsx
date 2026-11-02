"use client";
// Shown when a page crashes. "Try again" re-renders the page; the Dashboard link is a safe way out.
import { useEffect } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button, { buttonClasses } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Shows in the browser console / Vercel logs to help us debug
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 text-center sm:p-10" role="alert">
        <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-muted">
          Sorry, this page couldn&apos;t load. Please try again. If it keeps happening, go back to the dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          <Link href="/dashboard" className={buttonClasses("secondary")}>
            Dashboard
          </Link>
        </div>
      </Card>
    </main>
  );
}