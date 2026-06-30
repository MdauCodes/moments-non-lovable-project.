import { useEffect, useState } from "react";
import { adminResources } from "@/services/adminResources";

const STORAGE_KEY = "moments_admin_mock_mode";
const EVENT = "moments-admin-mock-mode-changed";

export function readCachedMockMode(): boolean | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "1") return true;
  if (v === "0") return false;
  return null;
}

export function writeCachedMockMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { enabled } }));
}

export function useMockModeState() {
  const [enabled, setEnabled] = useState<boolean | null>(() => readCachedMockMode());
  const [message, setMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    adminResources.mockMode.get()
      .then((s) => {
        if (cancelled) return;
        setEnabled(!!s.enabled);
        setMessage(s.message);
        writeCachedMockMode(!!s.enabled);
      })
      .catch(() => { /* not all roles can read — ignore silently */ });

    const sync = (e: Event) => {
      const detail = (e as CustomEvent<{ enabled: boolean }>).detail;
      if (detail) setEnabled(detail.enabled);
    };
    window.addEventListener(EVENT, sync);
    return () => { cancelled = true; window.removeEventListener(EVENT, sync); };
  }, []);

  return { enabled, message };
}
