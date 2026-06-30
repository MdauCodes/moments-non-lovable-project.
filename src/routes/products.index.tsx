import { Link, useSearchParams } from "react-router-dom";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { ProductCard } from "@/components/ProductCard";
import { ConfiguratorModal } from "@/components/ConfiguratorModal";

import { api } from "@/services/api";
import { categories, WHATSAPP_NUMBER } from "@/data/products";

// Customer-intent chips shown when an industry is selected.
// label = plain English the customer thinks in.
// search = backend keyword that returns the right products.
const INDUSTRY_QUICK_FINDS: Record<string, Array<{ label: string; search: string }>> = {
  "food-and-beverage": [
    { label: "Serving hot drinks",          search: "hot cup" },
    { label: "Cold drinks & juice bar",     search: "cold cup" },
    { label: "Takeaway & delivery orders",  search: "takeaway box" },
    { label: "Baked goods & pastry",        search: "cake" },
    { label: "POS & billing receipts",      search: "thermal roll" },
    { label: "Cutlery & plates",            search: "cutlery" },
    { label: "Straws & stirrers",           search: "straw" },
    { label: "Wrapping food",               search: "cling film" },
  ],
  "retail-and-ecommerce": [
    { label: "Customer carry bags",         search: "shopping bag" },
    { label: "POS receipt paper",           search: "thermal roll" },
    { label: "Fresh produce display",       search: "punnet" },
    { label: "Cold drinks & juice",         search: "cold cup" },
    { label: "Mailers & courier packaging", search: "mailer" },
  ],
  "health-and-beauty": [
    { label: "Dispensing & pharmacy bags",  search: "pharmacy bag" },
    { label: "Gloves & hand protection",    search: "gloves" },
    { label: "Face masks & safety",         search: "face mask" },
    { label: "Cosmetics & skincare jars",   search: "jar" },
    { label: "Salon & spa carry bags",      search: "non-woven" },
    { label: "Hairnets & food hygiene",     search: "hairnet" },
  ],
  "agriculture": [
    { label: "Storing grain & cereals",     search: "panel sack" },
    { label: "Packaging fresh produce",     search: "punnet" },
    { label: "Keeping produce fresh",       search: "cling film" },
    { label: "Netting for fresh fruit",     search: "net bag" },
    { label: "Honey & bee products",        search: "honey jar" },
  ],
  "manufacturing": [
    { label: "Sealing & securing goods",    search: "tape" },
    { label: "Worker safety & PPE",         search: "gloves" },
    { label: "Bulk storage & transport",    search: "woven sack" },
    { label: "Pallet & stretch wrapping",   search: "stretch wrap" },
    { label: "Foil & barrier lining",       search: "aluminium foil" },
  ],
  "hospitality": [
    { label: "Serving food (plates & cutlery)", search: "plates" },
    { label: "Hot & cold cups",             search: "cups" },
    { label: "Event & banquet catering",    search: "foil tray" },
    { label: "Takeaway & room service",     search: "takeaway" },
    { label: "Napkins & table linen",       search: "napkin" },
    { label: "Waste & housekeeping",        search: "garbage bag" },
  ],
  "fashion-and-apparel": [
    { label: "Boutique shopping bags",      search: "twisted handle" },
    { label: "Reusable carry bags",         search: "non-woven" },
    { label: "Premium gift packaging",      search: "millinary" },
  ],
  "electronics": [
    { label: "Protective wrapping",         search: "bubble" },
    { label: "Sealing boxes & cartons",     search: "tape" },
  ],
};
import type { Product, Industry } from "@/data/products";
import { getStockInfo } from "@/lib/stock";
import { MOCK_PRODUCTS } from "@/data/mockProducts";

/**
 * Smart loading state for the catalogue.
 * - "ok": real data (or fallback) is in `products`, render grid normally
 * - "fallback": API unreachable / 404 → showing MOCK_PRODUCTS + subtle banner
 * - "empty": API responded with [] and no filters active
 * - "unauthorized": 401/403
 * - "server_error": 500 / unknown — show retry
 */
type LoadState = "ok" | "fallback" | "empty" | "unauthorized" | "server_error";

