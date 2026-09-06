import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { PERM } from "@/lib/permissions";
import { useRequirePermission } from "@/lib/useRequirePermission";
import { listSuccessfulPayments, type SuccessfulPayment } from "@/services/commerceApi";
import { reportAdminError } from "@/lib/adminErrorToast";
import { AgeBadge, formatDateShort, formatKes } from "@/components/admin/commerceUi";
import { HelpPanel, HelpAnchor } from "@/components/admin/HelpPanel";
import { fulfillmentTypeShortLabel } from "@/lib/allOrdersBoardColumns";

const PAGE_SIZE = 25;

/** Human-readable label for a PaymentMethod enum value straight off the backend
 *  (PAYHERO/MPESA/BANK_TRANSFER/CASH_ON_DELIVERY) — this page is the one place that shows the
 *  raw gateway/method a payment actually went through, not just "M-Pesa" everywhere else. */
function methodLabel(method: string | null): string {
  switch (method) {
    case "PAYHERO":
      return "PayHero";
    case "MPESA":
      return "M-Pesa";
    case "BANK_TRANSFER":
      return "Bank transfer";
    case "CASH_ON_DELIVERY":
      return "Cash on delivery";
    default:
      return method ?? "—";
  }
}

/**
 * Live-ish feed of every payment that actually succeeded, most recent first — distinct from the
 * "Stuck Payments" page (an action queue for attempts still stuck in INITIATED/PROCESSING), this
 * is purely a read-only ledger: what came in, how much, through which gateway, for which order.
 * Auto-refreshes on a short interval (paused while the tab is hidden) so new payments show up
 * without a manual reload, same reasoning as AdminOrdersContext's own background poll.
 */
function PaymentsLogPage() {
  const allowed = useRequirePermission([PERM.ORDER_VERIFY_PAYMENT, PERM.ORDER_MANAGE_ALL]);
  const [rows, setRows] = useState<SuccessfulPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const refresh = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const res = await listSuccessfulPayments(targetPage, PAGE_SIZE);
      setRows(res.rows);
      setTotalPages(Math.max(1, res.totalPages));
      setTotal(res.total);
    } catch (err) {
      reportAdminError(err, "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh(page);
  }, [page, refresh]);

  // Background refresh — only meaningful on page 0 (the live edge of the feed); paging back
  // through history shouldn't shift under someone mid-review.
  useEffect(() => {
    if (page !== 0) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh(0);
    }, 30_000);
    return () => window.clearInterval(id);
  }, [page, refresh]);

  if (!allowed) return null;

  return (
    <AdminLayout title="Payments" onReload={() => void refresh(page)}>
      <div className="admin-page-stack">
        <HelpAnchor>
          <div className="admin-panel">
            <HelpPanel title="Payments">
              <p>
                Every payment that actually succeeded, most recent first — money that has come in
                through the storefront, regardless of fulfillment type or gateway. This is a
                read-only ledger; a failed or still-pending attempt belongs on the{" "}
                <b>Stuck Payments</b> page instead, not here.
              </p>
            </HelpPanel>
            <div className="admin-section-heading" style={{ padding: "0 4px 10px" }}>
              <span>
                {total} successful payment{total === 1 ? "" : "s"}
              </span>
            </div>
            <div data-admin-table-scroll className="admin-hide-on-mobile-table">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Amount (KES)</th>
                    <th>Method</th>
                    <th>Receipt #</th>
                    <th>Type</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="admin-empty">Loading…</div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="admin-empty">
                          <b>No successful payments yet</b>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.paymentRecordId}>
                        <td>
                          <b>{row.orderReference}</b>
                          {row.isTestOrder && (
                            <span
                              className="admin-badge admin-badge-muted"
                              style={{ marginLeft: 6, fontSize: 9 }}
                            >
                              TEST
                            </span>
                          )}
                        </td>
                        <td>{row.contactName}</td>
                        <td>{row.phone}</td>
                        <td>
                          <b>{formatKes(row.amount)}</b>
                        </td>
                        <td>{methodLabel(row.method)}</td>
                        <td>{row.receiptNumber ?? "—"}</td>
                        <td>{fulfillmentTypeShortLabel(row.fulfillmentType)}</td>
                        <td>
                          {formatDateShort(row.createdAt)} <AgeBadge since={row.createdAt} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div
              className="admin-show-mobile admin-card-list"
              style={{ marginTop: 8, padding: 12 }}
            >
              {loading ? (
                <div className="admin-empty">Loading…</div>
              ) : rows.length === 0 ? (
                <div className="admin-empty">
                  <b>No successful payments yet</b>
                </div>
              ) : (
                rows.map((row) => (
                  <div key={row.paymentRecordId} className="admin-card">
                    <div className="admin-card-row">
                      <b>
                        {row.orderReference}
                        {row.isTestOrder && (
                          <span
                            className="admin-badge admin-badge-muted"
                            style={{ marginLeft: 6, fontSize: 9 }}
                          >
                            TEST
                          </span>
                        )}
                      </b>
                      <b>{formatKes(row.amount)}</b>
                    </div>
                    <div className="admin-card-row">
                      <span>{row.contactName}</span>
                      <span style={{ color: "var(--admin-muted)" }}>{row.phone}</span>
                    </div>
                    <div
                      className="admin-card-row"
                      style={{ fontSize: 11, color: "var(--admin-muted)" }}
                    >
                      <span>
                        {methodLabel(row.method)} · {fulfillmentTypeShortLabel(row.fulfillmentType)}
                      </span>
                      <span>
                        {formatDateShort(row.createdAt)} <AgeBadge since={row.createdAt} />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  padding: "12px 4px",
                }}
              >
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  disabled={page <= 0 || loading}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </button>
                <span style={{ fontSize: 12, color: "var(--admin-muted)" }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  disabled={page >= totalPages - 1 || loading}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </HelpAnchor>
      </div>
    </AdminLayout>
  );
}

export default PaymentsLogPage;
