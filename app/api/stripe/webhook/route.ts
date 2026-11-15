// Owner: Oggy. POST /api/stripe/webhook: Stripe tells us about subscriptions (plan approved 15 Nov 2026).
//
// - Every request is checked against STRIPE_WEBHOOK_SECRET first; anything unsigned gets 400 and
//   changes nothing.
// - The only place that uses the service-role client (lib/supabase/admin.ts), because Stripe
//   calls without a user session. It only ever writes the subscriptions table.
// - Each event re-reads the subscription from Stripe, so events arriving out of order can't leave
//   an old status behind. Writes are upserts, so Stripe's retries are harmless.
// - Logs event ids and types only: never keys, emails or card details.
// 200 { received: true } · 400 invalid_signature · 500 (Stripe retries later)
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/billing';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { isUuid } from '@/lib/validation';

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === 'string' ? v : (v?.id ?? null));

async function syncSubscription(subscriptionId: string, businessHint: string | null) {
  const stripe = getStripe();
  const db = createServiceRoleClient();
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = idOf(sub.customer);
  if (!customerId) return;

  // Which business: the id we put in the metadata at checkout, else the row already linked to this customer
  let businessId = isUuid(sub.metadata?.business_id) ? sub.metadata.business_id : businessHint;
  if (!businessId) {
    const { data } = await db.from('subscriptions').select('business_id').eq('stripe_customer_id', customerId).maybeSingle();
    businessId = data?.business_id ?? null;
  }
  if (!businessId) {
    console.warn('[stripe/webhook] no business for subscription', sub.id);
    return;
  }

  // Newer API versions keep the period on the item; cancel_at is set when it's due to end
  const item = sub.items.data[0];
  const endsAt = sub.cancel_at ?? item?.current_period_end ?? null;
  const { error } = await db.from('subscriptions').upsert(
    {
      business_id: businessId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status: sub.status,
      price_id: item?.price.id ?? null,
      current_period_end: endsAt ? new Date(endsAt * 1000).toISOString() : null,
      cancel_at_period_end: sub.cancel_at_period_end || sub.cancel_at !== null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'business_id' },
  );
  if (error) throw new Error(`upsert failed: ${error.code}`);
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');
  if (!secret || !signature) return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });

  // The signature covers the exact raw body, so read it as text before anything parses it
  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const subscriptionId = idOf(session.subscription);
        const businessId = isUuid(session.client_reference_id) ? session.client_reference_id : null;
        if (session.mode === 'subscription' && subscriptionId) await syncSubscription(subscriptionId, businessId);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(event.data.object.id, null);
        break;
      default:
        // Not one we use; say thanks so Stripe doesn't retry it
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhook] ${event.type} ${event.id} failed:`, err instanceof Error ? err.message : 'unknown');
    return NextResponse.json({ error: 'processing_failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
