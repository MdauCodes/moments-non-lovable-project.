// ----------------------------------------------------------------------------
// Staff role hierarchy — single source of truth for the UI.
// Backend issues the role on session.staffRole (SUPER_ADMIN, ADMIN, SUPERVISOR,
// PAYMENTS_CONFIRMER, PREPARER, DISPATCHER, STAFF). Permissions still drive
// all UI gating — staffRole is only used for:
//   - role badge in the sidebar
//   - assignment dropdown (you can only assign to equal-or-lower rank)
//   - sidebar narrowing for specialist single-stage roles
// ----------------------------------------------------------------------------

export type StaffRoleName =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "SUPERVISOR"
  | "PAYMENTS_CONFIRMER"
  | "PREPARER"
  | "DISPATCHER"
  | "STAFF";

export const STAFF_ROLE_RANK: Record<StaffRoleName, number> = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  SUPERVISOR: 3,
  PAYMENTS_CONFIRMER: 4,
  PREPARER: 4,
  DISPATCHER: 4,
  STAFF: 5,
};

export const STAFF_ROLE_DISPLAY: Record<StaffRoleName, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrator",
  SUPERVISOR: "Supervisor",
  PAYMENTS_CONFIRMER: "Payments Confirmer",
  PREPARER: "Preparer",
  DISPATCHER: "Dispatcher",
  STAFF: "Staff",
};

/** Inline-styles colour map (background, text) for the role pill chip. */
export const STAFF_ROLE_COLOR: Record<StaffRoleName, { bg: string; fg: string }> = {
  SUPER_ADMIN:        { bg: "#6d28d9", fg: "#f5f3ff" }, // purple
  ADMIN:              { bg: "#1d4ed8", fg: "#eff6ff" }, // blue
  SUPERVISOR:         { bg: "#0f766e", fg: "#ecfeff" }, // teal
  PAYMENTS_CONFIRMER: { bg: "#b45309", fg: "#fffbeb" }, // amber
  PREPARER:           { bg: "#15803d", fg: "#f0fdf4" }, // green
  DISPATCHER:         { bg: "#c2410c", fg: "#fff7ed" }, // orange
  STAFF:              { bg: "#475569", fg: "#f1f5f9" }, // slate/gray
};

/** Specialist single-stage roles get a narrowed sidebar (only their queue + dashboard). */
export const SPECIALIST_ROLES: StaffRoleName[] = [
  "PAYMENTS_CONFIRMER",
  "PREPARER",
  "DISPATCHER",
];

export function normalizeStaffRole(raw: string | undefined | null): StaffRoleName | null {
  if (!raw) return null;
  const upper = String(raw).toUpperCase().replace(/^ROLE_/, "");
  if (upper in STAFF_ROLE_RANK) return upper as StaffRoleName;
  return null;
}

/** Best-effort staffRole from a session, falling back to primary role. */
export function resolveStaffRole(session: {
  staffRole?: string;
  role?: string;
} | null | undefined): StaffRoleName | null {
  if (!session) return null;
  return normalizeStaffRole(session.staffRole) ?? normalizeStaffRole(session.role);
}

/**
 * True if `currentRole` can assign work to a user with `targetRole`.
 * Rule: you can only assign to a STRICTLY LOWER rank than yourself.
 * That means a Supervisor can never assign to Admin, Super Admin, or
 * another Supervisor — only to specialists and Staff below them.
 */
export function canAssignTo(currentRole: StaffRoleName | null, targetRole: string | undefined | null): boolean {
  if (!currentRole) return false;
  const target = normalizeStaffRole(targetRole);
  // Unknown role: be conservative and refuse — backend is the final authority,
  // but the UI shouldn't offer assignments we can't reason about.
  if (!target) return false;
  return STAFF_ROLE_RANK[target] > STAFF_ROLE_RANK[currentRole];
}

export function roleDisplay(role: string | undefined | null): string {
  const n = normalizeStaffRole(role);
  return n ? STAFF_ROLE_DISPLAY[n] : "Signed in";
}
