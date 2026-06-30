import type { Product } from "@/data/products";

export type StockState = "in_stock" | "low_stock" | "out_of_stock" | "untracked";

export interface StockInfo {
  state: StockState;
  available: number;
  threshold: number;
  label: string;
  /** True when an order would exceed available units (backorder mode). */
  isBackorder: boolean;
}

/**
 * Compute stock state for a product or one of its variants.
 * Pass a `variant` to get variant-specific availability.
 */
export function getStockInfo(
  product: Pick<Product, "stock" | "lowStockThreshold" | "trackInventory" | "stockStatus">,
  variant?: { stock?: number } | null,
  requestedQty = 0,
): StockInfo {
  const status = product.stockStatus;
  const threshold = product.lowStockThreshold ?? 50;
  const tracked = product.trackInventory ?? (status !== "MADE_TO_ORDER");
  const available =
    variant && typeof variant.stock === "number"
      ? variant.stock
      : (product.stock ?? 0);

  if (status === "MADE_TO_ORDER") {
    return {
      state: "untracked",
      available: Number.POSITIVE_INFINITY,
      threshold,
      label: "Made to order",
      isBackorder: false,
    };
  }

  if (status === "OUT_OF_STOCK" || (tracked && available <= 0)) {
    return {
      state: "out_of_stock",
      available: 0,
      threshold,
      label: "Place your order — we produce on demand",
      isBackorder: requestedQty > 0,
    };
  }

  if (status === "LOW_STOCK" || (tracked && available > 0 && available <= threshold)) {
    return {
      state: "low_stock",
      available,
      threshold,
      label: `Only ${available.toLocaleString()} left`,
      isBackorder: requestedQty > available,
    };
  }

  if (status === "IN_STOCK" || (tracked && available > threshold)) {
    return {
      state: "in_stock",
      available,
      threshold,
      label: `In stock — ${available.toLocaleString()} units`,
      isBackorder: false,
    };
  }

  return {
    state: "untracked",
    available: Number.POSITIVE_INFINITY,
    threshold,
    label: "In stock",
    isBackorder: false,
  };
}
