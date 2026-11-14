// Owner: Oggy — FR-07 to FR-10 generate content. Rebuilt for the UI overhaul (CLAUDE.md §2.2).
// Server part: shows who we're writing for, and checks the profile is complete (§1.7)
// before showing the form. /api/generate checks again before calling the model.
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import { buttonClasses } from '@/components/ui/Button';
import { AlertIcon, StoreIcon } from '@/components/icons';
import { createClient } from '@/lib/supabase/server';
import { getBusinessContext } from '@/lib/business-context';
import { VOICE_LABELS, listInWords } from '@/lib/display';
import GenerateForm from './GenerateForm';

export default async function GeneratePage() {
  const supabase = await createClient();
  const [ctx, prefs] = await Promise.all([
    getBusinessContext(supabase),
    // Settings › Content defaults (migration 002). If the columns aren't there yet the read
    // fails, and the form simply starts on Social post / Instagram as before.
    supabase.from('business_profile').select('default_content_type, default_platform').maybeSingle(),
  ]);
  const initialType = prefs.error ? null : (prefs.data?.default_content_type ?? null);
  const initialPlatform = prefs.error ? null : (prefs.data?.default_platform ?? null);
  const missing = ctx?.missing ?? ['business profile'];
  const voice = ctx?.voice ? VOICE_LABELS[ctx.voice] : null;

  return (
    <AppShell width="narrow">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Create content"
          description="Pick a format, tell us what to write, and we'll draft it in your brand voice."
          meta={
            ctx ? (
              <>
                <span>
                  Writing for <span className="font-medium text-ink">{ctx.businessName}</span>
                </span>
                {voice && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{voice} voice</span>
                  </>
                )}
                <Link
                  href="/profile"
                  className="rounded font-medium text-navy underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  Edit profile
                </Link>
              </>
            ) : undefined
          }
        />

        {missing.length > 0 ? (
          <div
            role="alert"
            className="flex flex-col items-start gap-3 rounded-card border border-amber-200 bg-warning-light p-4 sm:p-6"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
              <AlertIcon className="h-5 w-5 text-amber-700" />
              Finish your business profile first
            </h2>
            <p className="text-sm leading-6 text-amber-900">
              We need your {listInWords(missing)} to write content that sounds like your business.
            </p>
            <Link href="/profile" className={buttonClasses()}>
              <StoreIcon />
              Complete business profile
            </Link>
          </div>
        ) : (
          <Card>
            <GenerateForm voice={voice} initialType={initialType} initialPlatform={initialPlatform} />
          </Card>
        )}
      </div>
    </AppShell>
  );
}
