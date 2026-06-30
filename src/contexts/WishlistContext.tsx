// ----------------------------------------------------------------------------
// Wishlist — backend-backed, authenticated only.
// Guests have wishlist silently disabled (toggle is a no-op).
// Endpoints:
//   GET    /api/v1/customer/wishlist
//   POST   /api/v1/customer/wishlist/{productId}
//   DELETE /api/v1/customer/wishlist/{productId}
// ----------------------------------------------------------------------------
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch } from "@/config/api";
import { getAccessToken } from "@/contexts/AuthContext";

interface WishlistContextValue {
  ids: Set<string>;
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<boolean>;
  remove: (productId: string) => Promise<void>;
  count: number;
  enabled: boolean;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

async function fetchWishlist(): Promise<string[]> {
  try {
    const res = await apiFetch("/api/v1/customer/wishlist", { auth: true });
    if (!res.ok) return [];
    const data = (await res.json()) as string[] | { productIds?: string[]; items?: { productId: string }[] };
    if (Array.isArray(data)) return data;
    if (data.productIds) return data.productIds;
    if (data.items) return data.items.map((i) => i.productId);
    return [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const enabled = !!getAccessToken();

  useEffect(() => {
    if (!getAccessToken()) { setIds(new Set()); return; }
    let cancelled = false;
    fetchWishlist().then((rows) => {
      if (!cancelled) setIds(new Set(rows));
    });
    return () => { cancelled = true; };
  }, []);

  const toggle = useCallback(async (productId: string): Promise<boolean> => {
    if (!getAccessToken()) return false;
    const isSaved = ids.has(productId);
    const next = new Set(ids);
    if (isSaved) next.delete(productId); else next.add(productId);
    setIds(next);
    try {
      const res = await apiFetch(`/api/v1/customer/wishlist/${encodeURIComponent(productId)}`, {
        method: isSaved ? "DELETE" : "POST",
        auth: true,
      });
      if (!res.ok) {
        // Roll back on failure
        setIds(ids);
        return isSaved;
      }
    } catch {
      setIds(ids);
      return isSaved;
    }
    return !isSaved;
  }, [ids]);

  const remove = useCallback(async (productId: string) => {
    if (!getAccessToken()) return;
    const prev = ids;
    const next = new Set(ids);
    next.delete(productId);
    setIds(next);
    try {
      const res = await apiFetch(`/api/v1/customer/wishlist/${encodeURIComponent(productId)}`, {
        method: "DELETE",
        auth: true,
      });
      if (!res.ok) setIds(prev);
    } catch {
      setIds(prev);
    }
  }, [ids]);

  return (
    <WishlistContext.Provider value={{
      ids,
      has: (id) => ids.has(id),
      toggle,
      remove,
      count: ids.size,
      enabled,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
