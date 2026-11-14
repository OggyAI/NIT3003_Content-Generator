'use client';
// Owner: Oggy — the interactive part of /generate. Rebuilt for the UI overhaul (CLAUDE.md §2.2).
// FR-07 choose content type, FR-08/09/10 generate, NFR-05 keep every input on failure.
// While generating, the form stays visible but disabled, and a second submit is ignored.
// Failures say what went wrong (using the API's `reason`) next to the button, with Retry
// when retrying can help. The result offers Open in editor, Copy text, Regenerate (always
// a new draft; the old one stays in history) and Create another.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Button, { buttonClasses } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import SelectableCard from '@/components/ui/SelectableCard';
import Badge from '@/components/ui/Badge';
import { AlertIcon, CheckIcon, CopyIcon, PlusIcon, RefreshIcon, SparkleIcon } from '@/components/icons';
import { FORMAT_LABELS, FORMAT_OPTIONS as TYPES, PLATFORM_OPTIONS as PLATFORMS } from '@/lib/display';
import { KEYWORD_MAX, MAX_KEYWORDS, REQUEST_MAX, REQUEST_MIN } from '@/lib/validation';
import type { ContentType, GenerateResponse, GenerationFailureReason, Platform } from '@/lib/types';

const PLACEHOLDERS: Record<ContentType, string> = {
  blog: 'e.g. Why locally roasted coffee tastes better',
  social: 'e.g. Promote our new weekend brunch menu',
  email: 'e.g. Monthly update announcing our loyalty card',
};

type Failure = { message: string; retry: boolean; link?: { href: string; label: string } };

// Friendly copy only: never show keys, billing details or raw API errors (those stay in the server log)
const REASON_TEXT: Record<GenerationFailureReason, Failure> = {
  quota: {
    message:
      "The AI service has reached its usage limit, so we couldn't write this draft. Your request is still here. Please let whoever runs this app know.",
    retry: false,
  },
  rate_limit: { message: 'The AI service is busy right now. Wait a few seconds, then try again.', retry: true },
  config: {
    message:
      "The AI service isn't set up correctly, so we couldn't write this draft. Your request is still here. Please let whoever runs this app know.",
    retry: false,
  },
  timeout: { message: 'The AI service took too long to answer. Your request is still here, so try again.', retry: true },
  unknown: {
    message: 'Something went wrong while writing your draft. Your request is still here, so try again.',
    retry: true,
  },
};

const NETWORK_FAILURE: Failure = {
  message: "We couldn't reach the server. Check your connection, then try again.",
  retry: true,
};

function failureFrom(data: Extract<GenerateResponse, { error: string }>): Failure {
  switch (data.error) {
    case 'generation_failed':
      return REASON_TEXT[data.reason ?? 'unknown'] ?? REASON_TEXT.unknown;
    case 'save_failed':
      return { message: "Your draft was written but couldn't be saved. Try again.", retry: true };
    case 'profile_incomplete':
      return {
        message: 'Your business profile is incomplete. Finish it, then come back.',
        retry: false,
        link: { href: '/profile', label: 'Go to business profile' },
      };
    case 'unauthorised':
      return {
        message: 'Your session has ended. Log in again to continue.',
        retry: false,
        link: { href: '/login?next=/generate', label: 'Log in' },
      };
    default:
      return { message: data.message ?? 'Something went wrong. Please try again.', retry: false };
  }
}

function parseKeywords(text: string) {
  return [...new Set(text.split(',').map((k) => k.trim()).filter(Boolean))];
}

type Result = {
  contentId: string;
  title: string;
  body: string;
  generationMs: number;
  contentType: ContentType;
  platform: Platform | null;
};

type Pending = 'generate' | 'regenerate' | null;

type GenerateFormProps = {
  voice: string | null;
  /** Starting format and platform from Settings › Content defaults (null = Social post / Instagram) */
  initialType?: ContentType | null;
  initialPlatform?: Platform | null;
};

