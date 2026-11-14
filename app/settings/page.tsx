// Owner: Oggy. Settings (Phase 2 of the UI overhaul): change password, change email,
// default content preferences and delete account.
// For now this is a placeholder so the sidebar's Settings link never 404s.
// It's in PROTECTED in proxy.ts, so logged-out users are sent to /login.
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';

export default function SettingsPage() {
  return (
    <AppShell width="narrow">
      <div className="flex flex-col gap-6">
        <PageHeader title="Settings" description="Manage your account and content defaults." />
        <EmptyState
          title="Settings are on the way"
          text="Soon you'll be able to change your password and email address, and choose the content type you start with."
        />
      </div>
    </AppShell>
  );
}
