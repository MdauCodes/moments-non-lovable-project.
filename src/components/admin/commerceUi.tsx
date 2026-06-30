// ----------------------------------------------------------------------------
// Shared UI helpers for the e-commerce admin (orders / payments / dashboard).
// Pure presentation — no business logic.
// ----------------------------------------------------------------------------
import type { OrderStatus, PaymentStatus, PaymentGateway } from "@/services/commerceMock";

export function formatKes(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  return `KES ${safe.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
}

export function formatDateShort(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-KE", { day: "2-digit", month: "short" });
}

// Matches backend OrderStatus enum exactly
const ORDER_TONE: Record<OrderStatus, { bg: string; fg: string; label: string }> = {
  PENDING_PAYMENT: { bg: "rgba(234, 179, 8, 0.15)", fg: "#a16207", label: "Pending payment" },
  PAID: { bg: "rgba(34, 197, 94, 0.15)", fg: "#15803d", label: "Paid" },
  PAYMENT_VERIFIED: { bg: "rgba(13, 148, 136, 0.18)", fg: "#0f766e", label: "Payment verified" },
  IN_PRODUCTION: { bg: "rgba(59, 130, 246, 0.15)", fg: "#1d4ed8", label: "In production" },
  READY_FOR_DISPATCH: { bg: "rgba(99, 102, 241, 0.15)", fg: "#4338ca", label: "Ready for dispatch" },
  DISPATCHED: { bg: "rgba(168, 85, 247, 0.15)", fg: "#7e22ce", label: "Dispatched" },
  DELIVERED: { bg: "rgba(20, 184, 166, 0.18)", fg: "#0f766e", label: "Delivered" },
  CANCELLED: { bg: "rgba(107, 114, 128, 0.18)", fg: "#374151", label: "Cancelled" },
  REFUNDED: { bg: "rgba(244, 63, 94, 0.15)", fg: "#be123c", label: "Refunded" },
};

// Matches backend PaymentStatus enum exactly
const PAYMENT_TONE: Record<PaymentStatus, { bg: string; fg: string; label: string }> = {
  PENDING: { bg: "rgba(234, 179, 8, 0.15)", fg: "#a16207", label: "Pending" },
  PAID: { bg: "rgba(34, 197, 94, 0.15)", fg: "#15803d", label: "Paid" },
  FAILED: { bg: "rgba(239, 68, 68, 0.15)", fg: "#b91c1c", label: "Failed" },
  REFUNDED: { bg: "rgba(244, 63, 94, 0.15)", fg: "#be123c", label: "Refunded" },
};

// Matches backend PaymentMethod enum exactly
const GATEWAY_LABEL: Record<PaymentGateway, string> = {
  PAYHERO: "PayHero",
  MPESA: "M-Pesa",
  BANK_TRANSFER: "Bank transfer",
  CASH_ON_DELIVERY: "Cash on delivery",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const tone = ORDER_TONE[status] ?? { bg: "rgba(107,114,128,0.15)", fg: "#374151", label: status };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        background: tone.bg,
        color: tone.fg,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {tone.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const tone = PAYMENT_TONE[status] ?? { bg: "rgba(234,179,8,0.15)", fg: "#a16207", label: status };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        background: tone.bg,
        color: tone.fg,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {tone.label}
    </span>
  );
}

export function GatewayChip({ gateway }: { gateway: PaymentGateway }) {
  const label = GATEWAY_LABEL[gateway] ?? gateway;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 7px",
        borderRadius: 6,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.04em",
        background: "var(--admin-surface-2)",
        color: "var(--admin-text)",
        border: "1px solid var(--admin-border)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function MockBanner({ source }: { source: "live" | "mock" }) {
  if (source === "live") return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 8,
        background: "rgba(234, 179, 8, 0.12)",
        border: "1px solid rgba(234, 179, 8, 0.3)",
        color: "#92400e",
        fontSize: 12,
        marginBottom: 14,
      }}
    >
      <span style={{ fontWeight: 600 }}>Demo data</span>
      <span style={{ opacity: 0.85 }}>
        Showing illustrative figures. Live data will appear once the backend endpoint is reachable.
      </span>
    </div>
  );
}

// Matches backend OrderStatus enum exactly — used in status update dropdowns
export const ORDER_STATUS_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING_PAYMENT", label: "Pending payment" },
  { value: "PAID", label: "Paid" },
  { value: "PAYMENT_VERIFIED", label: "Payment Verified" },
  { value: "IN_PRODUCTION", label: "In production" },
  { value: "READY_FOR_DISPATCH", label: "Ready for dispatch" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

export const GATEWAY_OPTIONS: { value: PaymentGateway | "ALL"; label: string }[] = [
  { value: "ALL", label: "All gateways" },
  { value: "PAYHERO", label: "PayHero" },
  { value: "MPESA", label: "M-Pesa" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "CASH_ON_DELIVERY", label: "Cash on delivery" },
];
