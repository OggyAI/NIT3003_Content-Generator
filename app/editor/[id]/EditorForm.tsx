'use client';
// Owner: Oggy — interactive editor (Figure 1.6): edit, save draft, save as new
// version, discard, delete (FR-12, FR-13) and SEO + tone analysis (FR-15, FR-16).
import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button, { buttonClasses } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import Callout from '@/components/ui/Callout';
import Spinner from '@/components/ui/Spinner';
import type { AnalyseResponse, ContentType } from '@/lib/types';
import { saveDraft, saveAsNewVersion, deleteDraft } from './actions';

const TYPE_LABELS: Record<ContentType, string> = {
  blog: 'Blog Post',
  social: 'Social Media',
  email: 'Email Newsletter',
};
const BODY_MAX = 20_000;

type Content = {
  id: string;
  content_type: ContentType;
  title: string | null;
  body: string;
  keywords: string[];
  seo_score: number | null;
  tone_match: boolean | null;
  updated_at: string;
};

type Saved = { title: string; body: string; keywords: string };
type Status = { kind: 'success' | 'error'; text: string } | null;

const toKeywordList = (s: string) =>
  s
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

const savedTime = (iso: string) =>
  new Date(iso).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });

export default function EditorForm({ content }: { content: Content }) {
  const router = useRouter();
  const initial: Saved = {
    title: content.title ?? '',
    body: content.body,
    keywords: content.keywords.join(', '),
  };
  const [saved, setSaved] = useState<Saved>(initial);
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [keywords, setKeywords] = useState(initial.keywords);
  const [updatedAt, setUpdatedAt] = useState(content.updated_at);
  const [status, setStatus] = useState<Status>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const [analysing, setAnalysing] = useState(false);
  const [report, setReport] = useState<AnalyseResponse | null>(null);
  // Stored results from an earlier analysis (cleared by the server on every save).
  const [storedSeo, setStoredSeo] = useState(content.seo_score);
  const [storedTone, setStoredTone] = useState(content.tone_match);

  const dirty = title !== saved.title || body !== saved.body || keywords !== saved.keywords;
  const busy = pending || analysing;

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const payload = () => ({ title, body, keywords: toKeywordList(keywords) });

  function clientCheck(): string | null {
    if (!body.trim()) return 'Content cannot be empty.';
    if (body.length > BODY_MAX) return `Content must be under ${BODY_MAX.toLocaleString()} characters.`;
    return null;
  }

  async function doSave(): Promise<boolean> {
    const problem = clientCheck();
    if (problem) {
      setStatus({ kind: 'error', text: problem });
      return false;
    }
    const res = await saveDraft(content.id, payload());
    if (!res.ok) {
      setStatus({ kind: 'error', text: res.message });
      return false;
    }
    const now = { title: title.trim() || 'Untitled draft', body: body.trim(), keywords: toKeywordList(keywords).join(', ') };
    setTitle(now.title);
    setBody(now.body);
    setKeywords(now.keywords);
    setSaved(now);
    if (res.updatedAt) setUpdatedAt(res.updatedAt);
    setReport(null);
    setStoredSeo(null);
    setStoredTone(null);
    setStatus({ kind: 'success', text: res.message });
    return true;
  }

  function handleSave() {
    startTransition(async () => {
      await doSave();
    });
  }

  function handleNewVersion() {
    const problem = clientCheck();
    if (problem) return setStatus({ kind: 'error', text: problem });
    startTransition(async () => {
      const res = await saveAsNewVersion(content.id, payload());
      if (!res.ok) return setStatus({ kind: 'error', text: res.message });
      setSaved({ title, body, keywords }); // don't trigger the leave-page warning
      router.push(`/editor/${res.id}`);
    });
  }

  function handleDiscard() {
    setTitle(saved.title);
    setBody(saved.body);
    setKeywords(saved.keywords);
    setStatus({ kind: 'success', text: 'Changes discarded.' });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteDraft(content.id);
      if (!res.ok) {
        setConfirmDelete(false);
        return setStatus({ kind: 'error', text: res.message });
      }
      setSaved({ title, body, keywords });
      router.push('/history');
    });
  }

  async function handleAnalyse() {
    setStatus(null);
    setAnalysing(true);
    try {
      // Analysis runs on the saved text, so save any edits first.
      if (dirty && !(await doSave())) return;
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: content.id, analysisType: 'both' }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || 'error' in data) {
        setStatus({ kind: 'error', text: data?.message ?? 'Analysis is unavailable right now — please try again.' });
        return;
      }
      setReport(data as AnalyseResponse);
      setStatus(null);
    } catch {
      setStatus({ kind: 'error', text: 'Analysis is unavailable right now — please try again.' });
    } finally {
      setAnalysing(false);
    }
  }

  const seoScore = report ? report.seoScore : storedSeo;
  const toneMatch = report ? report.toneMatch : storedTone;

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Content Editor</h1>
        <p className="mt-2 text-sm text-muted">
          {TYPE_LABELS[content.content_type]} · Last saved {savedTime(updatedAt)}
          {dirty && <span className="ml-2 font-semibold text-amber-700">· Unsaved changes</span>}
        </p>
      </header>

      <Input label="Title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />

      <Textarea
        label="Generated Content"
        rows={14}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        hint={`${body.length.toLocaleString()}/${BODY_MAX.toLocaleString()} characters`}
      />

      <Input
        label="Target keywords"
        hint="Separate with commas — used for the SEO score."
        placeholder="e.g. brunch, Footscray"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
      />

      {/* Analysis results (Figure 1.6) */}
      <section aria-labelledby="analysis-heading" aria-live="polite" className="flex flex-col gap-4 rounded-control border border-line p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="analysis-heading" className="font-semibold text-gray-900">
            SEO &amp; Tone Analysis
          </h2>
          <Button variant="secondary" onClick={handleAnalyse} loading={analysing} disabled={busy && !analysing}>
            {analysing ? 'Analysing…' : 'Analyse'}
          </Button>
        </div>

        {analysing && (
          <div className="flex items-center gap-3 text-sm text-muted">
            <Spinner size="sm" label="Analysing content" /> Checking keywords and tone…
          </div>
        )}

        {!analysing && seoScore === null && toneMatch === null && !report && (
          <p className="text-sm text-muted">Run an analysis to see your SEO score and whether the tone matches your brand voice.</p>
        )}

        {!analysing && (seoScore !== null || report) && (
          <div>
            <p className="mb-1 text-sm font-semibold text-gray-900">SEO Analysis</p>
            {seoScore !== null ? (
              <Badge variant={seoScore >= 0.7 ? 'success' : 'warning'}>{Math.round(seoScore * 100)}% SEO</Badge>
            ) : (
              <Badge>No keywords set</Badge>
            )}
            {report && report.keywordStats.length > 0 && (
              <ul className="mt-2 text-sm text-muted">
                {report.keywordStats.map((k) => (
                  <li key={k.keyword}>
                    <span className="font-medium text-gray-900">{k.keyword}</span>: {k.occurrences}{' '}
                    {k.occurrences === 1 ? 'use' : 'uses'} ({(k.density * 100).toFixed(1)}% density)
                  </li>
                ))}
              </ul>
            )}
            {report?.seoSuggestion && <p className="mt-1 text-sm text-amber-800">{report.seoSuggestion}</p>}
          </div>
        )}

        {!analysing && (toneMatch !== null || report?.toneError) && (
          <div>
            <p className="mb-1 text-sm font-semibold text-gray-900">Tone Analysis</p>
            {report?.toneError ? (
              <p className="text-sm text-amber-800">{report.toneError}</p>
            ) : toneMatch ? (
              <Badge variant="success">
                ✓ {report?.detectedTone ? `${report.detectedTone[0].toUpperCase()}${report.detectedTone.slice(1)} ` : ''}tone match
              </Badge>
            ) : (
              <Badge variant="warning">
                Tone mismatch{report?.detectedTone ? ` — reads as ${report.detectedTone}` : ''}
              </Badge>
            )}
          </div>
        )}

        {!analysing && report?.suggestion && <Callout title="Suggestion">{report.suggestion}</Callout>}
      </section>

      {status && (
        <p
          role={status.kind === 'error' ? 'alert' : 'status'}
          className={
            'rounded-control p-3 text-center text-sm ' +
            (status.kind === 'error' ? 'bg-warning-light text-amber-900' : 'bg-success-light text-green-800')
          }
        >
          {status.text}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={handleSave} loading={pending && !confirmDelete} disabled={busy}>
          Save Draft
        </Button>
        <Button variant="secondary" onClick={handleNewVersion} disabled={busy}>
          Save as New Version
        </Button>
        {dirty && (
          <Button variant="secondary" onClick={handleDiscard} disabled={busy}>
            Discard changes
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
        <Link href="/history" className="font-semibold text-navy underline">
          ← Back to Draft History
        </Link>
        {confirmDelete ? (
          <span className="flex items-center gap-2">
            <span className="text-gray-900">Delete this draft permanently?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="rounded-control bg-red-700 px-3 py-1 font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-60"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className={buttonClasses('secondary') + ' !px-3 !py-1'}
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            className="font-semibold text-red-700 underline focus-visible:outline-2 focus-visible:outline-red-700"
          >
            Delete draft
          </button>
        )}
      </div>
    </div>
  );
}
