import { STAFF_ROLE_COLOR, STAFF_ROLE_DISPLAY, normalizeStaffRole } from "@/lib/roles";

interface Props {
  role: string | undefined | null;
  size?: "sm" | "md";
}

export function RoleBadge({ role, size = "sm" }: Props) {
  const n = normalizeStaffRole(role);
  if (!n) return null;
  const c = STAFF_ROLE_COLOR[n];
  const label = STAFF_ROLE_DISPLAY[n];
  return (
    <span
      style={{
        display: "inline-block",
        background: c.bg,
        color: c.fg,
        fontSize: size === "sm" ? 10 : 12,
        fontWeight: 600,
        padding: size === "sm" ? "2px 8px" : "3px 10px",
        borderRadius: 999,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
