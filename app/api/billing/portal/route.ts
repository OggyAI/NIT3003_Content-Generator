// Owner: Oggy. POST /api/billing/portal: opens Stripe's Customer Portal (cancel, change card, invoices).
// 200 { url } · 401 unauthorised · 404 no_customer · 503 billing_unavailable · 502 portal_failed
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { billingConfigured, getStripe } from '@/lib/billing';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  if (!billingConfigured()) return NextResponse.json({ error: 'billing_unavailable' }, { status: 503 });

  // RLS: only this business's row
  const { data: sub } = await supabase.from('subscriptions').select('stripe_customer_id').maybeSingle();
  if (!sub) return NextResponse.json({ error: 'no_customer' }, { status: 404 });

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${new URL(request.url).origin}/settings`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[billing/portal] failed:', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json({ error: 'portal_failed' }, { status: 502 });
  }
}