export default function GenerateForm({ voice, initialType, initialPlatform }: GenerateFormProps) {
  const [contentType, setContentType] = useState<ContentType>(initialType ?? 'social');
  const [platform, setPlatform] = useState<Platform>(initialPlatform ?? 'instagram');
  const [request, setRequest] = useState('');
  const [keywords, setKeywords] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ request?: string; keywords?: string }>({});
  const [pending, setPending] = useState<Pending>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const inFlight = useRef(false);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const busy = pending !== null;
  const voiceText = voice ? `your ${voice.toLowerCase()} voice` : 'your brand voice';

  // Move keyboard and screen reader users to the new draft
  useEffect(() => {
    if (result) resultHeadingRef.current?.focus();
  }, [result]);

  useEffect(() => {
    if (copyState !== 'copied') return;
    const timer = setTimeout(() => setCopyState('idle'), 2500);
    return () => clearTimeout(timer);
  }, [copyState]);

  function validate() {
    const errors: { request?: string; keywords?: string } = {};
    const text = request.trim();
    if (text.length < REQUEST_MIN) errors.request = `Describe what you want in at least ${REQUEST_MIN} characters.`;
    else if (text.length > REQUEST_MAX) errors.request = `Keep your request under ${REQUEST_MAX} characters.`;
    const words = parseKeywords(keywords);
    if (words.length > MAX_KEYWORDS) errors.keywords = `Use at most ${MAX_KEYWORDS} keywords.`;
    else if (words.some((k) => k.length > KEYWORD_MAX)) errors.keywords = `Each keyword must be under ${KEYWORD_MAX} characters.`;
    setFieldErrors(errors);
    if (errors.request) document.getElementById('generate-brief')?.focus();
    else if (errors.keywords) document.getElementById('generate-keywords')?.focus();
    return !errors.request && !errors.keywords;
  }

  async function generate(kind: Exclude<Pending, null>) {
    if (inFlight.current) return; // blocks double submits, even before React re-renders
    if (!validate()) return;
    inFlight.current = true;
    setPending(kind);
    setFailure(null);
    setCopyState('idle');
    const sentPlatform = contentType === 'social' ? platform : null;
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          platform: sentPlatform ?? undefined,
          request,
          keywords: parseKeywords(keywords),
        }),
      });
      const data = (await res.json().catch(() => null)) as GenerateResponse | null;
      if (!data) {
        // Not JSON: usually the host cutting off a slow request
        setFailure(res.status === 504 ? REASON_TEXT.timeout : REASON_TEXT.unknown);
      } else if ('error' in data) {
        setFailure(failureFrom(data));
      } else {
        setResult({ ...data, contentType, platform: sentPlatform });
      }
    } catch {
      setFailure(NETWORK_FAILURE);
    } finally {
      inFlight.current = false;
      setPending(null);
    }
  }

  function createAnother() {
    setResult(null);
    setFailure(null);
    setFieldErrors({});
    setRequest('');
    setKeywords('');
    // Wait for the form to render, then put the cursor in the brief
    setTimeout(() => document.getElementById('generate-brief')?.focus(), 0);
  }

  async function copyResult() {
    if (!result) return;
    // Social titles are internal labels, so only the post itself is copied; blogs keep their title
    const text = result.contentType === 'blog' ? `${result.title}\n\n${result.body}` : result.body;
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  }

  // ---- Result preview ----
  if (result) {
    const status =
      pending === 'regenerate'
        ? `Writing a new version in ${voiceText}…`
        : copyState === 'copied'
          ? 'Copied to the clipboard.'
          : copyState === 'failed'
            ? "Couldn't copy. Select the text and copy it yourself."
            : '';
    return (
      <section aria-labelledby="result-heading" className="flex flex-col gap-4" aria-busy={busy}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">
            <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            Saved as draft
          </Badge>
          <Badge variant="info">
            {FORMAT_LABELS[result.contentType]}
            {result.platform ? ` · ${result.platform === 'instagram' ? 'Instagram' : 'Facebook'}` : ''}
          </Badge>
          <span className="text-sm text-muted">Written in {(result.generationMs / 1000).toFixed(1)} s</span>
        </div>

        <h2
          id="result-heading"
          ref={resultHeadingRef}
          tabIndex={-1}
          className="text-lg font-semibold break-words text-ink focus:outline-none"
        >
          {result.title}
        </h2>

        <div className="rounded-control border border-line bg-page p-4 text-sm leading-6 break-words whitespace-pre-wrap text-ink sm:text-base sm:leading-7">
          {result.body}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/editor/${result.contentId}`} className={buttonClasses()}>
            Open in editor
          </Link>
          <Button variant="secondary" onClick={copyResult} disabled={busy}>
            {copyState === 'copied' ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
            {copyState === 'copied' ? 'Copied' : 'Copy text'}
          </Button>
          <Button variant="secondary" onClick={() => generate('regenerate')} loading={pending === 'regenerate'}>
            {pending !== 'regenerate' && <RefreshIcon className="h-4 w-4" />}
            {pending === 'regenerate' ? 'Regenerating…' : 'Regenerate'}
          </Button>
          <Button variant="ghost" onClick={createAnother} disabled={busy}>
            <PlusIcon className="h-4 w-4" />
            Create another
          </Button>
        </div>

        <p role="status" aria-live="polite" className="min-h-5 text-sm text-muted">
          {status}
        </p>

        {failure && <FailureMessage failure={failure} onRetry={() => generate('regenerate')} />}

        <p className="text-sm text-muted">
          Regenerate writes a new draft from the same request. This one stays in{' '}
          <Link href="/history" className="font-medium text-navy underline underline-offset-4 hover:no-underline">
            Draft history
          </Link>
          .
        </p>
      </section>
    );
  }

  // ---- Form ----
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        generate('generate');
      }}
      noValidate
      aria-busy={busy}
      // @container: the card grids below respond to the form's width, not the window's
      // (next to the sidebar at 768px the form is only ~400px wide)
      className="@container flex flex-col gap-6"
    >
      {/* Disabled while generating: everything stays visible, nothing can change */}
      <fieldset disabled={busy} className="flex min-w-0 flex-col gap-6">
        <fieldset className="min-w-0">
          <legend className="mb-2 text-sm font-medium text-ink">Format</legend>
          <div className="grid grid-cols-1 gap-3 @xl:grid-cols-3">
            {TYPES.map((t) => (
              <SelectableCard
                key={t.value}
                label={FORMAT_LABELS[t.value]}
                description={t.description}
                selected={contentType === t.value}
                onSelect={() => setContentType(t.value)}
                disabled={busy}
              />
            ))}
          </div>
        </fieldset>

        {contentType === 'social' && (
          <fieldset className="min-w-0">
            <legend className="mb-2 text-sm font-medium text-ink">Platform</legend>
            <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2">
              {PLATFORMS.map((p) => (
                <SelectableCard
                  key={p.value}
                  label={p.label}
                  description={p.description}
                  selected={platform === p.value}
                  onSelect={() => setPlatform(p.value)}
                  disabled={busy}
                />
              ))}
            </div>
          </fieldset>
        )}

        <Textarea
          id="generate-brief"
          label="What should we write?"
          rows={5}
          maxLength={REQUEST_MAX}
          placeholder={PLACEHOLDERS[contentType]}
          value={request}
          onChange={(e) => {
            setRequest(e.target.value);
            if (fieldErrors.request) setFieldErrors((f) => ({ ...f, request: undefined }));
          }}
          hint={`The topic, offer or event, plus anything we must mention. ${request.length}/${REQUEST_MAX} characters`}
          error={fieldErrors.request}
        />

        <div className="sm:max-w-md">
          <Input
            id="generate-keywords"
            label="Keywords (optional)"
            placeholder="e.g. specialty coffee, Footscray brunch"
            hint={`Separate with commas, up to ${MAX_KEYWORDS}. We'll work them into the text.`}
            value={keywords}
            onChange={(e) => {
              setKeywords(e.target.value);
              if (fieldErrors.keywords) setFieldErrors((f) => ({ ...f, keywords: undefined }));
            }}
            error={fieldErrors.keywords}
          />
        </div>
      </fieldset>

      {failure && <FailureMessage failure={failure} onRetry={() => generate('generate')} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" loading={pending === 'generate'} className="self-start">
          {pending !== 'generate' && <SparkleIcon className="h-4 w-4" />}
          {pending === 'generate' ? 'Generating…' : 'Generate draft'}
        </Button>
        <p role="status" aria-live="polite" className="text-sm text-muted">
          {pending === 'generate' ? `Writing your draft in ${voiceText}. This usually takes a few seconds.` : ''}
        </p>
      </div>
    </form>
  );
}

function FailureMessage({ failure, onRetry }: { failure: Failure; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-control border border-danger/30 bg-danger-light p-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <p className="flex gap-2 text-sm leading-6 text-danger">
        <AlertIcon className="mt-0.5 h-5 w-5" />
        <span>
          {failure.message}
          {failure.link && (
            <>
              {' '}
              <Link href={failure.link.href} className="font-semibold underline underline-offset-4 hover:no-underline">
                {failure.link.label}
              </Link>
            </>
          )}
        </span>
      </p>
      {failure.retry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="self-start">
          <RefreshIcon className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}
