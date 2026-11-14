// Owner: Oggy. Server-only OpenAI wrapper. Never import this from a
// 'use client' file — it reads OPENAI_API_KEY.
import 'server-only';
import OpenAI, { APIConnectionTimeoutError, APIError, OpenAIError } from 'openai';
import type { GenerationFailureReason } from '@/lib/types';

// 20 s per attempt, up to 2 automatic retries on timeouts / 429 / 5xx
// (Algorithm 1: "send to GPT API → retry on failure").
// Created on first use, so teammates without OPENAI_API_KEY can still build.
let client: OpenAI | null = null;
function getClient() {
  client ??= new OpenAI({ timeout: 20_000, maxRetries: 2 });
  return client;
}

export const MODEL = process.env.OPENAI_MODEL || 'gpt-5.4-mini';

// Newer "reasoning" models (gpt-5.x, o-series) think before answering, which
// costs time. Low effort keeps us inside NFR-03 (90% under 10 s). Older models
// such as gpt-4.1-mini reject this setting, so only send it where supported.
function reasoningFor(model: string) {
  return /^(gpt-5|o\d)/.test(model) ? { reasoning: { effort: 'low' as const } } : {};
}

type JsonSchema = {
  type: 'object';
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
};

/** Calls the model with Structured Outputs and returns the parsed JSON. Throws on failure. */
export async function generateJson<T>(opts: {
  name: string;
  schema: JsonSchema;
  instructions: string;
  input: string;
  maxOutputTokens?: number;
}): Promise<T> {
  const response = await getClient().responses.create({
    model: MODEL,
    instructions: opts.instructions,
    input: opts.input,
    max_output_tokens: opts.maxOutputTokens ?? 2000,
    ...reasoningFor(MODEL),
    text: {
      format: { type: 'json_schema', name: opts.name, strict: true, schema: opts.schema },
    },
  });
  return JSON.parse(response.output_text) as T;
}

/**
 * Turns an error from a model call into a reason the UI can explain (§8: a 429 for missing
 * credit used to show up as "did not respond in time"). The SDK has already retried by now.
 */
export function classifyOpenAIError(err: unknown): GenerationFailureReason {
  if (err instanceof APIConnectionTimeoutError) return 'timeout';
  if (err instanceof APIError) {
    const code = `${err.code ?? ''} ${err.type ?? ''}`.toLowerCase();
    const message = (err.message ?? '').toLowerCase();
    if (err.status === 429) {
      // insufficient_quota is the documented code; production has also returned credit_balance_exhausted
      const outOfCredit =
        code.includes('insufficient_quota') ||
        code.includes('credit_balance_exhausted') ||
        message.includes('quota') ||
        message.includes('credit');
      return outOfCredit ? 'quota' : 'rate_limit';
    }
    if (err.status === 401) return 'config';
    if (code.includes('model_not_found') || (err.status === 404 && message.includes('model'))) return 'config';
  }
  // The client throws this before any request if OPENAI_API_KEY is missing
  if (err instanceof OpenAIError && /api[_ ]?key/i.test(err.message)) return 'config';
  return 'unknown';
}

/** Error details for server logs only, with anything that looks like an API key masked. */
export function describeOpenAIError(err: unknown): string {
  const redact = (text: string) => text.replace(/sk-[\w*.-]+/g, 'sk-[redacted]');
  if (err instanceof APIError) {
    return redact(
      `status=${err.status ?? 'none'} code=${err.code ?? 'none'} type=${err.type ?? 'none'} ` +
        `request_id=${err.requestID ?? 'none'} message=${err.message}`,
    );
  }
  return redact(err instanceof Error ? err.message : String(err));
}

/** Asks the model for a {title, body} JSON object. Throws on failure. */
export async function generateTitleAndBody(
  instructions: string,
  input: string,
): Promise<{ title: string; body: string }> {
  const parsed = await generateJson<{ title?: unknown; body?: unknown }>({
    name: 'marketing_content',
    instructions,
    input,
    schema: {
      type: 'object',
      properties: { title: { type: 'string' }, body: { type: 'string' } },
      required: ['title', 'body'],
      additionalProperties: false,
    },
  });
  const title = typeof parsed.title === 'string' ? parsed.title.trim() : '';
  const body = typeof parsed.body === 'string' ? parsed.body.trim() : '';
  // Empty output must never be shown as success (FR-08 acceptance criterion).
  if (!body) throw new Error('Model returned an empty body');
  return { title: title.slice(0, 200) || 'Untitled draft', body: body.slice(0, 20_000) };
}
