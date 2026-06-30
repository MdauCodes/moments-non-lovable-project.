import { apiFetch } from "@/config/api";
import { adminJson } from "@/services/adminApi";

export interface DeliveryZone {
  id: string;
  zoneName: string;
  county: string;
  feeAmount: number;
  active: boolean;
  description?: string;
}

export async function fetchDeliveryZones(): Promise<DeliveryZone[]> {
  try {
    const res = await apiFetch("/api/v1/public/delivery-zones");
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((z: any) => ({
      id: String(z.id),
      zoneName: z.zoneName,
      county: z.county,
      feeAmount: Number(z.feeAmount ?? 0),
      active: z.active ?? true,
      description: z.description,
    }));
  } catch {
    return [];
  }
}

export const adminDeliveryZones = {
  list: () => adminJson<DeliveryZone[]>("/api/v1/admin/delivery-zones"),
  create: (body: { zoneName: string; county: string; feeAmount: number; description?: string }) =>
    adminJson<DeliveryZone>("/api/v1/admin/delivery-zones", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Partial<{ zoneName: string; county: string; feeAmount: number; active: boolean; description: string }>) =>
    adminJson<DeliveryZone>(`/api/v1/admin/delivery-zones/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    adminJson<void>(`/api/v1/admin/delivery-zones/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};
