import type { Product } from "@/data/products";
import { industries } from "@/data/products";

/**
 * Weighted ranked product search.
 *
 * Ranking signals (highest → lowest):
 *   1. Name           — exact, prefix, contains
 *   2. Popularity     — `monthlyClicks` (small additive boost)
 *   3. Industry       — name + keywords
 *   4. Description    — phrase + token contains
 *   5. Everything else — material, finish, sizes, tags, category, custom keywords
 *
 * The Java/Spring backend should mirror these weights (see backendSpec.md
 * §6 "Search ranking"). Until the backend is live we run this client-side
 * over the in-memory `products` array; the function signature is identical
 * to what `GET /api/v1/public/products/search?q=` will return.
 */

const WEIGHTS = {
  // Name
  nameExact: 1000,
  namePrefix: 600,
  nameContains: 400,
  nameToken: 220,
  // Industry
  industryExact: 180,
  industryContains: 120,
  industryKeyword: 90,
  // Description
  descriptionPhrase: 80,
  descriptionToken: 35,
  // Other fields
  categoryMatch: 60,
  tagMatch: 50,
  materialMatch: 45,
  finishMatch: 30,
  sizeMatch: 25,
  customKeywordMatch: 70,
} as const;

const POPULARITY_DIVISOR = 50; // tiny additive — never overrides relevance

const norm = (s: string) => s.toLowerCase().trim();
const tokenize = (s: string) =>
  norm(s)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 0);

function scoreProduct(p: Product, qRaw: string): number {
  const q = norm(qRaw);
  if (!q) return 0;
  const tokens = tokenize(qRaw);
  if (tokens.length === 0) return 0;

  let score = 0;

  // 1. NAME ----------------------------------------------------------------
  const name = norm(p.name);
  if (name === q) score += WEIGHTS.nameExact;
  else if (name.startsWith(q)) score += WEIGHTS.namePrefix;
  else if (name.includes(q)) score += WEIGHTS.nameContains;
  else {
    const nameTokens = new Set(tokenize(p.name));
    const hits = tokens.filter((t) => nameTokens.has(t)).length;
    if (hits > 0) score += WEIGHTS.nameToken * hits;
  }

  // 3. INDUSTRY ------------------------------------------------------------
  const productIndustries = industries.filter((i) => p.industryIds.includes(i.id));
  for (const ind of productIndustries) {
    const indName = norm(ind.name);
    if (indName === q) score += WEIGHTS.industryExact;
    else if (indName.includes(q)) score += WEIGHTS.industryContains;
    if (ind.keywords?.some((kw) => norm(kw).includes(q) || q.includes(norm(kw)))) {
      score += WEIGHTS.industryKeyword;
    }
  }

  // 4. DESCRIPTION ---------------------------------------------------------
  if (p.description) {
    const desc = norm(p.description);
    if (desc.includes(q)) score += WEIGHTS.descriptionPhrase;
    else {
      const descTokens = new Set(tokenize(p.description));
      const hits = tokens.filter((t) => descTokens.has(t)).length;
      if (hits > 0) score += WEIGHTS.descriptionToken * hits;
    }
  }

  // 5. OTHER FIELDS --------------------------------------------------------
  if (norm(p.category).includes(q)) score += WEIGHTS.categoryMatch;
  for (const tag of p.tags) {
    if (norm(tag).includes(q)) score += WEIGHTS.tagMatch;
  }
  if (p.material && norm(p.material).includes(q)) score += WEIGHTS.materialMatch;
  if (p.finish && norm(p.finish).includes(q)) score += WEIGHTS.finishMatch;
  for (const size of p.sizes) {
    if (norm(size).includes(q)) {
      score += WEIGHTS.sizeMatch;
      break;
    }
  }
  if (p.keywords) {
    for (const kw of p.keywords) {
      const k = norm(kw);
      if (k === q || k.includes(q) || q.includes(k)) {
        score += WEIGHTS.customKeywordMatch;
      }
    }
  }

  // 2. POPULARITY (tiny boost — only matters as a tie-breaker) -------------
  if (score > 0) {
    score += Math.min(p.monthlyClicks / POPULARITY_DIVISOR, 25);
  }

  return score;
}

export interface RankedHit {
  product: Product;
  score: number;
}

export function rankProducts(products: Product[], query: string): RankedHit[] {
  const q = norm(query);
  if (!q) return [];
  return products
    .map((p) => ({ product: p, score: scoreProduct(p, query) }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function searchProducts(products: Product[], query: string, limit?: number): Product[] {
  const ranked = rankProducts(products, query);
  const sliced = typeof limit === "number" ? ranked.slice(0, limit) : ranked;
  return sliced.map((h) => h.product);
}
