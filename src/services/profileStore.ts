// ----------------------------------------------------------------------------
// Customer profile + addresses — mock-live hybrid.
// ----------------------------------------------------------------------------
import { apiUrl } from "@/config/api";
import { authFetch, getAccessToken } from "@/contexts/AuthContext";

export interface CustomerAddress {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  city: string;
  isDefault: boolean;
}

export interface CustomerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addresses: CustomerAddress[];
}

const PROFILE_KEY = "mpk_profile_v1";

function read(): CustomerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as CustomerProfile) : null;
  } catch {
    return null;
  }
}

function write(p: CustomerProfile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function blank(): CustomerProfile {
  return { firstName: "", lastName: "", email: "", phone: "", addresses: [] };
}

async function tryLive<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await authFetch(apiUrl(path), init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function genId() {
  return Math.random().toString(36).slice(2, 11);
}

export const profileStore = {
  async get(): Promise<{ profile: CustomerProfile; source: "live" | "mock" }> {
    if (getAccessToken()) {
      const live = await tryLive<CustomerProfile>("/api/v1/customer/profile");
      if (live) {
        live.addresses = live.addresses ?? [];
        write(live);
        return { profile: live, source: "live" };
      }
    }
    const local = read();
    if (local) local.addresses = local.addresses ?? [];
    return { profile: local ?? blank(), source: "mock" };
  },

  async save(profile: CustomerProfile): Promise<{ profile: CustomerProfile; source: "live" | "mock" }> {
    if (getAccessToken()) {
      const live = await tryLive<CustomerProfile>("/api/v1/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (live) {
        write(live);
        return { profile: live, source: "live" };
      }
    }
    write(profile);
    return { profile, source: "mock" };
  },

  async addAddress(addr: Omit<CustomerAddress, "id">): Promise<CustomerProfile> {
    const { profile } = await this.get();
    const newAddr: CustomerAddress = { ...addr, id: genId() };
    if (newAddr.isDefault) profile.addresses.forEach((a) => (a.isDefault = false));
    if (profile.addresses.length === 0) newAddr.isDefault = true;
    profile.addresses.push(newAddr);
    const { profile: saved } = await this.save(profile);
    return saved;
  },

  async removeAddress(id: string): Promise<CustomerProfile> {
    const { profile } = await this.get();
    profile.addresses = profile.addresses.filter((a) => a.id !== id);
    if (profile.addresses.length > 0 && !profile.addresses.some((a) => a.isDefault)) {
      profile.addresses[0].isDefault = true;
    }
    const { profile: saved } = await this.save(profile);
    return saved;
  },

  async setDefault(id: string): Promise<CustomerProfile> {
    const { profile } = await this.get();
    profile.addresses.forEach((a) => (a.isDefault = a.id === id));
    const { profile: saved } = await this.save(profile);
    return saved;
  },
};
