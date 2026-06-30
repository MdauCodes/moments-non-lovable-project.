import { useNavigate } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/AdminLayout";
import { useAuth } from "@/contexts/AdminAuthContext";
import { adminResources, type IndustryDto, type ProductDto } from "@/services/adminResources";



function AdminProductsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [industries, setIndustries] = useState<IndustryDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ industryId: "", category: "", isDiscount: "", isNewArrival: "", isFastMoving: "" });
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const load = async () => {
    setLoading(true);
    try {
      const [productPage, industryRows] = await Promise.all([
        adminResources.products.list({ ...filters, q: debouncedQ || undefined, page, size: 10, sort: "createdAt,desc" }),
        adminResources.industries.list(),
      ]);
      setProducts(productPage.rows);
      setTotalPages(productPage.totalPages);
      setIndustries(industryRows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [page, filters.industryId, filters.category, filters.isDiscount, filters.isNewArrival, filters.isFastMoving, debouncedQ]);

  // Client-side guard: ensure filters/search visibly apply even if backend ignores them.
  const visibleProducts = useMemo(() => {
    let rows = products;
    if (debouncedQ) {
      rows = rows.filter((p) =>
        [p.name, p.sku, p.category, p.description]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(debouncedQ)),
      );
    }
    if (filters.category) {
      rows = rows.filter((p) => (p.category ?? "").toLowerCase().includes(filters.category.toLowerCase()));
    }
    if (filters.industryId) {
      rows = rows.filter((p) => (p.industryIds ?? []).includes(filters.industryId));
    }
    if (filters.isDiscount) rows = rows.filter((p) => p.isDiscount);
    if (filters.isNewArrival) rows = rows.filter((p) => p.isNewArrival);
    if (filters.isFastMoving) rows = rows.filter((p) => p.isFastMoving);
    return rows;
  }, [products, debouncedQ, filters]);

  const beginCreate = () => navigate("/admin/products/new");
  const beginEdit = (p: ProductDto) => navigate(`/admin/products/${p.id}`);
  const remove = async (p: ProductDto) => {
    if (!isAdmin || !confirm(`Delete ${p.name}?`)) return;
    setSaving(true);
    try {
      await adminResources.products.remove(p.id);
      toast.success("Product deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Products" actionLabel="New product" onAction={beginCreate} onReload={load}>
      <div className="admin-page-stack">
        <div className="admin-panel admin-toolbar" data-admin-toolbar>
          <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 320 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--admin-muted)" }} />
            <input
              className="admin-input"
              style={{ width: "100%", paddingLeft: 30, paddingRight: q ? 28 : 12 }}
              placeholder="Search by name, SKU, category…"
              value={q}
              onChange={(e) => { setPage(0); setQ(e.target.value); }}
            />
            {q && (
              <button
                type="button"
                onClick={() => { setQ(""); setPage(0); }}
                aria-label="Clear search"
                style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "transparent", border: 0, cursor: "pointer", color: "var(--admin-muted)" }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <select
            className="admin-select"
            style={{ maxWidth: 220 }}
            value={filters.industryId}
            onChange={(e) => {
              setPage(0);
              setFilters({ ...filters, industryId: e.target.value });
            }}
          >
            <option value="">All industries</option>
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <input
            className="admin-input"
            style={{ maxWidth: 200 }}
            placeholder="Category"
            value={filters.category}
            onChange={(e) => {
              setPage(0);
              setFilters({ ...filters, category: e.target.value });
            }}
          />
          {(["isDiscount", "isNewArrival", "isFastMoving"] as const).map((key) => (
            <button
              key={key}
              className={`admin-btn ${filters[key] ? "admin-btn-primary" : "admin-btn-ghost"}`}
              onClick={() => {
                setPage(0);
                setFilters({ ...filters, [key]: filters[key] ? "" : "true" });
              }}
            >
              {key.replace("is", "")}
            </button>
          ))}
          {(q || filters.industryId || filters.category || filters.isDiscount || filters.isNewArrival || filters.isFastMoving) && (
            <button
              className="admin-btn admin-btn-ghost"
              onClick={() => {
                setQ("");
                setPage(0);
                setFilters({ industryId: "", category: "", isDiscount: "", isNewArrival: "", isFastMoving: "" });
              }}
            >
              Clear
            </button>
          )}
        </div>
        <div className="admin-panel" data-admin-table-scroll>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price (KES)</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Flags</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>Loading products…</td>
                </tr>
              ) : visibleProducts.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-empty">
                      No products found.{" "}
                      <button className="admin-btn admin-btn-primary" onClick={beginCreate}>
                        Create product
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleProducts.map((p) => {
                  const ss = (p as any).stockStatus ?? "MADE_TO_ORDER";
                  const stockCount = p.stock ?? 0;
                  const stockTone =
                    ss === "MADE_TO_ORDER"
                      ? "var(--admin-muted)"
                      : ss === "OUT_OF_STOCK"
                        ? "#b91c1c"
                        : ss === "LOW_STOCK"
                          ? "#a16207"
                          : "#15803d";
                  const stockText =
                    ss === "MADE_TO_ORDER"
                      ? "Made to order"
                      : ss === "OUT_OF_STOCK"
                        ? "Out of stock"
                        : ss === "LOW_STOCK"
                          ? `${stockCount.toLocaleString()} ⚠ Low`
                          : `${stockCount.toLocaleString()} units`;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          {(p.primaryImageUrl || p.imageUrls?.[0]) && (
                            <img
                              src={p.primaryImageUrl || p.imageUrls?.[0]}
                              alt=""
                              style={{ width: 44, height: 38, objectFit: "cover", borderRadius: 6 }}
                            />
                          )}
                          <b>{p.name}</b>
                        </div>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{p.sku || "—"}</td>
                      <td>{p.basePrice != null ? p.basePrice.toLocaleString() : "—"}</td>
                      <td style={{ color: stockTone, fontWeight: 600 }}>{stockText}</td>
                      <td>{p.category || "—"}</td>
                      <td>
                        {[p.isDiscount && "Discount", p.isNewArrival && "New", p.isFastMoving && "Fast"]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </td>
                      <td>
                        <button className="admin-btn admin-btn-ghost" onClick={() => beginEdit(p)}>
                          <Pencil size={14} />
                          Edit
                        </button>
                        {isAdmin && (
                          <button
                            className="admin-btn admin-btn-danger"
                            disabled={saving}
                            onClick={() => void remove(p)}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="admin-toolbar">
          <button
            className="admin-btn admin-btn-ghost"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <span className="admin-label">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="admin-btn admin-btn-ghost"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
      
    </AdminLayout>
  );
}

export default AdminProductsPage;
