// Owner: Oggy — FR-07 to FR-10 generate content (Figures 1.4, 1.5).
// Server part: checks the profile is complete before showing the form.
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/ui/Card';
import { buttonClasses } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import { getBusinessContext } from '@/lib/business-context';
import GenerateForm from './GenerateForm';

export default async function GeneratePage() {
  const supabase = await createClient();
  const ctx = await getBusinessContext(supabase);
  const missing = ctx?.missing ?? ['business profile'];

  return (
    // Main navigation sidebar (not the "steps" variant) so users can always get
    // back to the dashboard, history and profile from here (NFR-09 navigation).
    <AppShell sidebar={<Sidebar title="Create Content" subtitle="Turn your business profile into on-brand content." />}>
      <Card className="p-8 sm:p-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Generate Content</h1>
          <p className="mt-2 text-muted">
            Choose what to create{ctx ? ` for ${ctx.businessName}` : ''} and we&apos;ll write it in your brand voice.
          </p>
        </header>

        {missing.length > 0 ? (
          <div role="alert" className="rounded-control bg-warning-light p-6 text-center">
            <p className="font-semibold text-gray-900">Finish your business profile first</p>
            <p className="mt-2 text-sm text-amber-800">Still needed: {missing.join(', ')}.</p>
            <Link href="/profile" className={`${buttonClasses()} mt-4`}>
              Complete profile
            </Link>
          </div>
        ) : (
          <GenerateForm />
        )}
      </Card>
    </AppShell>
  );
}
