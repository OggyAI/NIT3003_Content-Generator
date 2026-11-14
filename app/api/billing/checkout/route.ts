// Owner: Oggy. POST /api/billing/checkout: starts a Stripe Checkout for Pro (test mode).
// 200 { url } (the browser goes there) · 401 unauthorised · 409 already_pro
// 503 billing_unavailable (keys not set) · 502 checkout_failed
// The subscription row itself is written later by the webhook, never here.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { billingConfigured, getStripe, isProStatus } from '@/lib/billing';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  if (!billingConfigured()) return NextResponse.json({ error: 'billing_unavailable' }, { status: 503 });

  const [{ data: business }, { data: existing }] = await Promise.all([
    supabase.from('business_profile').select('id').maybeSingle(),
    supabase.from('subscriptions').select('stripe_customer_id, status').maybeSingle(),
  ]);
  if (!business) return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  if (isProStatus(existing?.status)) return NextResponse.json({ error: 'already_pro' }, { status: 409 });

  const origin = new URL(request.url).origin;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
      // Ties the payment to this business. Set here on the server, so the browser can't change it.
      client_reference_id: business.id,
      subscription_data: { metadata: { business_id: business.id } },
      ...(existing?.stripe_customer_id
        ? { customer: existing.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
      success_url: `${origin}/settings?billing=success`,
      cancel_url: `${origin}/settings?billing=cancelled`,
    });
    if (!session.url) throw new Error('Checkout session has no URL');
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[billing/checkout] failed:', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json({ error: 'checkout_failed' }, { status: 502 });
  }
}
