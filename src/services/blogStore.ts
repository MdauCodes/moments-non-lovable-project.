// ----------------------------------------------------------------------------
// Mock blog store — localStorage-backed CRUD that mimics the eventual
// Spring Boot REST contract. Replace each method with a real fetch() call
// once the backend is live; signatures stay the same.
// ----------------------------------------------------------------------------

import { Blog, BlogStatus, BlogTemplate, seedBlogs } from "@/data/blogs";

const STORAGE_KEY = "moments_blogs_v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readAll(): Blog[] {
  if (!isBrowser()) return seedBlogs;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedBlogs));
      return seedBlogs;
    }
    return JSON.parse(raw) as Blog[];
  } catch {
    return seedBlogs;
  }
}

function writeAll(blogs: Blog[]) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function uniqueSlug(base: string, blogs: Blog[], ignoreId?: string): string {
  let slug = base || "untitled";
  let n = 2;
  while (blogs.some((b) => b.slug === slug && b.id !== ignoreId)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

function estimateReadingTime(body: Blog["body"]): number {
  const text = JSON.stringify(body.data);
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export function blogSlugify(input: string): string {
  return slugify(input);
}

// Public API ------------------------------------------------------------------

export const blogStore = {
  list: async (params?: {
    status?: BlogStatus;
    template?: BlogTemplate;
    limit?: number;
  }): Promise<Blog[]> => {
    let result = readAll();
    if (params?.status) result = result.filter((b) => b.status === params.status);
    if (params?.template) result = result.filter((b) => b.template === params.template);
    result = [...result].sort((a, b) => {
      const aDate = a.publishedAt ?? a.updatedAt;
      const bDate = b.publishedAt ?? b.updatedAt;
      return bDate.localeCompare(aDate);
    });
    if (params?.limit) result = result.slice(0, params.limit);
    return result;
  },

  getBySlug: async (slug: string): Promise<Blog | null> => {
    return readAll().find((b) => b.slug === slug) ?? null;
  },

  getById: async (id: string): Promise<Blog | null> => {
    return readAll().find((b) => b.id === id) ?? null;
  },

  create: async (
    input: Omit<Blog, "id" | "slug" | "createdAt" | "updatedAt" | "readingTimeMin"> & {
      slug?: string;
    },
  ): Promise<Blog> => {
    const all = readAll();
    const baseSlug = slugify(input.slug || input.title);
    const slug = uniqueSlug(baseSlug, all);
    const nowIso = new Date().toISOString();
    const blog: Blog = {
      ...input,
      id: `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      slug,
      readingTimeMin: estimateReadingTime(input.body),
      createdAt: nowIso,
      updatedAt: nowIso,
      publishedAt: input.status === "published" ? (input.publishedAt ?? nowIso) : null,
    };
    writeAll([blog, ...all]);
    return blog;
  },

  update: async (id: string, patch: Partial<Blog>): Promise<Blog | null> => {
    const all = readAll();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    const current = all[idx];
    const merged: Blog = { ...current, ...patch, id: current.id };
    if (patch.title && !patch.slug) {
      merged.slug = uniqueSlug(slugify(patch.title), all, id);
    } else if (patch.slug) {
      merged.slug = uniqueSlug(slugify(patch.slug), all, id);
    }
    if (patch.body) {
      merged.readingTimeMin = estimateReadingTime(patch.body);
    }
    if (patch.status === "published" && !current.publishedAt) {
      merged.publishedAt = new Date().toISOString();
    }
    if (patch.status === "draft") {
      merged.publishedAt = null;
    }
    merged.updatedAt = new Date().toISOString();
    all[idx] = merged;
    writeAll(all);
    return merged;
  },

  remove: async (id: string): Promise<boolean> => {
    const all = readAll();
    const next = all.filter((b) => b.id !== id);
    if (next.length === all.length) return false;
    writeAll(next);
    return true;
  },

  resetToSeed: async (): Promise<void> => {
    writeAll(seedBlogs);
  },
};
