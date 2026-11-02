// Owner: Oggy. FR-15 SEO analysis — Algorithm 3 (SEO part). Pure function,
// no API call, so it's instant, free and unit-testable.
//
// Score rubric (proposed in Kerem's review, adopted by Oggy):
//   score = 0.70 × body coverage + 0.30 × title coverage
//   coverage = fraction of target keywords that appear at least once.
// No keywords → score is null with a suggestion to add some.
// Per-keyword occurrences and density (occurrences ÷ word count) are
// reported as in Algorithm 3. This is a local indicator of keyword use,
// not a prediction of search ranking.
import type { KeywordStat } from '@/lib/types';

export const MIN_ANALYSIS_WORDS = 20;

export type SeoReport = {
  seoScore: number | null;
  keywordStats: KeywordStat[];
  wordCount: number;
  suggestion: string | null;
};

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[#@]/g, ' ') // "#brunch" counts as "brunch"
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function countWords(text: string): number {
  const n = normalise(text);
  return n ? n.split(' ').length : 0;
}

/** Whole-word / whole-phrase occurrences, case-insensitive. */
export function countOccurrences(text: string, keyword: string): number {
  const t = ` ${normalise(text)} `;
  const k = normalise(keyword);
  if (!k) return 0;
  let count = 0;
  let from = 0;
  const needle = ` ${k} `;
  while (true) {
    const i = t.indexOf(needle, from);
    if (i === -1) break;
    count++;
    from = i + needle.length - 1; // allow back-to-back matches sharing a space
  }
  return count;
}

export function analyseSeo(title: string, body: string, keywords: string[]): SeoReport {
  const wordCount = countWords(body);
  const unique = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))];

  if (unique.length === 0) {
    return {
      seoScore: null,
      keywordStats: [],
      wordCount,
      suggestion: 'Add target keywords to get an SEO score.',
    };
  }

  const keywordStats = unique.map((keyword) => {
    const occurrences = countOccurrences(body, keyword);
    const density = wordCount ? Math.round((occurrences / wordCount) * 10000) / 10000 : 0;
    return { keyword, occurrences, density };
  });

  const inBody = keywordStats.filter((s) => s.occurrences > 0).length / unique.length;
  const inTitle = unique.filter((k) => countOccurrences(title, k) > 0).length / unique.length;
  const seoScore = Math.round((0.7 * inBody + 0.3 * inTitle) * 100) / 100;

  const missing = keywordStats.filter((s) => s.occurrences === 0).map((s) => s.keyword);
  const titleMissing = unique.filter((k) => countOccurrences(title, k) === 0);
  let suggestion: string | null = null;
  if (missing.length) suggestion = `Use these keywords in the text: ${missing.join(', ')}.`;
  else if (titleMissing.length) suggestion = `Try working "${titleMissing[0]}" into the title.`;

  return { seoScore, keywordStats, wordCount, suggestion };
}
