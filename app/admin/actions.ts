'use server';
// Owner: Oggy. Admin: disable or re-enable an account (migration 003, approved Admin plan).
// admin_set_account_disabled() checks the admin role itself and refuses your own account and
// other admins; the check here just avoids a pointless call.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { isUuid } from '@/lib/validation';

export type DisableResult = { ok: true } | { ok: false; message: string };

export async function setAccountDisabled(businessId: string, disable: boolean): Promise<DisableResult> {
  if (!(await isAdmin())) return { ok: false, message: 'Only admins can do this.' };
  if (!isUuid(businessId)) return { ok: false, message: 'That business was not found.' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_set_account_disabled', {
    target_business: businessId,
    disable,
  });
  if (error) {
    console.error('[admin] admin_set_account_disabled failed:', error.code ?? error.message);
    // Messages raised by the function are written for people ("You can't disable your own account")
    const known = /own account|admin accounts|not found|admins only/i.test(error.message);
    return {
      ok: false,
      message: known ? `${error.message}.` : "We couldn't update that account. Try again in a moment.",
    };
  }

  revalidatePath('/admin');
  return { ok: true };
}
