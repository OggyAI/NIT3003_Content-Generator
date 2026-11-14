"use client";
// Shown when a page crashes. "Try again" calls retry(), which re-fetches the page's data and
// re-renders it (Next 16; reset() would only re-render). The dashboard link is a safe way out.
import { useEffect } from "react";
import Link from "next/link";
import StatusPage from "@/components/StatusPage";
import Button, { buttonClasses } from "@/components/ui/Button";
import { RefreshIcon } from "@/components/icons";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Shows in the browser console / Vercel logs to help us debug
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      role="alert"
      eyebrow="Something went wrong"
      title="This page couldn't load"
      text="Please try again. If it keeps happening, go back to the dashboard and try again in a few minutes."
      actions={
        <>
          <Button onClick={() => retry()}>
            <RefreshIcon className="h-4 w-4" />
            Try again
          </Button>
          <Link href="/dashboard" className={buttonClasses("secondary")}>
            Go to dashboard
          </Link>
        </>
      }
    />
  );
}
