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
