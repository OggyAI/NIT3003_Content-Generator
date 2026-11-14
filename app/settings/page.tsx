// Owner: Oggy. Settings (UI overhaul Phase 2, plan approved by Karma 14 Nov 2026):
// change password, change email, content defaults and delete account.
// In PROTECTED (proxy.ts), so logged-out users are sent to /login first.
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import { createClient } from '@/lib/supabase/server';
import { EmailCard, PasswordCard } from './SettingsForms';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect('/login?next=/settings');

  return (
    <AppShell width="narrow">
      <div className="flex flex-col gap-6">
        <PageHeader title="Settings" description="Manage your login, content defaults and account." />
        <PasswordCard />
        {/* key: remount with empty boxes after the email changes */}
        <EmailCard key={user.email} email={user.email} />
      </div>
    </AppShell>
  );
}
