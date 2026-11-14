// Owner: Oggy — FR-12/FR-13 content editor (Figure 1.6). Rebuilt for the UI overhaul (CLAUDE.md §2.2).
// Server part: loads the content item and the saved brand voice (for the tone check's wording).
// RLS means another business's item comes back empty, so it shows "not found" without
// revealing it exists (NFR-02).
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import { buttonClasses } from '@/components/ui/Button';
import { ArrowLeftIcon } from '@/components/icons';
import { createClient } from '@/lib/supabase/server';
import { isUuid } from '@/lib/validation';
import { VOICE_LABELS } from '@/lib/display';
import EditorForm from './EditorForm';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: content }, { data: brand }] = await Promise.all([
    isUuid(id)
      ? supabase
          .from('generated_content')
          .select('id, content_type, title, body, keywords, seo_score, tone_match, created_at, updated_at')
          .eq('id', id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('brand_voice').select('voice').maybeSingle(),
  ]);

  if (!content) {
    return (
      <AppShell width="narrow">
        <PageHeader
          title="Draft not found"
          description="This draft doesn't exist, was deleted, or belongs to another account."
          actions={
            <Link href="/history" className={buttonClasses()}>
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Draft history
            </Link>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell width="editor">
      {/* key forces a fresh form when navigating between items */}
      <EditorForm key={content.id} content={content} voice={brand?.voice ? VOICE_LABELS[brand.voice] : null} />
    </AppShell>
  );
}
