import { industries, products as seedProducts, type Product } from "@/data/products";
import { API_BASE_URL } from "@/config/api";
import { adminFetch } from "@/services/adminApi";

const STORAGE_KEY = "moments_products_v1";
const USE_MOCKS = import.meta.env.VITE_USE_MOCK_DATA === "true" || !API_BASE_URL;

type PageResponse<T> = { content: T[] };
type ProductApiDto = Partial<Product> & {
  id: string;
  slug: string;
  name: string;
  primaryImageUrl?: string;
  imageUrls?: string[];
  industries?: Array<{ id?: string | number; displayId?: string | number; slug?: string }>;
};

function toBackendPayload(input: Partial<ProductDraft>) {
  const tiersIn = ((input as any).pricingTiers ?? []) as Array<any>;
  const pricingTiers = tiersIn
    .filter((t) => t && t.collectionName)
    .map((t, index) => {
      const base: Record<string, unknown> = {
        collectionName: String(t.collectionName),
        quantity: Number(t.quantity) || 0,
        pricePerUnit: Number(t.pricePerUnit) || 0,
        sortOrder: index,
      };
      if (t.id) base.id = t.id;
      return base;
    });
  return {
    slug: input.slug,
    name: input.name,
    category: input.category,
    description: input.description,
    moq: input.moq,
    sizes: input.sizes ?? [],
    tags: input.tags ?? [],
    primaryImageUrl: input.primaryImageUrl,
    imageUrls: input.imageUrls ?? [],
    isDiscount: input.isDiscount ?? false,
    discountPercent: input.isDiscount ? input.discountPercent : null,
    isNewArrival: input.isNewArrival ?? false,
    isFastMoving: input.isFastMoving ?? false,
    material: input.material,
    finish: input.finish,
    keywords: input.keywords ?? [],
    industryIds: input.industryIds ?? [],
    sku: input.sku,
    basePrice: input.basePrice,
    compareAtPrice: input.compareAtPrice,
    stock: input.stock,
    lowStockThreshold: Number((input as any).lowStockThreshold ?? 10),
    trackInventory: input.trackInventory,
    variants: input.variants ?? [],
    individualSalesEnabled: (input as any).individualSalesEnabled ?? true,
    pricingTiers,
  };
}

function normalizeIndustryIds(p: ProductApiDto): string[] {
  if (p.industryIds?.length) return p.industryIds.map(String);
  return (p.industries ?? [])
    .map((industry) => industry.id ?? industry.displayId ?? industries.find((i) => i.slug === industry.slug)?.id)
    .filter((id): id is string | number => id !== undefined && id !== null)
    .map(String);
}

function normalizePricingTiers(raw: any): Array<any> {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t) => t && (t.collectionName || t.quantity != null))
    .map((t, i) => {
      const quantity = Number(t.quantity ?? 0) || 0;
      const pricePerUnit = Number(t.pricePerUnit ?? 0) || 0;
      const collectionPrice = Number(t.collectionPrice ?? quantity * pricePerUnit) || 0;
      return {
        id: String(t.id ?? `tier-${i}`),
        collectionName: String(t.collectionName ?? `Tier ${i + 1}`),
        quantity,
        pricePerUnit,
        collectionPrice,
        sortOrder: t.sortOrder != null ? Number(t.sortOrder) : i,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function normalizeProduct(p: ProductApiDto): Product {
  return {
    ...p,
    category: p.category ?? "bags",
    description: p.description ?? "",
    moq: p.moq ?? 1,
    primaryImageUrl: p.primaryImageUrl ?? p.imageUrls?.[0],
    imageUrls: p.imageUrls ?? [],
    isDiscount: p.isDiscount ?? false,
    isNewArrival: p.isNewArrival ?? false,
    isFastMoving: p.isFastMoving ?? false,
    tags: p.tags ?? [],
    sizes: p.sizes ?? [],
    industryIds: normalizeIndustryIds(p),
    totalClicks: p.totalClicks ?? 0,
    monthlyClicks: p.monthlyClicks ?? 0,
    totalEnquiries: p.totalEnquiries ?? 0,
    monthlyEnquiries: p.monthlyEnquiries ?? 0,
    individualSalesEnabled: (p as any).individualSalesEnabled ?? true,
    pricingTiers: normalizePricingTiers((p as any).pricingTiers),
  } as Product;
}

async function adminJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(`/api/v1/admin${path}`, init);
  if (!res.ok) throw new Error(`Admin API request failed: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readAll(): Product[] {
  if (!isBrowser()) return seedProducts;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedProducts));
      return seedProducts;
    }
    return JSON.parse(raw) as Product[];
  } catch {
    return seedProducts;
  }
}

function writeAll(products: Product[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
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

function uniqueSlug(base: string, products: Product[], ignoreId?: string): string {
  let slug = base || "untitled";
  let n = 2;
  while (products.some((p) => p.slug === slug && p.id !== ignoreId)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export type ProductDraft = Omit<Product, "id" | "slug"> & { slug?: string };

export const productStore = {
  list: async (): Promise<Product[]> => {
    if (!USE_MOCKS) {
      const data = await adminJson<PageResponse<Product> | Product[]>("/products?size=100");
      return (Array.isArray(data) ? data : data.content).map(normalizeProduct);
    }
    return [...readAll()].sort((a, b) => (b.monthlyClicks ?? 0) - (a.monthlyClicks ?? 0));
  },

  getById: async (id: string): Promise<Product | null> => {
    if (!USE_MOCKS) {
      const data = await adminJson<Product>(`/products/${encodeURIComponent(id)}`);
      return normalizeProduct(data);
    }
    return readAll().find((p) => p.id === id) ?? null;
  },

  create: async (input: ProductDraft): Promise<Product> => {
    if (!USE_MOCKS) {
      const data = await adminJson<Product>("/products", {
        method: "POST",
        body: JSON.stringify(toBackendPayload(input)),
      });
      return normalizeProduct(data);
    }
    const all = readAll();
    const baseSlug = slugify(input.slug || input.name);
    const slug = uniqueSlug(baseSlug, all);
    const product: Product = {
      ...input,
      id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      slug,
      imageUrls: input.imageUrls?.length ? input.imageUrls : input.primaryImageUrl ? [input.primaryImageUrl] : [],
    };
    writeAll([product, ...all]);
    return product;
  },

  update: async (id: string, patch: Partial<Product>): Promise<Product | null> => {
    if (!USE_MOCKS) {
      const data = await adminJson<Product>(`/products/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(toBackendPayload(patch)),
      });
      return normalizeProduct(data);
    }
    const all = readAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const current = all[idx];
    const merged: Product = { ...current, ...patch, id: current.id };
    if (patch.slug) {
      merged.slug = uniqueSlug(slugify(patch.slug), all, id);
    }
    if (patch.primaryImageUrl && !patch.imageUrls?.length) {
      merged.imageUrls = [patch.primaryImageUrl];
    }
    all[idx] = merged;
    writeAll(all);
    return merged;
  },

  remove: async (id: string): Promise<boolean> => {
    if (!USE_MOCKS) {
      await adminJson<void>(`/products/${encodeURIComponent(id)}`, { method: "DELETE" });
      return true;
    }
    const all = readAll();
    const next = all.filter((p) => p.id !== id);
    if (next.length === all.length) return false;
    writeAll(next);
    return true;
  },

  resetToSeed: async (): Promise<void> => {
    writeAll(seedProducts);
  },
};
