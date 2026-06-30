import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  wrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    flexDirection: "column",
    gap: 8,
    color: "var(--admin-muted)",
    fontFamily: "var(--font-sans)",
  },
  title: { fontSize: 16, fontWeight: 600, color: "var(--admin-text)" },
  sub: { fontSize: 12, color: "var(--admin-muted)" },
};

export function ComingSoon({ label }: { label: string }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.title}>{label}</div>
      <div style={styles.sub}>Coming soon</div>
    </div>
  );
}

export default ComingSoon;
