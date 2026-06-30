/**
 * fix2.mjs — Run after fix-all.mjs: node fix2.mjs
 * Handles all remaining tsc errors.
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const ROOT = dirname(fileURLToPath(import.meta.url));
let fixed = 0;

function fixFile(relPath, fn) {
  const abs = join(ROOT, relPath);
  let src;
  try { src = readFileSync(abs, "utf-8"); } catch { console.log("  MISSING:", relPath); return; }
  const out = fn(src);
  if (out !== src) {
    writeFileSync(abs, out, "utf-8");
    console.log("✓", relPath);
    fixed++;
  } else {
    console.log("  (no change)", relPath);
  }
}

// ── PageProgressBar — replace useRouterState with useNavigation ───────────────
fixFile("src/components/PageProgressBar.tsx", (s) => {
  s = s.replace(
    'import { useEffect, useRef, useState } from "react";',
    'import { useEffect, useRef, useState } from "react";\nimport { useNavigation } from "react-router-dom";'
  );
  s = s.replace(
    /const status = useRouterState\(\{[^}]+\}\);/,
    'const status = useNavigation().state !== "idle" ? "pending" : "idle";'
  );
  return s;
});

// ── AdminLayout — remove @tanstack/react-router import ────────────────────────
fixFile("src/layouts/AdminLayout.tsx", (s) => {
  // Remove the @tanstack import line entirely
  s = s.replace(/^import \{[^}]+\} from "@tanstack\/react-router";\n?/m, "");
  return s;
});

// ── SiteHeader — fix activeProps → NavLink ────────────────────────────────────
fixFile("src/components/SiteHeader.tsx", (s) => {
  // The "Shop" Link with activeProps - convert to NavLink
  s = s.replace(
    `<Link
                to="/products"
                className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground lg:px-4"
                activeProps={{ className: "bg-secondary text-foreground" }}
                onClick={() => setShopOpen(false)}
              >`,
    `<NavLink
                to="/products"
                className={({ isActive }) => \`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors lg:px-4 \${isActive ? "bg-secondary text-foreground" : "text-foreground/80 hover:bg-secondary hover:text-foreground"}\`}
                onClick={() => setShopOpen(false)}
              >`
  );
  // Close tag </Link> → </NavLink> for the Shop link (right before ChevronDown)
  // The Shop Link closes after ChevronDown and "Shop" text
  // We need to find the right closing tag - it comes before the dropdown div
  s = s.replace(
    `              </Link>

              {shopOpen && (`,
    `              </NavLink>

              {shopOpen && (`
  );

  // simpleNav map - Links with activeProps
  s = s.replace(
    `              <Link
                key={n.label}
                to={n.to}
                search={n.search as never}
                className={\`rounded-full px-3 py-2 text-sm font-medium transition-colors lg:px-4 \${
                  n.label === "Deals"
                    ? "text-forest hover:bg-forest/10"
                    : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                }\`}
              >
                {n.label}
              </Link>`,
    `              <NavLink
                key={n.label}
                to={n.to}
                className={({ isActive }) => \`rounded-full px-3 py-2 text-sm font-medium transition-colors lg:px-4 \${
                  isActive ? "bg-secondary text-foreground"
                  : n.label === "Deals" ? "text-forest hover:bg-forest/10"
                  : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                }\`}
              >
                {n.label}
              </NavLink>`
  );

  // Generic: replace remaining activeProps on any Link
  s = s.replace(
    /(<Link\b[^>]*)\s+activeProps=\{\{[^}]+\}\}/g,
    "$1"
  );

  // Fix the simpleNav type — add path for Deals
  s = s.replace(
    "{ to: \"/products\", label: \"Deals\", search: { deals: true } },",
    "{ to: \"/products?deals=true\", label: \"Deals\" },"
  );
  // Also remove search property from SimpleNav type and usage
  s = s.replace(
    "type SimpleNav = { to: \"/products\" | \"/enterprise-quote\" | \"/orders/track\" | \"/company-profile\" | \"/about\"; label: string; search?: Record<string, unknown> };",
    "type SimpleNav = { to: string; label: string };"
  );

  return s;
});

// ── ProductCard — fix TanStack navigate with params ───────────────────────────
fixFile("src/components/ProductCard.tsx", (s) => {
  s = s.replace(
    'navigate({ to: "/products/$slug", params: { slug: p.slug } });',
    "navigate(`/products/${p.slug}`);"
  );
  // Fix: stock.state !== "made_to_order" — if stock.state union doesn't include "made_to_order",
  // cast it or use a different check. The error is TS2367 (comparison has no overlap).
  // "made_to_order" might be a valid state the backend sends even if not in the union type.
  s = s.replace(
    'stock.state !== "made_to_order"',
    '(stock.state as string) !== "made_to_order"'
  );
  return s;
});

// ── SiteFooter — fix Link search props ───────────────────────────────────────
fixFile("src/components/SiteFooter.tsx", (s) => {
  // Fix: <Link to="/products" search={{ category: c.slug }} className=...>
  s = s.replace(
    '<Link to="/products" search={{ category: c.slug }} className="hover:text-accent">',
    '<Link to={`/products?category=${c.slug}`} className="hover:text-accent">'
  );
  // Fix: <Link to="/products" search={{ deals: true }} className=...>
  s = s.replace(
    '<Link to="/products" search={{ deals: true }} className="hover:text-accent">',
    '<Link to="/products?deals=true" className="hover:text-accent">'
  );
  return s;
});

// ── IndustriesStrip — fix Link search ────────────────────────────────────────
fixFile("src/components/IndustriesStrip.tsx", (s) => {
  s = s.replace(
    /(<Link\s+to="\/products"\s+)search=\{\{ industry: ind\.slug \}\}/g,
    "$1to={`/products?industry=${ind.slug}`}"
  );
  // The above replaces `to="/products"` and adds the new `to=` inline — need to remove old `to`
  s = s.replace(
    /to="\/products"\s+to=\{`\/products\?industry=\$\{ind\.slug\}`\}/g,
    'to={`/products?industry=${ind.slug}`}'
  );
  return s;
});

// ── SearchCommand — fix navigate and Link search ──────────────────────────────
fixFile("src/components/SearchCommand.tsx", (s) => {
  s = s.replace(
    'void navigate({ to: "/products/$slug", params: { slug: target.slug } });',
    "void navigate(`/products/${target.slug}`);"
  );
  s = s.replace(
    '<Link\n                          to="/products"\n                          search={{ industry: ind.slug }}',
    "<Link\n                          to={`/products?industry=${ind.slug}`}"
  );
  // Fallback one-liner version
  s = s.replace(
    /to="\/products"\s+search=\{\{ industry: ind\.slug \}\}/g,
    "to={`/products?industry=${ind.slug}`}"
  );
  return s;
});

// ── account.login — fix navigate({ to: dest as "type" }) ─────────────────────
fixFile("src/routes/account.login.tsx", (s) => {
  s = s.replace(
    /navigate\(\{\s*to:\s*(\w+)\s+as\s+"[^"]+"\s*\}\)/g,
    "navigate($1)"
  );
  return s;
});

// ── account.register — fix navigate({ to, search }) ──────────────────────────
fixFile("src/routes/account.register.tsx", (s) => {
  s = s.replace(
    'navigate({ to: "/account/verify", search: { email: email.trim() } });',
    "navigate(`/account/verify?email=${encodeURIComponent(email.trim())}`);"
  );
  return s;
});

// ── account.dashboard — fix undefined `reference` variable ────────────────────
fixFile("src/routes/account.dashboard.tsx", (s) => {
  // All occurrences of `${reference}` in URL template literals should be `${o.reference}`
  s = s.replace(/`\/account\/orders\/\$\{reference\}`/g, "`/account/orders/${o.reference}`");
  return s;
});

// ── account.orders — fix undefined `reference` variable ──────────────────────
fixFile("src/routes/account.orders.tsx", (s) => {
  s = s.replace(/`\/account\/orders\/\$\{reference\}`/g, "`/account/orders/${o.reference}`");
  return s;
});

// ── account.orders.$reference — notFound() + string|undefined ────────────────
fixFile("src/routes/account.orders.$reference.tsx", (s) => {
  // Add Navigate to react-router-dom import
  s = s.replace(
    'import { Link, useNavigate, useParams } from "react-router-dom";',
    'import { Link, Navigate, useNavigate, useParams } from "react-router-dom";'
  );
  // Fix: string | undefined passed where string is expected
  s = s.replace(
    "orderStore.getMine(reference).then",
    "orderStore.getMine(reference ?? \"\").then"
  );
  s = s.replace(
    "refundStore.getForOrder(reference).then",
    "refundStore.getForOrder(reference ?? \"\").then"
  );
  // Fix: throw notFound() → Navigate
  s = s.replace(
    "throw notFound();",
    "return <Navigate to=\"/account/orders\" replace />;"
  );
  return s;
});

// ── checkout.tsx — navigate({to,search}) + Link search + wrong default export ─
fixFile("src/routes/checkout.tsx", (s) => {
  // Fix navigate({ to: "/order-confirmation", search: { ref } })
  s = s.replace(
    /navigate\(\{\s*to:\s*"\/order-confirmation",\s*search:\s*\{\s*ref\s*\}\s*\}\)/g,
    "navigate(`/order-confirmation?ref=${ref}`)"
  );
  // Fix Link search={{ redirect: "/checkout" }}
  s = s.replace(
    'to="/account/login"\n                        search={{ redirect: "/checkout" }}',
    'to="/account/login?redirect=/checkout"'
  );
  s = s.replace(
    'search={{ redirect: "/checkout" }}',
    ""
  );
  // Fix wrong default export: script picked FulfillmentCard, should be CheckoutModal
  s = s.replace("export default FulfillmentCard;", "export default CheckoutModal;");
  return s;
});

// ── checkout.processing — resolvedOrderId null→string coercion ────────────────
fixFile("src/routes/checkout.processing.tsx", (s) => {
  // orderStore.initiatePayment expects string but resolvedOrderId is string | null
  s = s.replace(
    "const r = await orderStore.initiatePayment(resolvedOrderId,",
    "const r = await orderStore.initiatePayment(resolvedOrderId!,"
  );
  return s;
});

// ── index.tsx — Link search={{ deals: true } as never} ───────────────────────
fixFile("src/routes/index.tsx", (s) => {
  // The search={{ deals: true } as never} pattern (nested braces — missed by earlier regex)
  s = s.replace(
    /(<Link\s+to="\/products")\s+search=\{\{ deals: true \} as never\}/g,
    '<Link to="/products?deals=true"'
  );
  return s;
});

// ── industries.tsx — Link search={{ industry }} ───────────────────────────────
fixFile("src/routes/industries.tsx", (s) => {
  s = s.replace(
    /(<Link\s+(?:key=\{[^}]+\}\s+)?)\n?\s*to="\/products"\n?\s*search=\{\{ industry: ind\.slug \}\}/g,
    "$1\n                to={`/products?industry=${ind.slug}`}"
  );
  s = s.replace(
    /to="\/products"\s+search=\{\{ industry: ind\.slug \}\}/g,
    "to={`/products?industry=${ind.slug}`}"
  );
  return s;
});

// ── order-confirmation — string|undefined + Link search ──────────────────────
fixFile("src/routes/order-confirmation.tsx", (s) => {
  s = s.replace(
    "orderStore.getStatus(ref).then",
    "orderStore.getStatus(ref ?? \"\").then"
  );
  // Row component value={ref} where ref is string|undefined
  s = s.replace(
    '<Row label="Order reference" value={ref} mono />',
    '<Row label="Order reference" value={ref ?? ""} mono />'
  );
  // Link search={{ ref }}
  s = s.replace(
    '<Link\n              to="/orders/track"\n              search={{ ref }}',
    "<Link\n              to={ref ? `/orders/track?ref=${ref}` : \"/orders/track\"}"
  );
  s = s.replace(
    /to="\/orders\/track"\s+search=\{\{ ref \}\}/g,
    "to={ref ? `/orders/track?ref=${ref}` : \"/orders/track\"}"
  );
  return s;
});

// ── about.tsx — add missing Link import ──────────────────────────────────────
fixFile("src/routes/about.tsx", (s) => {
  if (s.includes('from "react-router-dom"')) return s;
  return 'import { Link } from "react-router-dom";\n' + s;
});

// ── AdminProtectedRoute — location.href → location.pathname ──────────────────
fixFile("src/components/admin/AdminProtectedRoute.tsx", (s) => {
  s = s.replace("location.href, location.pathname", "location.pathname");
  return s;
});

// ── products.index.tsx — fix remaining multiline navigate call ────────────────
fixFile("src/routes/products.index.tsx", (s) => {
  // The toggleIndustry function still has the old navigate call (multiline, not caught by regex)
  s = s.replace(
    `  const toggleIndustry = (slug: string) => {
    void navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, industry: prev.industry === slug ? undefined : slug }),
    });
  };`,
    `  const toggleIndustry = (slug: string) => {
    setSearchParams((prev) => { if (prev.get("industry") === slug) prev.delete("industry"); else prev.set("industry", slug); return prev; });
  };`
  );
  return s;
});

// ── ConfiguratorModal — string | undefined fix ────────────────────────────────
fixFile("src/components/ConfiguratorModal.tsx", (s) => {
  // Find and fix string|undefined type issues — most likely a primaryImageUrl or similar
  // Add non-null assertion or fallback where needed
  s = s.replace(
    /\bsrc=\{([^}]+)\}\s+(?=alt=)/g,
    (m, expr) => {
      if (expr.includes("??") || expr.includes("!")) return m;
      return `src={${expr} ?? ""} `;
    }
  );
  return s;
});

// ── Done ─────────────────────────────────────────────────────────────────────
console.log(`\n✅  Done — ${fixed} files modified\n`);
