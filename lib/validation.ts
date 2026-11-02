// Owner: Oggy. Validates the POST /api/generate body (NFR-08 input validation).
// Kept separate from the route so it can be unit-tested.
import type { ContentType, Platform } from '@/lib/types';

export const REQUEST_MIN = 5;
export const REQUEST_MAX = 500;
export const MAX_KEYWORDS = 10;
export const KEYWORD_MAX = 40;

export type ValidGenerateInput = {
  contentType: ContentType;
  platform: Platform | null;
  request: string;
  keywords: string[];
};

export type ValidationResult =
  | { ok: true; value: ValidGenerateInput }
  | { ok: false; message: string };

const CONTENT_TYPES: ContentType[] = ['blog', 'social', 'email'];
const PLATFORMS: Platform[] = ['instagram', 'facebook'];

export function validateGenerateInput(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object') return { ok: false, message: 'Request body must be JSON.' };
  const body = raw as Record<string, unknown>;

  const contentType = body.contentType as ContentType;
  if (!CONTENT_TYPES.includes(contentType)) {
    return { ok: false, message: 'Choose a content type: blog, social or email.' };
  }

  let platform: Platform | null = null;
  if (contentType === 'social') {
    platform = (body.platform as Platform) ?? 'instagram';
    if (!PLATFORMS.includes(platform)) {
      return { ok: false, message: 'Choose a platform: Instagram or Facebook.' };
    }
  }

  const request = typeof body.request === 'string' ? body.request.trim() : '';
  if (request.length < REQUEST_MIN) {
    return { ok: false, message: `Describe what you want in at least ${REQUEST_MIN} characters.` };
  }
  if (request.length > REQUEST_MAX) {
    return { ok: false, message: `Keep your request under ${REQUEST_MAX} characters.` };
  }

  let keywords: string[] = [];
  if (body.keywords !== undefined) {
    if (!Array.isArray(body.keywords) || body.keywords.some((k) => typeof k !== 'string')) {
      return { ok: false, message: 'Keywords must be a list of words or phrases.' };
    }
    keywords = [...new Set((body.keywords as string[]).map((k) => k.trim()).filter(Boolean))];
    if (keywords.length > MAX_KEYWORDS) {
      return { ok: false, message: `Use at most ${MAX_KEYWORDS} keywords.` };
    }
    if (keywords.some((k) => k.length > KEYWORD_MAX)) {
      return { ok: false, message: `Each keyword must be under ${KEYWORD_MAX} characters.` };
    }
  }

  return { ok: true, value: { contentType, platform, request, keywords } };
}

// ---- Editor save (FR-12, FR-13) ----
export const TITLE_MAX = 200;
export const BODY_MAX = 20_000;

export type ValidContentInput = { title: string; body: string; keywords: string[] };

export function validateContentInput(
  raw: unknown,
): { ok: true; value: ValidContentInput } | { ok: false; message: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, message: 'Request body must be JSON.' };
  const b = raw as Record<string, unknown>;
  const title = typeof b.title === 'string' ? b.title.trim() : '';
  const body = typeof b.body === 'string' ? b.body.trim() : '';
  if (!body) return { ok: false, message: 'Content cannot be empty.' };
  if (body.length > BODY_MAX) return { ok: false, message: `Content must be under ${BODY_MAX.toLocaleString()} characters.` };
  if (title.length > TITLE_MAX) return { ok: false, message: `Title must be under ${TITLE_MAX} characters.` };

  let keywords: string[] = [];
  if (b.keywords !== undefined) {
    if (!Array.isArray(b.keywords) || b.keywords.some((k) => typeof k !== 'string')) {
      return { ok: false, message: 'Keywords must be a list of words or phrases.' };
    }
    keywords = [...new Set((b.keywords as string[]).map((k) => k.trim()).filter(Boolean))];
    if (keywords.length > MAX_KEYWORDS) return { ok: false, message: `Use at most ${MAX_KEYWORDS} keywords.` };
    if (keywords.some((k) => k.length > KEYWORD_MAX)) {
      return { ok: false, message: `Each keyword must be under ${KEYWORD_MAX} characters.` };
    }
  }
  return { ok: true, value: { title: title || 'Untitled draft', body, keywords } };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True for a well-formed uuid — lets us 404 early on junk ids instead of a database error. */
export function isUuid(id: unknown): id is string {
  return typeof id === 'string' && UUID_RE.test(id);
}
