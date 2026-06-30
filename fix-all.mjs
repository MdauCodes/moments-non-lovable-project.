/**
 * fix-all.mjs — Run once from the project root: node fix-all.mjs
 * Fixes all TanStack Router → React Router v6 migration issues.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
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
  }
}

function walkSrc(dir = join(ROOT, "src"), results = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walkSrc(p, results);
    else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) results.push(p);
  }
  return results;
}

// ── PASS 1: add missing `export default` to all route files ───────────────────
console.log("\n── Pass 1: default exports ──");

function addDefaultExport(src) {
  if (/export\s+default\s/.test(src)) return src;
  const re = /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*[\(<]/gm;
  const names = [];
  let m;
  while ((m = re.exec(src)) !== null) names.push(m[1]);
  if (!names.length) return src;
  const preferred =
    names.find((n) => /Page|Route|Component|View|Layout|Redirect/.test(n)) ??
    names[names.length - 1];
  return src.trimEnd() + `\n\nexport default ${preferred};\n`;
}

for (const abs of walkSrc()) {
  const rel = relative(ROOT, abs);
  if (!rel.includes("routes")) continue;           // only route files
  fixFile(rel, addDefaultExport);
}

// ── PASS 2: navigate({ to }) → navigate() everywhere ─────────────────────────
console.log("\n── Pass 2: navigate({to}) calls ──");

function fixNavigate(src) {
  // navigate({ to: "literal" })
  src = src.replace(
    /\bnavigate\(\{\s*to:\s*("(?:[^"\\]|\\.)*?")\s*\}\)/g,
    "navigate($1)"
  );
  // navigate({ to: 'literal' })
  src = src.replace(
    /\bnavigate\(\{\s*to:\s*('(?:[^'\\]|\\.)*?')\s*\}\)/g,
    "navigate($1)"
  );
  // navigate({ to: "literal", replace: true })
  src = src.replace(
    /\bnavigate\(\{\s*to:\s*("(?:[^"\\]|\\.)*?"),\s*replace:\s*true\s*\}\)/g,
    "navigate($1, { replace: true })"
  );
  src = src.replace(
    /\bnavigate\(\{\s*to:\s*('(?:[^'\\]|\\.)*?'),\s*replace:\s*true\s*\}\)/g,
    "navigate($1, { replace: true })"
  );
  // navigate({ to: variable, replace: true })
  src = src.replace(
    /\bnavigate\(\{\s*to:\s*([a-zA-Z_$][\w.]*),\s*replace:\s*true\s*\}\)/g,
    "navigate($1, { replace: true })"
  );
  // navigate({ to: variable }) (no replace)
  src = src.replace(
    /\bnavigate\(\{\s*to:\s*([a-zA-Z_$][\w.]*)\s*\}\)/g,
    "navigate($1)"
  );
  return src;
}

for (const abs of walkSrc()) {
  fixFile(relative(ROOT, abs), fixNavigate);
}

// ── PASS 3: remove Link search/params props ───────────────────────────────────
console.log("\n── Pass 3: Link search/params props ──");

function fixLinkProps(src) {
  // Remove empty search={{}}
  src = src.replace(/\s+search=\{\{\s*\}\}/g, "");
  // Remove search={x as never}
  src = src.replace(/\s+search=\{[^{}]+ as never\}/g, "");
  // Remove params={{ ... }} — to= already has inline interpolation
  src = src.replace(/\s+params=\{\{[^}]+\}\}/g, "");
  return src;
}

for (const abs of walkSrc()) {
  fixFile(relative(ROOT, abs), fixLinkProps);
}

// ── PASS 4: targeted file fixes ───────────────────────────────────────────────
console.log("\n── Pass 4: targeted file fixes ──");

// ---- useRequirePermission.ts ----
fixFile("src/lib/useRequirePermission.ts", (s) =>
  s.replace(
    "void navigate({ to: landing, replace: true });",
    "void navigate(landing, { replace: true });"
  )
);

// ---- ProtectedRoute.tsx ----
fixFile("src/components/ProtectedRoute.tsx", (s) =>
  s.replace(
    /navigate\(\{[\s\S]*?to:\s*"\/account\/login",[\s\S]*?state:\s*\{[^}]+\}\s*as never,[\s\S]*?replace:\s*true,?[\s\S]*?\}\)/,
    'navigate("/account/login", { state: { returnUrl: location.pathname }, replace: true })'
  )
);

// ---- AdminLayout.tsx — add Link + useLocation import ----
fixFile("src/layouts/AdminLayout.tsx", (s) => {
  if (s.includes('from "react-router-dom"')) return s;
  return s.replace(
    'import React from "react";',
    'import React from "react";\nimport { Link, useLocation } from "react-router-dom";'
  );
});

// ---- SiteHeader.tsx ----
fixFile("src/components/SiteHeader.tsx", (s) => {
  // Fix imports
  s = s.replace(
    'import { Link, useNavigate } from "react-router-dom";',
    'import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";'
  );
  // Fix broken line (fix2.mjs garbled this): useRouterState → useLocation
  s = s.replace(
    /const pathname = .*?\.location\.pathname.*?;/,
    "const { pathname } = useLocation();"
  );
  // Fallback: any remaining useNavigation().state reference that yields a pathname
  s = s.replace(
    /const pathname = useNavigation\(\)\.state[^;]+;/,
    "const { pathname } = useLocation();"
  );
  // Fix: <Link to="/products" search={{ category: c.slug }}>
  s = s.replace(
    /to="\/products"\n(\s+)search=\{\{ category: c\.slug \}\}/g,
    'to={`/products?category=${c.slug}`}'
  );
  s = s.replace(
    /to="\/products" search=\{\{ category: c\.slug \}\}/g,
    "to={`/products?category=${c.slug}`}"
  );
  // Fix simpleNav Deals link (search={{ deals: true }})
  // Already handled by Pass 3 (search={n.search as never})
  return s;
});

// ---- account.verify.tsx ----
fixFile("src/routes/account.verify.tsx", (s) => {
  // Fix broken emailFromQuery line (fix2.mjs tried to replace variable name inside string)
  s = s.replace(
    /const email:\s*emailFromQuery\s*=\s*_searchParams\.get\("email:\s*emailFromQuery"\)\s*\?\?\s*undefined;/,
    'const emailFromQuery = _searchParams.get("email") ?? "";'
  );
  // Fix duplicate email: remove the broken one, fix the useState
  s = s.replace(
    'const [email, setEmail] = useState(emailFromQuery ?? "");',
    "const [email, setEmail] = useState(emailFromQuery);"
  );
  return s;
});

// ---- checkout.processing.tsx ----
fixFile("src/routes/checkout.processing.tsx", (s) => {
  // Fix broken orderId line (fix2.mjs put variable name inside the string key)
  s = s.replace(
    /const orderId:\s*orderIdParam\s*=\s*_searchParams\.get\("orderId:\s*orderIdParam"\)\s*\?\?\s*undefined;/,
    'const orderIdParam = _searchParams.get("orderId") ?? undefined;'
  );
  // Fix Link search={{ ref }} → inline query string
  s = s.replace(
    /to="\/orders\/track"\n(\s+)search=\{\{ ref \}\}/g,
    "to={ref ? `/orders/track?ref=${ref}` : \"/orders/track\"}"
  );
  s = s.replace(
    /to="\/orders\/track" search=\{\{ ref \}\}/g,
    "to={ref ? `/orders/track?ref=${ref}` : \"/orders/track\"}"
  );
  return s;
});

// ---- checkout.failed.tsx ----
fixFile("src/routes/checkout.failed.tsx", (s) => {
  // Fix: orderStore.getStatus(ref) where ref is string | undefined
  s = s.replace(
    "orderStore.getStatus(ref).then",
    "orderStore.getStatus(ref ?? \"\").then"
  );
  // Fix: navigate({ to: "/checkout/processing", search: { ref: ... } })
  s = s.replace(
    /navigate\(\{\s*to:\s*"\/checkout\/processing",\s*search:\s*\{\s*ref:\s*(\w+(?:\.\w+)*)\s*\}\s*\}\)/,
    "navigate(`/checkout/processing?ref=${$1}`)"
  );
  return s;
});

// ---- checkout.success.tsx ----
fixFile("src/routes/checkout.success.tsx", (s) => {
  // Fix: orderStore.getStatus(ref) where ref is string | undefined
  s = s.replace(
    "orderStore.getStatus(ref).then",
    "orderStore.getStatus(ref ?? \"\").then"
  );
  // Fix: <Link to="/orders/track" search={{ ref }}
  s = s.replace(
    /<Link to="\/orders\/track" search=\{\{ ref \}\}/g,
    "<Link to={ref ? `/orders/track?ref=${ref}` : \"/orders/track\"}"
  );
  return s;
});

// ---- account.wishlist.tsx ----
fixFile("src/routes/account.wishlist.tsx", (s) => {
  // Fix: to={`/products/${slug}`} — slug is undefined; should be p.slug
  // params prop already stripped in Pass 3
  s = s.replace(/to=\{`\/products\/\$\{slug\}`\}/g, "to={`/products/${p.slug}`}");
  // Fix: primaryImageUrl is string | undefined but src needs string
  s = s.replace("src={p.primaryImageUrl}", "src={p.primaryImageUrl ?? \"\"}");
  return s;
});

// ---- blog.index.tsx ----
fixFile("src/routes/blog.index.tsx", (s) => {
  // Fix: to={`/blog/${slug}`} — slug is undefined; should be post.slug or b.slug
  s = s.replace(/to=\{`\/blog\/\$\{slug\}`\}/g, "to={`/blog/${b.slug}`}");
  s = s.replace(/to=\{`\/blog\/\$\{post\.slug\}`\}\s+params=\{\{[^}]+\}\}/g, "to={`/blog/${post.slug}`}");
  return s;
});

// ---- products.index.tsx — most complex fix ----
fixFile("src/routes/products.index.tsx", (s) => {
  // 1. Add setSearchParams to the useSearchParams hook
  s = s.replace(
    "const [_searchParams] = useSearchParams();",
    "const [_searchParams, setSearchParams] = useSearchParams();"
  );

  // 2. Remove the broken Route.useNavigate line (in any comment-garbled form)
  s = s.replace(/^\s*const navigate = \/\*.*?\*\/.*useNavigate\(\);?\s*\n/m, "");
  s = s.replace(/^\s*const navigate = .*Route.*\.useNavigate\(\);?\s*\n/m, "");

  // 3. Fix boolean flags destructuring — URLSearchParams values are strings
  s = s.replace(
    /const \{\s*category,\s*industry:\s*industrySlug,\s*q,\s*newArrivals,\s*deals,\s*fastMoving,\s*inStock,\s*minPrice,\s*maxPrice,\s*sort = "newest",\s*\} = search;/,
    [
      `const { category, industry: industrySlug, q, sort = "newest" } = search;`,
      `  const newArrivals = search.newArrivals === "true";`,
      `  const deals = search.deals === "true";`,
      `  const fastMoving = search.fastMoving === "true";`,
      `  const inStock = search.inStock === "true";`,
      `  const minPrice = search.minPrice ? Number(search.minPrice) : undefined;`,
      `  const maxPrice = search.maxPrice ? Number(search.maxPrice) : undefined;`,
    ].join("\n")
  );

  // 4. setParam signature — widen to accept number/boolean
  s = s.replace(
    /const setParam = <K extends keyof typeof search>\(key: K, value: \(typeof search\)\[K\] \| undefined\) => \{/,
    "const setParam = (key: string, value: string | number | boolean | undefined) => {"
  );

  // 5. Fix navigate({ search: ... }) → setSearchParams
  s = s.replace(
    "void navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, q: query || undefined }) });",
    "setSearchParams((prev) => { if (query) prev.set(\"q\", query); else prev.delete(\"q\"); return prev; });"
  );
  s = s.replace(
    "void navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, [key]: value }) });",
    "setSearchParams((prev) => { const v = value; if (v !== undefined && v !== \"\") prev.set(key, String(v)); else prev.delete(key); return prev; });"
  );
  s = s.replace(
    "void navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, industry: prev.industry === slug ? undefined : slug }) });",
    "setSearchParams((prev) => { if (prev.get(\"industry\") === slug) prev.delete(\"industry\"); else prev.set(\"industry\", slug); return prev; });"
  );
  s = s.replace(
    "void navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, [key]: prev[key] ? undefined : true }) });",
    "setSearchParams((prev) => { if (prev.get(key)) prev.delete(key); else prev.set(key, \"true\"); return prev; });"
  );
  s = s.replace(
    "void navigate({ search: () => ({}) });",
    "setSearchParams(new URLSearchParams());"
  );

  // 6. Remove useNavigate from imports (no longer used)
  s = s.replace("import { Link, useNavigate, useSearchParams }", "import { Link, useSearchParams }");
  s = s.replace("{ Link, useNavigate, useSearchParams }", "{ Link, useSearchParams }");

  // 7. Fix wrong default export
  s = s.replace("export default statusFromError;", "export default ProductsPage;");

  return s;
});

// ── PASS 5: fix remaining route files missing default exports ─────────────────
// (Some non-route files like layouts also need it)
console.log("\n── Pass 5: layout/component default exports ──");

fixFile("src/layouts/AdminLayout.tsx", addDefaultExport);
fixFile("src/layouts/SiteLayout.tsx", addDefaultExport);

// ── Done ──────────────────────────────────────────────────────────────────────
console.log(`\n✅  Done — ${fixed} files modified\n`);
