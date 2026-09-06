import { useEffect } from "react";

const SITE_ORIGIN = "https://momentspackaging.com";

export interface SeoOptions {
  title: string;
  description: string;
  /** Path only (e.g. "/products/kraft-bag"), joined with SITE_ORIGIN — never a full URL, so every
   *  call site can't accidentally point canonical/OG tags at the wrong host (staging vs prod). */
  path: string;
  /** Absolute image URL for OG/Twitter cards — falls back to the site-wide og-image.jpg (set in
   *  index.html) when a page has nothing more specific (e.g. a product with no photo yet). */
  image?: string;
  /** Arbitrary JSON-LD object(s) — Product, Article/BlogPosting, FAQPage, BreadcrumbList, etc.
   *  Injected as an additional <script type="application/ld+json">, alongside (not replacing)
   *  the site-wide Organization block already in index.html — multiple JSON-LD blocks on one
   *  page is valid schema.org practice, not a conflict. */
  jsonLd?: object | object[];
}

function upsertMeta(attr: "name" | "property", key: string, content: string): () => void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  const existed = !!el;
  const previous = el?.getAttribute("content") ?? null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return () => {
    if (!el) return;
    if (existed && previous !== null) {
      el.setAttribute("content", previous);
    } else if (!existed) {
      el.remove();
    }
  };
}

/**
 * Per-route SEO for an otherwise client-only SPA (see index.html's own comment — before this,
 * EVERY route served the exact same title/description/OG tags/canonical, including individual
 * product and blog pages, which is exactly the gap that keeps a crawler — search engine or an
 * AI assistant's own fetcher — from ever understanding what's actually on any page but the
 * homepage). No new dependency (react-helmet etc.) — plain DOM writes in a layout effect,
 * captured and restored on unmount so navigating away always leaves the previous page's tags
 * exactly as they were, chaining correctly back to index.html's own defaults regardless of
 * navigation order.
 */
export function useSeo({ title, description, path, image, jsonLd }: SeoOptions) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const restoreDescription = upsertMeta("name", "description", description);
    const restoreOgTitle = upsertMeta("property", "og:title", title);
    const restoreOgDescription = upsertMeta("property", "og:description", description);
    const restoreOgUrl = upsertMeta("property", "og:url", `${SITE_ORIGIN}${path}`);
    const restoreTwitterTitle = upsertMeta("name", "twitter:title", title);
    const restoreTwitterDescription = upsertMeta("name", "twitter:description", description);
    const restoreOgImage = image ? upsertMeta("property", "og:image", image) : null;
    const restoreTwitterImage = image ? upsertMeta("name", "twitter:image", image) : null;

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const canonicalExisted = !!canonical;
    const previousCanonicalHref = canonical?.getAttribute("href") ?? null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${SITE_ORIGIN}${path}`);

    let jsonLdScript: HTMLScriptElement | null = null;
    if (jsonLd) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.type = "application/ld+json";
      jsonLdScript.dataset.pageSeo = "true";
      jsonLdScript.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(jsonLdScript);
    }

    return () => {
      document.title = previousTitle;
      restoreDescription();
      restoreOgTitle();
      restoreOgDescription();
      restoreOgUrl();
      restoreTwitterTitle();
      restoreTwitterDescription();
      restoreOgImage?.();
      restoreTwitterImage?.();
      if (canonical) {
        if (canonicalExisted && previousCanonicalHref !== null) {
          canonical.setAttribute("href", previousCanonicalHref);
        } else if (!canonicalExisted) {
          canonical.remove();
        }
      }
      jsonLdScript?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, image, JSON.stringify(jsonLd)]);
}
