// Owner: Oggy. Settings (UI overhaul Phase 2, plan approved by Karma 14 Nov 2026):
// change password, change email, content defaults and delete account.
// In PROTECTED (proxy.ts), so logged-out users are sent to /login first.
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import { createClient } from '@/lib/supabase/server';
import { DefaultsCard, DeleteAccountCard, EmailCard, PasswordCard } from './SettingsForms';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect('/login?next=/settings');

  // RLS returns only this user's business. The defaults columns come from migration 002;
  // until it has been run, that read fails and the defaults card says so.
  const [prefs, business] = await Promise.all([
    supabase.from('business_profile').select('default_content_type, default_platform').maybeSingle(),
    supabase.from('business_profile').select('business_name').maybeSingle(),
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
        <DeleteAccountCard businessName={business.data?.business_name ?? ''} />
      </div>
    </AppShell>
  );
}