/** Extract HTTP status from the api layer's `Error("API request failed: 404")`. */
function statusFromError(err: unknown): number | null {
  if (!(err instanceof Error)) return null;
  const m = /(\d{3})/.exec(err.message);
  return m ? Number(m[1]) : null;
}

function classifyError(err: unknown): Exclude<LoadState, "ok" | "empty"> {
  const status = statusFromError(err);
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 404 || status === null) return "fallback"; // null = network/TypeError
  if (status >= 500) return "server_error";
  return "fallback";
}

const sortOptions = ["newest", "price-asc", "price-desc", "popular"] as const;
type SortKey = (typeof sortOptions)[number];

const searchSchema = z.object({
  category: z.string().optional(),
  industry: z.string().optional(),
  q: z.string().optional(),
  newArrivals: z.boolean().optional(),
  deals: z.boolean().optional(),
  fastMoving: z.boolean().optional(),
  inStock: z.boolean().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sort: z.enum(sortOptions).optional(),
});

const PAGE_SIZE = 20;
const CATEGORY_OPTIONS = categories.map((c) => ({ value: c.slug, label: c.name }));
const ALL_PRICE_MAX = 500;



function ProductsPage() {
  const [_searchParams, setSearchParams] = useSearchParams();
  const search = Object.fromEntries(_searchParams.entries());
  const { category, industry: industrySlug, q, sort = "newest" } = search;
  const newArrivals = search.newArrivals === "true";
  const deals = search.deals === "true";
  const fastMoving = search.fastMoving === "true";
  const inStock = search.inStock === "true";
  const minPrice = search.minPrice ? Number(search.minPrice) : undefined;
  const maxPrice = search.maxPrice ? Number(search.maxPrice) : undefined;

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [query, setQuery] = useState(q ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [configuring, setConfiguring] = useState<Product | null>(null);
  const [preTier, setPreTier] = useState<string | null>(null);
  const handleConfigure = (p: Product, tierId?: string) => {
    setPreTier(tierId ?? null);
    setConfiguring(p);
  };
  const [loadState, setLoadState] = useState<LoadState>("ok");
  const [retryTick, setRetryTick] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll: load next page when user scrolls near bottom
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || isLoadingMore || searchResults) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, searchResults]);

  const selectedIndustry = useMemo(
    () => industries.find((i) => i.slug === industrySlug) ?? null,
    [industries, industrySlug],
  );

  const sortParam = useMemo(() => {
    switch (sort) {
      case "price-asc": return "basePrice,asc";
      case "price-desc": return "basePrice,desc";
      case "popular": return "monthlyClicks,desc";
      default: return "createdAt,desc";
    }
  }, [sort]);

  const anyFilterActive = !!(
    industrySlug || category || newArrivals || deals || fastMoving ||
    inStock || minPrice !== undefined || maxPrice !== undefined ||
    (q && q.length > 1)
  );

  // Industries
  useEffect(() => {
    let cancelled = false;
    void api.getIndustries().then((data) => {
      if (!cancelled) setIndustries(data);
    });
    return () => { cancelled = true; };
  }, []);

  // Reset on filter change
  useEffect(() => {
    setPage(0);
  }, [industrySlug, category, newArrivals, deals, fastMoving, inStock, minPrice, maxPrice, sort]);

  // Fetch (wrapped with smart fallback handling — does not change API calls).
  useEffect(() => {
    if (searchResults !== null) return;
    let cancelled = false;
    if (page === 0) setIsLoading(true);
    else setIsLoadingMore(true);

    // Use the diversified (category-interleaved) feed when no filters are
    // active and the user hasn't picked a custom sort. Otherwise fall back to
    // the standard filterable endpoint.
    const useDiversified = !anyFilterActive && sort === "newest";
    const fetcher = useDiversified
      ? api.getDiversifiedProducts({ page, size: PAGE_SIZE })
      : api.getProducts({
          industryId: selectedIndustry?.id,
          category: category || undefined,
          isNewArrival: newArrivals || undefined,
          isDiscount: deals || undefined,
          isFastMoving: fastMoving || undefined,
          page,
          size: PAGE_SIZE,
          sort: sortParam,
        });

    void fetcher
      .then((data) => {
        if (cancelled) return;
        // Client-side post-filter for price + inStock (mock-friendly).
        let filtered = data;
        if (inStock) {
          filtered = filtered.filter(
            (p) => getStockInfo(p, null, 0).state !== "out_of_stock",
          );
        }
        if (minPrice !== undefined) {
          filtered = filtered.filter((p) => (p.basePrice ?? 0) >= minPrice);
        }
        if (maxPrice !== undefined && maxPrice < ALL_PRICE_MAX) {
          filtered = filtered.filter((p) => (p.basePrice ?? 0) <= maxPrice);
        }
        setHasMore(data.length === PAGE_SIZE);
        setProducts((prev) => (page === 0 ? filtered : [...prev, ...filtered]));

        // Empty-state vs ok. Only call it "empty" on the first page with no
        // filters — otherwise it's just a filter that excluded everything.
        if (page === 0 && data.length === 0 && !anyFilterActive) {
          setLoadState("empty");
        } else {
          setLoadState("ok");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const next = classifyError(err);
        setLoadState(next);
        if (page === 0) {
          // Fallback: silently swap in mock catalogue so the UI stays browsable.
          setProducts(next === "fallback" ? MOCK_PRODUCTS : []);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
        setIsLoadingMore(false);
      });

    return () => { cancelled = true; };
  }, [selectedIndustry, category, newArrivals, deals, fastMoving, inStock, minPrice, maxPrice, sortParam, page, searchResults, anyFilterActive, retryTick, sort]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchParams((prev) => { if (query) prev.set("q", query); else prev.delete("q"); return prev; });
      if (query.trim().length < 2) { setSearchResults(null); return; }
      setIsLoading(true);
      void api
        .searchProducts(query.trim(), 12)
        .then((data) => setSearchResults(data))
        .catch(() => setSearchResults([]))
        .finally(() => setIsLoading(false));
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const setParam = (key: string, value: string | number | boolean | undefined) => {
    setSearchParams((prev) => { const v = value; if (v !== undefined && v !== "") prev.set(key, String(v)); else prev.delete(key); return prev; });
  };

  const toggleIndustry = (slug: string) => {
    setSearchParams((prev) => { if (prev.get("industry") === slug) prev.delete("industry"); else prev.set("industry", slug); return prev; });
  };

  const toggle = (key: "newArrivals" | "deals" | "fastMoving" | "inStock") => {
    setSearchParams((prev) => { if (prev.get(key)) prev.delete(key); else prev.set(key, "true"); return prev; });
  };

  const clearAll = () => {
    setQuery("");
    setSearchResults(null);
    setSearchParams(new URLSearchParams());
  };

  // Per-visit randomized order for the default ("newest") sort, so customers
  // see a fresh mix of categories and prices each time they land on the page.
  // Stable per session: each product gets a random rank the first time we see
  // it, so paginating ("Load more") doesn't reshuffle already-rendered cards.
  const shuffleRanks = useRef<Map<string, number>>(new Map());
  const grid = useMemo(() => {
    const base = searchResults ?? products;
    // Honour explicit sort choices — only shuffle on the default sort and
    // when the user has not narrowed the catalogue with category filters.
    if (sort !== "newest" || searchResults) return base;
    const ranks = shuffleRanks.current;
    for (const p of base) {
      if (!ranks.has(p.id)) ranks.set(p.id, Math.random());
    }
    return [...base].sort((a, b) => (ranks.get(a.id) ?? 0) - (ranks.get(b.id) ?? 0));
  }, [searchResults, products, sort]);

  // JSON-LD ItemList for the visible page
  const itemListLd = useMemo(() => {
    if (!grid.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: grid.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://www.momentspackaging.com/products/${p.slug}`,
        name: p.name,
      })),
    };
  }, [grid]);

  // Active filter chips
  const chips: Array<{ label: string; clear: () => void }> = [];
  // Industry is shown in the context banner below — skip adding it here to avoid duplication.
  if (category) {
    const cat = CATEGORY_OPTIONS.find((c) => c.value === category);
    chips.push({ label: cat?.label ?? category, clear: () => setParam("category", undefined) });
  }
  if (newArrivals) chips.push({ label: "New Arrivals", clear: () => setParam("newArrivals", undefined) });
  if (deals) chips.push({ label: "Deals", clear: () => setParam("deals", undefined) });
  if (fastMoving) chips.push({ label: "Fast Moving", clear: () => setParam("fastMoving", undefined) });
  if (inStock) chips.push({ label: "In stock only", clear: () => setParam("inStock", undefined) });
  if (minPrice !== undefined) chips.push({ label: `Min KES ${minPrice}`, clear: () => setParam("minPrice", undefined) });
  if (maxPrice !== undefined) chips.push({ label: `Max KES ${maxPrice}`, clear: () => setParam("maxPrice", undefined) });

  return (
    <SiteLayout>
      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}

      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8 lg:py-16">
          <p className="text-[11px] uppercase tracking-[0.25em] text-primary">Catalogue</p>
          <h1 className="mt-3 font-display text-4xl font-medium text-foreground sm:text-5xl">
            Find packaging for your business
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Filter by your business type, or search for what you need. Minimum 100 units, delivered in Nairobi.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:pb-24 lg:px-8">
        {/* Search */}
        <div className="pt-6">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products — e.g. pizza box, coffee cups, mifuko, cling film..."
              className="w-full rounded-xl border border-border bg-background px-4 py-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter row */}
        <div className="scrollbar-hide mt-4 flex items-center gap-2 overflow-x-auto pb-3">
          {industries.map((ind) => {
            const active = selectedIndustry?.id === ind.id;
            const Icon = ind.icon;
            return (
              <button
                key={ind.id}
                type="button"
                onClick={() => toggleIndustry(ind.slug)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border border-foreground/20 bg-cream text-foreground hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                {ind.name}
              </button>
            );
          })}

          <span className="mx-1 h-5 w-px bg-border" aria-hidden />

          <ToggleChip active={!!newArrivals} onClick={() => toggle("newArrivals")}>New Arrivals</ToggleChip>
          <ToggleChip active={!!deals} onClick={() => toggle("deals")}>Deals</ToggleChip>
          <ToggleChip active={!!fastMoving} onClick={() => toggle("fastMoving")}>Fast Moving</ToggleChip>
          <ToggleChip active={!!inStock} onClick={() => toggle("inStock")}>In stock</ToggleChip>
        </div>

        {/* Refinement bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <label className="flex items-center gap-2 text-xs font-medium text-foreground">
            Category
            <select
              value={category ?? ""}
              onChange={(e) => setParam("category", e.target.value || undefined)}
              className="rounded-full border border-foreground/20 bg-background px-3 py-1.5 text-xs"
            >
              <option value="">All</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-foreground">
            Sort
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value as SortKey)}
              className="rounded-full border border-foreground/20 bg-background px-3 py-1.5 text-xs"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
              <option value="popular">Most popular</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-foreground">
            Price (KES)
            <input
              type="number"
              min={0}
              placeholder="min"
              value={minPrice ?? ""}
              onChange={(e) => setParam("minPrice", e.target.value ? Number(e.target.value) : undefined)}
              className="w-20 rounded-full border border-foreground/20 bg-background px-3 py-1.5 text-xs"
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="number"
              min={0}
              placeholder="max"
              value={maxPrice ?? ""}
              onChange={(e) => setParam("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
              className="w-20 rounded-full border border-foreground/20 bg-background px-3 py-1.5 text-xs"
            />
          </label>

          {anyFilterActive && (
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto whitespace-nowrap text-xs font-medium text-primary hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Active chips */}
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={chip.clear}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}

        {/* Context banner: shows which industry is active */}
        {selectedIndustry && !isLoading && (
          <div className="mt-4 rounded-xl bg-primary/8 px-4 py-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Showing packaging for</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{selectedIndustry.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setParam("industry", undefined)}
                className="ml-4 shrink-0 text-xs font-medium text-primary hover:underline"
              >
                See all
              </button>
            </div>
            {/* What do you need chips — plain-English needs, not product names */}
            {INDUSTRY_QUICK_FINDS[selectedIndustry.slug] && (
              <div className="mt-3">
                <p className="mb-2 text-[11px] text-muted-foreground">What do you need?</p>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRY_QUICK_FINDS[selectedIndustry.slug].map((item) => (
                    <button
                      key={item.search}
                      type="button"
                      onClick={() => { setQuery(item.search); setSearchResults(null); }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        query === item.search
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Browse by business type — shown when no filter active and data is loaded */}
        {!anyFilterActive && !isLoading && !searchResults && industries.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              What does your business do?
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {industries.map((ind) => {
                const Icon = ind.icon;
                return (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => toggleIndustry(ind.slug)}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
                  >
                    {Icon && (
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15">
                        <Icon className="h-4 w-4" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{ind.name}</p>
                      {ind.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {ind.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Subtle banner: API unreachable / 404 → showing mock catalogue. */}
        {!searchResults && loadState === "fallback" && !isLoading && (
          <div className="mt-6 rounded-lg border border-border/60 bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
            Showing sample products — connect to backend to see live catalogue.
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : !searchResults && loadState === "unauthorized" ? (
          <div className="mt-16 rounded-2xl border border-dashed border-border p-16 text-center">
            <h3 className="font-display text-2xl text-foreground">Sign in to view products.</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This catalogue is only visible to signed-in customers.
            </p>
            <Link
              to="/account/login"
              className="mt-5 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign in
            </Link>
          </div>
        ) : !searchResults && loadState === "server_error" ? (
          <div className="mt-16 rounded-2xl border border-dashed border-border p-16 text-center">
            <h3 className="font-display text-2xl text-foreground">
              Something went wrong on our end. Please try again.
            </h3>
            <button
              type="button"
              onClick={() => setRetryTick((n) => n + 1)}
              className="mt-5 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : !searchResults && loadState === "empty" ? (
          <div className="mt-16 rounded-2xl border border-dashed border-border p-16 text-center">
            <h3 className="font-display text-2xl text-foreground">No products listed yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Our catalogue is being prepared. Reach out and we&apos;ll help you directly.
            </p>
            <Link
              to="/contact"
              className="mt-5 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Contact the team
            </Link>
          </div>
        ) : grid.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-border p-12 text-center">
            <h3 className="font-display text-2xl text-foreground">
              {selectedIndustry
                ? `No products listed for ${selectedIndustry.name} yet`
                : "No products match your filters"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedIndustry
                ? "Try a different business type, or contact us — we may have unlisted stock."
                : "Try adjusting your search or filters."}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center rounded-full border border-foreground/20 px-5 py-2.5 text-sm font-medium text-foreground hover:border-foreground/40"
              >
                Clear filters
              </button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20need%20packaging${selectedIndustry ? `%20for%20${encodeURIComponent(selectedIndustry.name)}` : ""}%20and%20can't%20find%20what%20I%20need%20on%20the%20website.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                WhatsApp us
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Result count */}
            {grid.length > 0 && (
              <p className="mt-6 text-xs text-muted-foreground">
                {searchResults
                  ? `${grid.length} result${grid.length === 1 ? "" : "s"} for "${query}"`
                  : selectedIndustry
                  ? `${grid.length}${hasMore ? "+" : ""} product${grid.length === 1 ? "" : "s"} for ${selectedIndustry.name}`
                  : `${grid.length}${hasMore ? "+" : ""} product${grid.length === 1 ? "" : "s"}`}
              </p>
            )}
            <div className="mt-4 grid animate-in fade-in grid-cols-2 gap-3 duration-300 sm:mt-5 sm:gap-5 md:grid-cols-3 lg:gap-6">
              {grid.map((p) => (
                <ProductCard key={p.id} product={p} onConfigure={handleConfigure} />
              ))}
            </div>

            {!searchResults && (
              <div className="mt-10 flex flex-col items-center justify-center gap-2">
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading more products…
                  </div>
                )}
                <div ref={sentinelRef} className="h-1 w-full" />
              </div>
            )}
          </>
        )}
      </section>

      <ConfiguratorModal product={configuring} preSelectedTierId={preTier} onClose={() => setConfiguring(null)} />
    </SiteLayout>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "border border-foreground/20 bg-cream text-foreground hover:border-foreground/40"
      }`}
    >
      {children}
    </button>
  );
}

export default ProductsPage;
