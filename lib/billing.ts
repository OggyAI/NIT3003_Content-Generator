// Owner: Oggy. Billing: Free + Pro with Stripe (plan approved by Karma 15 Nov 2026; test mode only).
// Server-only: reads STRIPE_SECRET_KEY. Never import this from a 'use client' file.
//
// - Free: FREE_MONTHLY_LIMIT successful generations per Melbourne calendar month.
// - Pro: a Stripe subscription with status active or trialing; fair-use cap PRO_MONTHLY_LIMIT.
// The price itself lives in Stripe (STRIPE_PRO_PRICE_ID); PRO_PRICE_LABEL is only the words shown.
import 'server-only';
import Stripe from 'stripe';
import type { createClient } from '@/lib/supabase/server';
import type { Plan, Subscription } from '@/lib/types';

export const FREE_MONTHLY_LIMIT = 10;
export const PRO_MONTHLY_LIMIT = 200;
export const PRO_PRICE_LABEL = 'A$19/month';

const PRO_STATUSES = new Set(['active', 'trialing']);

type ServerClient = Awaited<ReturnType<typeof createClient>>;

// Created on first use, so `npm run build` works without the Stripe keys (like lib/openai.ts)
let stripe: Stripe | null = null;
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  stripe ??= new Stripe(key, { maxNetworkRetries: 2, timeout: 20_000 });
  return stripe;
}

/** True when the keys needed to start a checkout are set */
export function billingConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRO_PRICE_ID);
}

export function isProStatus(status: string | null | undefined) {
  return !!status && PRO_STATUSES.has(status);
}

export type PlanInfo = {
  plan: Plan;
  used: number;
  limit: number;
  subscription: Subscription | null;
  /** False when the billing tables can't be read (e.g. migration 004 not run yet) */
  ready: boolean;
};

/** The signed-in business's plan and this month's usage. RLS limits both reads to its own rows. */
export async function getPlan(supabase: ServerClient): Promise<PlanInfo> {
  const [sub, usage] = await Promise.all([
    supabase.from('subscriptions').select('*').maybeSingle(),
    supabase.rpc('my_monthly_usage'),
  ]);
  if (sub.error || usage.error) {
    console.error('[billing] could not read plan:', sub.error?.code ?? usage.error?.code);
  }
  const subscription = sub.data ?? null;
  const plan: Plan = isProStatus(subscription?.status) ? 'pro' : 'free';
  return {
    plan,
    used: usage.data ?? 0,
    limit: plan === 'pro' ? PRO_MONTHLY_LIMIT : FREE_MONTHLY_LIMIT,
    subscription,
    ready: !sub.error && !usage.error,
  };
}
