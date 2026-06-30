import { apiFetch } from "@/config/api";
import { adminJson } from "@/services/adminApi";

export interface Uom {
  id: string;
  code: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  sortOrder?: number;
}

export async function fetchPublicUoms(): Promise<Uom[]> {
  try {
    const res = await apiFetch("/api/v1/public/uoms");
    if (!res.ok) return [];
    const data = await res.json();
    const list: Uom[] = (Array.isArray(data) ? data : []).map((u: any) => ({
      id: String(u.id),
      code: String(u.code ?? ""),
      name: String(u.name ?? u.code ?? ""),
      description: u.description ?? undefined,
      isDefault: u.isDefault ?? false,
      sortOrder: Number(u.sortOrder ?? 0),
    }));
    return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch {
    return [];
  }
}

export async function adminCreateUom(body: {
  code: string;
  name: string;
  description?: string;
}): Promise<Uom> {
  return adminJson<Uom>("/api/v1/admin/uoms", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
