import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ADMIN_LOGOUT_EVENT,
  ADMIN_REFRESH_INTERVAL_MS,
  ADMIN_SESSION_CHANGED_EVENT,
  changeAdminPassword,
  getValidAdminSession,
  loginAdmin,
  logoutAdmin,
  readAdminSession,
  type AdminSession,
} from "@/services/adminApi";
import { defaultPermissionsForRole, hasPerm as hasPermFn, type PermissionCode } from "@/lib/permissions";

export type AdminUser = AdminSession;

interface AdminAuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  /** Effective permissions list — falls back to role bundle if JWT lacks them. */
  permissions: string[];
  hasPermission: (perm: PermissionCode | string) => boolean;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  ensureValidSession: () => Promise<AdminUser | null>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const ensureValidSession = useCallback(async (): Promise<AdminUser | null> => {
    const session = await getValidAdminSession();
    setUser(session);
    return session;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setUser(readAdminSession());

    const syncSession = () => setUser(readAdminSession());
    const syncLogout = () => setUser(null);
    window.addEventListener(ADMIN_SESSION_CHANGED_EVENT, syncSession);
    window.addEventListener(ADMIN_LOGOUT_EVENT, syncLogout);
    window.addEventListener("storage", syncSession);

    void getValidAdminSession().then((session) => {
      setUser(session);
      setIsCheckingSession(false);
    });

    return () => {
      window.removeEventListener(ADMIN_SESSION_CHANGED_EVENT, syncSession);
      window.removeEventListener(ADMIN_LOGOUT_EVENT, syncLogout);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  useEffect(() => {
    if (!user?.refreshToken) return;
    const interval = window.setInterval(() => {
      void ensureValidSession();
    }, ADMIN_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [ensureValidSession, user?.refreshToken]);

  const login = async (email: string, password: string): Promise<void> => {
    const next = await loginAdmin(email, password);
    setUser(next);
  };

  const logout = (): void => {
    setUser(null);
    void logoutAdmin();
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    const next = await changeAdminPassword(currentPassword, newPassword);
    if (next) setUser(next);
  };

  const permissions = useMemo<string[]>(() => {
    if (!user) return [];
    if (user.permissions && user.permissions.length > 0) return user.permissions;
    // Fallback: derive from role until backend tokens carry permissions.
    return defaultPermissionsForRole(user.role);
  }, [user]);

  const hasPermission = useCallback(
    (perm: PermissionCode | string) => hasPermFn(permissions, perm),
    [permissions],
  );

  const value = useMemo<AdminAuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    isCheckingSession,
    isAdmin: !!user?.roles.includes("ROLE_ADMIN"),
    isStaff: !!user?.roles.includes("ROLE_STAFF") || !!user?.isStaff,
    permissions,
    hasPermission,
    mustChangePassword: !!user?.mustChangePassword,
    login,
    logout,
    ensureValidSession,
    changePassword,
  }), [ensureValidSession, hasPermission, isCheckingSession, permissions, user]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAuth must be used within AdminAuthProvider");
  return ctx;
}

export const useAdminAuth = useAuth;

/** Convenience hook: returns the permissions array. */
export function usePermissions(): string[] {
  return useAuth().permissions;
}
