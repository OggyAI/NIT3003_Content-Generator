'use client';
// Owner: Oggy — the interactive part of /generate.
// FR-07 choose content type, FR-08/09/10 generate, NFR-05 keep the request on failure.
import { useState } from 'react';
import Link from 'next/link';
import Button, { buttonClasses } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import SelectableCard from '@/components/ui/SelectableCard';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import type { ContentType, GenerateResponse, Platform } from '@/lib/types';

const TYPES: { value: ContentType; label: string }[] = [
  { value: 'blog', label: 'Blog Post' },
  { value: 'social', label: 'Social Media' },
  { value: 'email', label: 'Email Newsletter' },
];

const PLACEHOLDERS: Record<ContentType, string> = {
  blog: 'e.g. Why locally roasted coffee tastes better',
  social: 'e.g. Promote our new weekend brunch menu',
  email: 'e.g. Monthly update announcing our loyalty card',
};

const ERROR_TEXT: Record<string, string> = {
  profile_incomplete: 'Your business profile is incomplete. Finish it, then try again.',
  generation_failed: 'The AI service did not respond in time. Your request is still filled in — please try again.',
  save_failed: 'The content was generated but could not be saved. Please try again.',
  unauthorised: 'Your session has expired. Please log in again.',
};

type Result = { contentId: string; title: string; body: string; generationMs: number };

export default function GenerateForm() {
  const [contentType, setContentType] = useState<ContentType>('social');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [request, setRequest] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (request.trim().length < 5) {
      setError('Describe what you want in at least 5 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          platform: contentType === 'social' ? platform : undefined,
          request,
          keywords: keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        }),
      });
      const data = (await res.json().catch(() => ({ error: 'generation_failed' }))) as GenerateResponse;
      if ('error' in data) {
        setError(data.message ?? ERROR_TEXT[data.error] ?? 'Something went wrong. Please try again.');
      } else {
        setResult(data);
      }
    } catch {
      setError(ERROR_TEXT.generation_failed);
    } finally {
      setLoading(false);
    }
  }

  // Loading state (Figure 1.5)
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center" aria-live="polite">
        <Spinner size="lg" label="Generating your draft" />
        <p className="text-lg font-semibold text-gray-900">Generating your draft…</p>
        <p className="text-sm text-muted">Using your business profile and brand voice. This usually takes a few seconds.</p>
      </div>
    );
  }

  // Result preview
  if (result) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-gray-900">{result.title}</h2>
          <Badge variant="success">Saved as draft · {(result.generationMs / 1000).toFixed(1)}s</Badge>
        </div>
        <div className="max-h-[420px] overflow-y-auto rounded-control border border-line bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-gray-900">
          {result.body}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/editor/${result.contentId}`} className={buttonClasses()}>
            Open in editor
          </Link>
          <Button variant="secondary" onClick={() => setResult(null)}>
            Generate another
          </Button>
        </div>
      </div>
    );
  }

  // Form (Figure 1.4)
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-gray-900">Content type</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TYPES.map((t) => (
            <SelectableCard
              key={t.value}
              label={t.label}
              selected={contentType === t.value}
              onSelect={() => setContentType(t.value)}
            />
          ))}
        </div>
      </fieldset>

      {contentType === 'social' && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-gray-900">Platform</legend>
          <div className="grid grid-cols-2 gap-3">
            <SelectableCard label="Instagram" selected={platform === 'instagram'} onSelect={() => setPlatform('instagram')} />
            <SelectableCard label="Facebook" selected={platform === 'facebook'} onSelect={() => setPlatform('facebook')} />
          </div>
        </fieldset>
      )}

      <Textarea
        label="What should it be about?"
        rows={3}
        maxLength={500}
        placeholder={PLACEHOLDERS[contentType]}
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        hint={`${request.length}/500 characters`}
      />

      <Input
        label="SEO keywords (optional)"
        placeholder="e.g. specialty coffee, Footscray brunch"
        hint="Separate with commas — up to 10."
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
      />

      {error && (
        <p role="alert" className="rounded-control bg-warning-light p-3 text-sm text-amber-900">
          {error}
          {error === ERROR_TEXT.profile_incomplete && (
            <>
              {' '}
              <Link href="/profile" className="font-semibold underline">
                Go to profile
              </Link>
            </>
          )}
        </p>
      )}

      <Button type="submit" className="self-center">
        Generate content
      </Button>
    </form>
  );
}
