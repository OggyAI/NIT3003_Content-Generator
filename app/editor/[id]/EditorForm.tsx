'use client';
// Owner: Oggy — interactive editor (Figure 1.6). Rebuilt for the UI overhaul (CLAUDE.md §2.2).
// FR-12 edit, FR-13 save draft / save as new version / duplicate / discard / delete,
// FR-15 keyword (SEO) check and FR-16 tone check, plus Copy and Download (.txt / .md).
// Kept from before: dirty tracking, the leave-page warning, Discard, saving before analysing,
// unsaved text kept when a save fails, and analysis cleared on save (the server clears it too).
// New: one header with a live save state, the body grows with its text (no double scroll),
// results are marked out of date as soon as the text changes, and Delete sits apart.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import FormatIcon from '@/components/ui/FormatIcon';
import Callout from '@/components/ui/Callout';
import {
  AlertIcon,
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  DocumentsIcon,
  DownloadIcon,
  PlusIcon,
  TrashIcon,
} from '@/components/icons';
import { FORMAT_LABELS, fullDateTime, timeAgo } from '@/lib/display';
import { BODY_MAX } from '@/lib/validation';
import type { AnalyseResponse, ContentType } from '@/lib/types';
import { saveDraft, saveAsNewVersion, deleteDraft, duplicateDraft } from './actions';

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
type Message = { kind: 'success' | 'error'; text: string; link?: { href: string; label: string } } | null;
type Running = 'save' | 'version' | 'duplicate' | 'delete' | null;

// When a server action can't be reached at all (offline, server restarting)
const NETWORK_ERROR = "Couldn't reach the server. Check your connection, then try again.";

const toKeywordList = (s: string) =>
  s
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

function fileName(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'draft';
}

