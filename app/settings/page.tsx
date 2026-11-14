// Owner: Oggy. Settings (UI overhaul Phase 2, plan approved by Karma 14 Nov 2026):
// change password, change email, content defaults and delete account, plus an Admin card for
// accounts made admin in the Supabase SQL editor (app_metadata.role = 'admin', migration 003).
// In PROTECTED (proxy.ts), so logged-out users are sent to /login first.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import { buttonClasses } from '@/components/ui/Button';
import { ShieldIcon } from '@/components/icons';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { DefaultsCard, DeleteAccountCard, EmailCard, PasswordCard } from './SettingsForms';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect('/login?next=/settings');

  // RLS returns only this user's business. The defaults columns come from migration 002;
  // until it has been run, that read fails and the defaults card says so.
  const [prefs, business, admin] = await Promise.all([
    supabase.from('business_profile').select('default_content_type, default_platform').maybeSingle(),
    supabase.from('business_profile').select('business_name').maybeSingle(),
    isAdmin(),
  ]);

  return (
    <AppShell width="narrow">
      <div className="flex flex-col gap-6">
        <PageHeader title="Settings" description="Manage your login, content defaults and account." />
        <PasswordCard />
        {/* key: remount with empty boxes after the email changes */}
        <EmailCard key={user.email} email={user.email} />
        <DefaultsCard
          ready={!prefs.error}
          initialType={prefs.data?.default_content_type ?? null}
          initialPlatform={prefs.data?.default_platform ?? null}
        />
        {/* Only for admins; /admin and the database functions check the role again themselves */}
        {admin && (
          <Card>
            <section aria-labelledby="admin-heading" className="flex flex-col items-start gap-4">
              <div>
                <h2 id="admin-heading" className="text-lg font-semibold text-ink">
                  Admin
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Your account is an admin. See every business&apos;s usage and disable or re-enable accounts.
                </p>
              </div>
              <Link href="/admin" className={buttonClasses('secondary')}>
                <ShieldIcon className="h-4 w-4" />
                Open admin
              </Link>
            </section>
          </Card>
        )}
        {/* Danger zone stays last */}
        <DeleteAccountCard businessName={business.data?.business_name ?? ''} />
      </div>
    </AppShell>
  );
}
