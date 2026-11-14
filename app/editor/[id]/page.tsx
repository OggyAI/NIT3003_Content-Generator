// Owner: Oggy — FR-12/FR-13 content editor (Figure 1.6).
// Server part: loads the content item. RLS means another business's item
// comes back empty, so it shows "not found" without revealing it exists.
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import { buttonClasses } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import { isUuid } from '@/lib/validation';
import EditorForm from './EditorForm';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: content } = isUuid(id)
    ? await supabase
        .from('generated_content')
        .select('id, content_type, title, body, keywords, seo_score, tone_match, created_at, updated_at')
        .eq('id', id)
        .maybeSingle()
    : { data: null };

  if (!content) {
    return (
      <AppShell width="narrow">
        <Card className="p-8 text-center sm:p-10">
          <h1 className="text-2xl font-bold text-gray-900">Content not found</h1>
          <p className="mt-2 text-muted">
            This item doesn&apos;t exist, was deleted, or belongs to another account.
          </p>
          <Link href="/history" className={`${buttonClasses()} mt-6`}>
            Back to Draft History
          </Link>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell width="editor">
      <Card className="p-8 sm:p-10">
        {/* key forces a fresh form when navigating between items */}
        <EditorForm key={content.id} content={content} />
      </Card>
    </AppShell>
  );
}
