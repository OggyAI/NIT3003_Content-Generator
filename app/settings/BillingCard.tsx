'use client';
// Owner: Oggy. Settings › Plan and billing (plan approved by Karma 15 Nov 2026; Stripe test mode).
// Free: this month's usage and Upgrade to Pro (Stripe Checkout). Pro: renewal date and Manage
// billing (Stripe Customer Portal). The plan itself only changes when Stripe's webhook says so,
// so after Checkout the page refreshes a few times until the webhook has landed.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { AlertIcon, CheckIcon, SparkleIcon } from '@/components/icons';
import type { Plan } from '@/lib/types';

type BillingCardProps = {
  plan: Plan;
  used: number;
  limit: number;
  priceLabel: string;
  /** Already formatted on the server, e.g. "15 Dec 2026" */
  periodEnd: string | null;
  ending: boolean;
  /** Stripe status, e.g. past_due when a renewal payment failed */
  status: string | null;
  hasCustomer: boolean;
  configured: boolean;
  returned: 'success' | 'cancelled' | null;
};

const ERRORS: Record<string, string> = {
  billing_unavailable: "Payments aren't set up on this site yet.",
  already_pro: "You're already on Pro. Refresh the page to see it.",
  no_customer: "We couldn't find your billing account. Upgrade first.",
};

export default function BillingCard(props: BillingCardProps) {
  const { plan, used, limit, priceLabel, periodEnd, ending, status, hasCustomer, configured, returned } = props;
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activating = returned === 'success' && plan === 'free';

  // Back from Checkout but the webhook hasn't arrived yet: re-read the plan a few times
  useEffect(() => {
    if (!activating) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      router.refresh();
      if (tries >= 6) clearInterval(timer);
    }, 2500);
    return () => clearInterval(timer);
  }, [activating, router]);

  async function go(path: '/api/billing/checkout' | '/api/billing/portal') {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(path, { method: 'POST' });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (data?.url) {
        window.location.assign(data.url);
        return; // stay pending while the browser leaves
      }
      setError(ERRORS[data?.error ?? ''] ?? "We couldn't open Stripe just now. Try again in a moment.");
    } catch {
      setError("We couldn't reach the server. Check your connection, then try again.");
    }
    setPending(false);
  }

  const percent = Math.min(100, Math.round((used / limit) * 100));
  const paymentProblem = status === 'past_due' || status === 'unpaid';

  return (
    <Card id="billing" className="scroll-mt-24">
      <section aria-labelledby="billing-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="billing-heading" className="text-lg font-semibold text-ink">
              Plan and billing
            </h2>
            <p className="mt-1 text-sm text-muted">
              {plan === 'pro'
                ? `Pro, ${priceLabel}. Up to ${limit} generations a month.`
                : `Free plan: ${limit} generations a month. Pro gives you more for ${priceLabel}.`}
            </p>
          </div>
          <Badge variant={plan === 'pro' ? 'info' : 'neutral'}>{plan === 'pro' ? 'Pro' : 'Free'}</Badge>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-ink">
            <span className="font-semibold">{Math.min(used, limit)}</span> of {limit} generations used this month
          </p>
          <div
            role="progressbar"
            aria-label="Generations used this month"
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-valuenow={Math.min(used, limit)}
            className="h-2 overflow-hidden rounded-full bg-navy-50"
          >
            <div
              className={`h-full rounded-full ${percent >= 100 ? 'bg-warning' : 'bg-teal'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-sm text-muted">Resets on the 1st of each month (Melbourne time).</p>
        </div>

        {plan === 'pro' && periodEnd && (
          <p className="text-sm text-ink">
            {ending ? `Your Pro plan ends on ${periodEnd}. You won't be charged again.` : `Renews on ${periodEnd}.`}
          </p>
        )}

        {paymentProblem && (
          <p role="alert" className="flex items-start gap-2 text-sm text-danger">
            <AlertIcon className="mt-0.5 h-5 w-5" />
            Your last payment didn&apos;t go through. Update your card under Manage billing to keep Pro.
          </p>
        )}

        <p role="status" aria-live="polite" className="text-sm font-medium text-green-700">
          {activating && 'Payment received, thank you. Turning on Pro, which takes a few seconds…'}
          {returned === 'success' && plan === 'pro' && (
            <span className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4" />
              Pro is on. Thanks for upgrading.
            </span>
          )}
        </p>
        {returned === 'cancelled' && plan === 'free' && (
          <p className="text-sm text-muted">Checkout was cancelled, so nothing was charged.</p>
        )}

        {error && (
          <p role="alert" className="flex items-start gap-2 text-sm text-danger">
            <AlertIcon className="mt-0.5 h-5 w-5" />
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {plan === 'free' && configured && !activating && (
            <Button loading={pending} onClick={() => go('/api/billing/checkout')}>
              {!pending && <SparkleIcon className="h-4 w-4" />}
              {pending ? 'Opening checkout…' : `Upgrade to Pro, ${priceLabel}`}
            </Button>
          )}
          {hasCustomer && configured && (
            <Button
              variant={plan === 'pro' ? 'secondary' : 'ghost'}
              loading={pending && plan === 'pro'}
              disabled={pending}
              onClick={() => go('/api/billing/portal')}
            >
              Manage billing
            </Button>
          )}
          {!configured && <p className="text-sm text-muted">Payments aren&apos;t set up on this site yet.</p>}
        </div>
        <p className="text-xs text-muted">Payments are handled by Stripe. We never see or store your card details.</p>
      </section>
    </Card>
  );
}
