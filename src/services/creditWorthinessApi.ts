import { apiUrl } from "@/config/api";
import { authFetch } from "@/contexts/AuthContext";
import type { CreditReadiness } from "@/services/businessAccountApi";

export type CreditWorthinessInfo = {
  enabled: boolean;
  /** Only present when enabled — the same readiness signal Business Accounts already see. */
  readiness: CreditReadiness | null;
};

export const creditWorthinessApi = {
  async getMine(): Promise<CreditWorthinessInfo> {
    const res = await authFetch(apiUrl("/api/v1/customer/credit-worthiness"));
    if (!res.ok) throw new Error(`Failed to load credit worthiness (${res.status})`);
    return (await res.json()) as CreditWorthinessInfo;
  },
};