export default function EditorForm({ content, voice }: { content: Content; voice: string | null }) {
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
  const [message, setMessage] = useState<Message>(null);
  const [running, setRunning] = useState<Running>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalyseResponse | null>(null);
  // Stored results from an earlier analysis (cleared by the server on every save)
  const [storedSeo, setStoredSeo] = useState(content.seo_score);
  const [storedTone, setStoredTone] = useState(content.tone_match);
  const [copied, setCopied] = useState(false);
  // Re-renders the "Saved 2 minutes ago" text every 30 s
  const [now, setNow] = useState(() => Date.now());
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);

  const dirty = title !== saved.title || body !== saved.body || keywords !== saved.keywords;
  const busy = running !== null || analysing;

  // Warn before leaving the page with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);

  // Put focus on Cancel when the delete confirmation opens (the safe choice)
  useEffect(() => {
    if (confirmDelete) cancelDeleteRef.current?.focus();
  }, [confirmDelete]);

  const payload = () => ({ title, body, keywords: toKeywordList(keywords) });

  function clientCheck(): string | null {
    if (!body.trim()) return 'Content cannot be empty.';
    if (body.length > BODY_MAX) return `Content must be under ${BODY_MAX.toLocaleString()} characters.`;
    return null;
  }

  async function doSave(): Promise<boolean> {
    const problem = clientCheck();
    if (problem) {
      setMessage({ kind: 'error', text: problem });
      return false;
    }
    const res = await saveDraft(content.id, payload()).catch(() => ({ ok: false as const, message: NETWORK_ERROR }));
    if (!res.ok) {
      // The typed text stays exactly as it is
      setMessage({ kind: 'error', text: `${res.message} Your changes are still here.` });
      return false;
    }
    const next = {
      title: title.trim() || 'Untitled draft',
      body: body.trim(),
      keywords: toKeywordList(keywords).join(', '),
    };
    setTitle(next.title);
    setBody(next.body);
    setKeywords(next.keywords);
    setSaved(next);
    if (res.updatedAt) setUpdatedAt(res.updatedAt);
    setNow(Date.now());
    setReport(null);
    setStoredSeo(null);
    setStoredTone(null);
    setMessage(null); // the header's save state says "Saved just now"
    return true;
  }

  async function handleSave() {
    if (busy) return;
    setMessage(null);
    setRunning('save');
    try {
      await doSave();
    } finally {
      setRunning(null);
    }
  }

  async function handleNewVersion() {
    if (busy) return;
    const problem = clientCheck();
    if (problem) return setMessage({ kind: 'error', text: problem });
    setMessage(null);
    setRunning('version');
    const res = await saveAsNewVersion(content.id, payload()).catch(() => ({ ok: false as const, message: NETWORK_ERROR }));
    if (!res.ok) {
      setRunning(null);
      return setMessage({ kind: 'error', text: res.message });
    }
    setSaved({ title, body, keywords }); // don't trigger the leave-page warning
    router.push(`/editor/${res.id}`);
  }

  async function handleDuplicate() {
    if (busy) return;
    setMessage(null);
    setRunning('duplicate');
    const res = await duplicateDraft(content.id).catch(() => ({ ok: false as const, message: NETWORK_ERROR }));
    setRunning(null);
    if (!res.ok) return setMessage({ kind: 'error', text: res.message });
    // Stay here, so unsaved edits are never lost by navigating away
    setMessage({
      kind: 'success',
      text: dirty
        ? 'A copy of the last saved version is in Draft history. Your unsaved changes are not in it.'
        : 'A copy of this draft is in Draft history.',
      link: { href: `/editor/${res.id}`, label: 'Open the copy' },
    });
  }

  function handleDiscard() {
    setTitle(saved.title);
    setBody(saved.body);
    setKeywords(saved.keywords);
    setMessage({ kind: 'success', text: 'Changes discarded.' });
  }

  async function handleDelete() {
    if (running) return;
    setRunning('delete');
    const res = await deleteDraft(content.id).catch(() => ({ ok: false as const, message: NETWORK_ERROR }));
    if (!res.ok) {
      setRunning(null);
      setConfirmDelete(false);
      return setMessage({ kind: 'error', text: res.message });
    }
    setSaved({ title, body, keywords });
    router.push('/history');
  }

  async function handleAnalyse() {
    if (busy) return;
    setMessage(null);
    setAnalysisError(null);
    setAnalysing(true);
    try {
      // Analysis runs on the saved text, so save any edits first
      if (dirty && !(await doSave())) return;
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: content.id, analysisType: 'both' }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || 'error' in data) {
        setAnalysisError(data?.message ?? 'Analysis is unavailable right now. Please try again.');
        return;
      }
      setReport(data as AnalyseResponse);
    } catch {
      setAnalysisError('Analysis is unavailable right now. Please try again.');
    } finally {
      setAnalysing(false);
    }
  }

  async function handleCopy() {
    // Social titles are internal labels, so only the post itself is copied; blogs keep their title
    const text = content.content_type === 'blog' ? `${title.trim()}\n\n${body.trim()}` : body.trim();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setMessage(null);
    } catch {
      setMessage({ kind: 'error', text: "Couldn't copy. Select the text and copy it yourself." });
    }
  }

  function handleDownload(ext: 'txt' | 'md') {
    const heading = title.trim() || 'Untitled draft';
    const text = ext === 'md' ? `# ${heading}\n\n${body.trim()}\n` : `${heading}\n\n${body.trim()}\n`;
    const blob = new Blob([text], { type: ext === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName(heading)}.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage({ kind: 'success', text: `Downloaded ${link.download}.` });
  }

  const seoScore = report ? report.seoScore : storedSeo;
  const toneMatch = report ? report.toneMatch : storedTone;
  const hasResults = seoScore !== null || toneMatch !== null || report !== null;
  const outOfDate = hasResults && dirty;

  const saveState =
    running === 'save' || (analysing && dirty)
      ? 'Saving…'
      : dirty
        ? 'Unsaved changes'
        : `Saved ${timeAgo(updatedAt, now)}`;

  return (
    <div className="flex max-w-[70ch] flex-col gap-6 xl:max-w-none">
      {/* ---- One header: title, save state, Save draft ---- */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/history"
            className="inline-flex items-center gap-1 rounded text-sm font-medium text-navy hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Draft history
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight break-words text-ink md:text-3xl">
            {saved.title || 'Untitled draft'}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-2 font-medium text-ink">
              <FormatIcon type={content.content_type} size="sm" />
              {FORMAT_LABELS[content.content_type]}
            </span>
            <span role="status" aria-live="polite" className="inline-flex items-center gap-1.5">
              {dirty && running !== 'save' && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-warning" />}
              <span title={dirty ? undefined : fullDateTime(updatedAt)} suppressHydrationWarning>
                {saveState}
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
          {dirty && (
            <Button variant="ghost" onClick={handleDiscard} disabled={busy}>
              Discard changes
            </Button>
          )}
          <Button onClick={handleSave} loading={running === 'save'} disabled={busy || !dirty}>
            Save draft
          </Button>
        </div>
      </header>

      {/* ---- Secondary actions ---- */}
      <div role="group" aria-label="More actions" className="-mt-2 flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={handleNewVersion} loading={running === 'version'} disabled={busy}>
          {running !== 'version' && <PlusIcon className="h-4 w-4" />}
          Save as new version
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDuplicate} loading={running === 'duplicate'} disabled={busy}>
          {running !== 'duplicate' && <DocumentsIcon className="h-4 w-4" />}
          Duplicate
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy text'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleDownload('txt')}>
          <DownloadIcon className="h-4 w-4" />
          Download .txt
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleDownload('md')}>
          <DownloadIcon className="h-4 w-4" />
          Download .md
        </Button>
        <span role="status" aria-live="polite" className="sr-only">
          {copied ? 'Copied to the clipboard.' : ''}
        </span>
      </div>

      {message && (
        <div
          role={message.kind === 'error' ? 'alert' : 'status'}
          className={
            'flex items-start gap-2 rounded-control border p-3 text-sm leading-6 ' +
            (message.kind === 'error'
              ? 'border-danger/30 bg-danger-light text-danger'
              : 'border-green-200 bg-success-light text-green-800')
          }
        >
          {message.kind === 'error' ? <AlertIcon className="mt-0.5 h-5 w-5" /> : <CheckIcon className="mt-0.5 h-5 w-5" />}
          <span>
            {message.text}
            {message.link && (
              <>
                {' '}
                <Link href={message.link.href} className="font-semibold underline underline-offset-4 hover:no-underline">
                  {message.link.label}
                </Link>
              </>
            )}
          </span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        {/* ---- Writing column ---- */}
        <Card className="flex min-w-0 flex-col gap-4">
          <Input label="Title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
          <Textarea
            label="Draft"
            autoGrow
            rows={14}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            hint={`${body.length.toLocaleString()}/${BODY_MAX.toLocaleString()} characters`}
          />
        </Card>

        {/* ---- Analysis panel: beside the text at xl, below it on smaller screens ---- */}
        {/* Sticky without a height cap: a tall panel scrolls with the page instead of inside itself */}
        <Card className="flex flex-col gap-4 xl:sticky xl:top-6">
          <section aria-labelledby="analysis-heading" className="flex flex-col gap-4">
            <div>
              <h2 id="analysis-heading" className="text-lg font-semibold text-ink">
                Check your draft
              </h2>
              <p className="mt-1 text-sm text-muted">Checks the saved text. Any changes are saved first.</p>
            </div>

            <Input
              label="Keywords"
              hint="Separate with commas. Used for the keyword score."
              placeholder="e.g. brunch, Footscray"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />

            <Button variant="secondary" onClick={handleAnalyse} loading={analysing} disabled={busy && !analysing}>
              {analysing ? 'Analysing…' : 'Analyse draft'}
            </Button>

            <div role="status" aria-live="polite" className="sr-only">
              {analysing ? 'Checking keywords and tone…' : report ? 'Analysis finished.' : ''}
            </div>

            {analysisError && (
              <p role="alert" className="flex items-start gap-2 text-sm leading-6 text-danger">
                <AlertIcon className="mt-0.5 h-5 w-5" />
                {analysisError}
              </p>
            )}

            {outOfDate && (
              <p className="flex items-start gap-2 rounded-control border border-amber-200 bg-warning-light p-3 text-sm leading-6 text-amber-900">
                <AlertIcon className="mt-0.5 h-5 w-5 text-amber-700" />
                <span>
                  <span className="font-semibold">Out of date.</span> These results are for the last saved version.
                  Analyse again to check your changes.
                </span>
              </p>
            )}

            {!hasResults && !analysing && (
              <p className="text-sm leading-6 text-muted">
                No results yet. Analyse the draft to see its keyword score and whether it sounds like your brand.
              </p>
            )}

            {hasResults && (
              <div className={'flex flex-col gap-5 ' + (outOfDate || analysing ? 'opacity-60' : '')}>
                {/* Keyword (SEO) score */}
                <section aria-labelledby="seo-heading" className="flex flex-col gap-2">
                  <h3 id="seo-heading" className="text-base font-semibold text-ink">
                    Keyword score
                  </h3>
                  <p className="text-sm leading-6 text-muted">
                    How many of your keywords appear in the body (70% of the score) and the title (30%).
                  </p>
                  {seoScore !== null ? (
                    <div className="flex flex-col gap-2">
                      <p className="flex items-center gap-2">
                        <span className="font-display text-3xl font-bold text-ink">{Math.round(seoScore * 100)}%</span>
                        <Badge variant={seoScore >= 0.7 ? 'success' : 'warning'}>
                          {seoScore >= 0.7 ? 'Good coverage' : 'Low coverage'}
                        </Badge>
                      </p>
                      {/* Decorative: the number above says the same thing */}
                      <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-navy-50">
                        <div
                          className={'h-full rounded-full ' + (seoScore >= 0.7 ? 'bg-teal' : 'bg-warning')}
                          style={{ width: `${Math.round(seoScore * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-ink">Add keywords above to get a keyword score.</p>
                  )}
                  {report && report.keywordStats.length > 0 && (
                    <ul className="flex flex-col gap-1 text-sm text-muted">
                      {report.keywordStats.map((k) => (
                        <li key={k.keyword}>
                          <span className="font-medium text-ink">{k.keyword}</span>: {k.occurrences}{' '}
                          {k.occurrences === 1 ? 'use' : 'uses'} ({(k.density * 100).toFixed(1)}% of words)
                        </li>
                      ))}
                    </ul>
                  )}
                  {report?.seoSuggestion && <p className="text-sm leading-6 text-amber-900">{report.seoSuggestion}</p>}
                </section>

                {/* Tone check */}
                <section aria-labelledby="tone-heading" className="flex flex-col gap-2">
                  <h3 id="tone-heading" className="text-base font-semibold text-ink">
                    Tone check
                  </h3>
                  <p className="text-sm leading-6 text-muted">
                    Whether the draft reads like your saved {voice ? `${voice.toLowerCase()} ` : ''}brand voice.
                  </p>
                  {report?.toneError ? (
                    <p className="text-sm leading-6 text-amber-900">{report.toneError}</p>
                  ) : toneMatch === null ? (
                    <p className="text-sm text-ink">Not checked yet.</p>
                  ) : (
                    <p className="flex flex-wrap items-center gap-2 text-sm text-ink">
                      <Badge variant={toneMatch ? 'success' : 'warning'}>
                        {toneMatch ? '✓ Matches your voice' : "Doesn't match your voice"}
                      </Badge>
                      {report?.detectedTone && <span>Reads as {report.detectedTone}.</span>}
                    </p>
                  )}
                  {report?.suggestion && <Callout title="Suggestion">{report.suggestion}</Callout>}
                </section>
              </div>
            )}
          </section>
        </Card>
      </div>

      {/* ---- Delete, away from Save ---- */}
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        {confirmDelete ? (
          <div role="group" aria-label="Confirm delete" className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-ink">Delete this draft permanently? This can&apos;t be undone.</span>
            <Button variant="danger" size="sm" onClick={handleDelete} loading={running === 'delete'}>
              Yes, delete
            </Button>
            <Button
              ref={cancelDeleteRef}
              variant="ghost"
              size="sm"
              onClick={() => {
                setConfirmDelete(false);
                // Back to the Delete button, so keyboard users don't lose their place
                setTimeout(() => deleteRef.current?.focus(), 0);
              }}
              disabled={running === 'delete'}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            ref={deleteRef}
            variant="danger-ghost"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
          >
            <TrashIcon className="h-4 w-4" />
            Delete draft
          </Button>
        )}
      </div>
    </div>
  );
}
