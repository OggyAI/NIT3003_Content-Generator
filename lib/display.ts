// Owner: Oggy. Labels and date text shared by the dashboard, history and editor,
// so every screen names formats and voices the same way.
import type { BrandVoiceOption, ContentType } from '@/lib/types';

// Named after what the prompt builder actually writes for each type
export const FORMAT_LABELS: Record<ContentType, string> = {
  blog: 'Blog outline',
  social: 'Social post',
  email: 'Email newsletter',
};

export const VOICE_LABELS: Record<BrandVoiceOption, string> = {
  professional: 'Professional',
  friendly: 'Friendly',
  casual: 'Casual',
  persuasive: 'Persuasive',
};

// Our users are Australian small businesses; servers (Vercel) run in UTC,
// so dates are shown in Melbourne time rather than the server's.
const TIME_ZONE = 'Australia/Melbourne';
const relative = new Intl.RelativeTimeFormat('en-AU', { numeric: 'auto' });

/**
 * "just now", "5 minutes ago", "3 hours ago", "yesterday", "4 days ago", then "12 Nov 2026".
 * Works from the time difference, so it doesn't depend on the server's time zone.
 */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return 'just now';
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return relative.format(Math.round(seconds / 3600), 'hour');
  if (abs < 7 * 86_400) return relative.format(Math.round(seconds / 86_400), 'day');
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: TIME_ZONE,
  });
}

/** Full date and time, e.g. "14 Nov 2026, 3:05 pm", for title attributes and screen readers */
export function fullDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short', timeZone: TIME_ZONE });
}

/** ["brand voice", "target audience"] → "brand voice and target audience" */
export function listInWords(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
