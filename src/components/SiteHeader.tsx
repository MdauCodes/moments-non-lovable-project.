import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";

import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, Search, ShoppingBag, User, HelpCircle } from "lucide-react";
import logoUrl from "@/assets/moments-logo.png";
import { categories } from "@/data/products";
import { SearchCommand } from "@/components/SearchCommand";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Commerce-first nav. Categories live inside the "Shop" dropdown so the
 * top bar stays uncluttered. Deals & Enterprise sit alongside as siblings.
 */
type SimpleNav = { to: string; label: string };

const simpleNav: readonly SimpleNav[] = [
  { to: "/company-profile", label: "Company" },
  { to: "/company-profile#sustainability", label: "Sustainability" },
  { to: "/orders/track", label: "Track Order" },
  { to: "/products?deals=true", label: "Deals" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchSeed, setSearchSeed] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { pathname } = useLocation();
  const isCompanyProfile = pathname.startsWith("/company-profile");

  useEffect(() => {
    if (!accountOpen) return;
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [accountOpen]);

  useEffect(() => {
    if (!shopOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [shopOpen]);

  // Global keyboard shortcut: ⌘K / Ctrl+K opens search anywhere
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchSeed("");
        setSearchOpen(true);
      } else if (e.key === "/" && !isTyping && !searchOpen) {
        e.preventDefault();
        setSearchSeed("");
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchOpen]);

  const openDropdown = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShopOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setShopOpen(false), 120);
  };

  const openSearch = (seed = "") => {
    setSearchSeed(seed);
    setSearchOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4 lg:gap-5 lg:px-8">
          <Link to="/" className="group flex shrink-0 items-center" aria-label="Moments Packaging Kenya — Home">
            <img
              src={logoUrl}
              alt="Moments Packaging Kenya logo"
              width={160}
              height={40}
              className={isCompanyProfile ? "h-9 w-auto sm:h-10 lg:h-11" : "h-5 w-auto sm:h-6 lg:h-7"}
            />
          </Link>

          {/* Desktop search bar (lg+). Acts as a trigger for the overlay. */}
          <button
            type="button"
            onClick={() => openSearch()}
            className="hidden h-10 flex-1 items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary lg:flex lg:max-w-md"
            aria-label="Search packaging"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 truncate">Search packaging…</span>
            <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground xl:inline">
              ⌘K
            </kbd>
          </button>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {/* Shop dropdown */}
            <div ref={dropdownRef} className="relative" onMouseEnter={openDropdown} onMouseLeave={scheduleClose}>
              <NavLink
                to="/products"
                className={({ isActive }) => `inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors lg:px-4 ${isActive ? "bg-secondary text-foreground" : "text-foreground/80 hover:bg-secondary hover:text-foreground"}`}
                onClick={() => setShopOpen(false)}
              >
                Shop
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${shopOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </NavLink>

              {shopOpen && (
                <div
                  className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-2"
                  onMouseEnter={openDropdown}
                  onMouseLeave={scheduleClose}
                >
                  <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xl ring-1 ring-black/5">
                    <Link
                      to="/products"
                      onClick={() => setShopOpen(false)}
                      className="block border-b border-border bg-cream/60 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                    >
                      All products →
                    </Link>
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        to={`/products?category=${c.slug}`}
                        onClick={() => setShopOpen(false)}
                        className="block border-b border-border/60 px-4 py-2.5 text-sm text-foreground/80 transition-colors last:border-b-0 hover:bg-secondary hover:text-foreground"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Deals + Enterprise */}
            {simpleNav.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors lg:px-4 ${
                  n.label === "Deals"
                    ? "text-forest hover:bg-forest/10"
                    : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                }`}
               
              >
                {n.label}
              </Link>
            ))}

            <div className="ml-2 flex items-center gap-1">
              <Link
                to="/faq"
                aria-label="Help"
                className="grid h-10 w-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
              >
                <HelpCircle className="h-5 w-5" />
              </Link>
              <Link
                to="/cart"
                aria-label="Cart"
                className="relative grid h-10 w-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] h-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>

              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  aria-label="Account"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate("/account/login");
                    } else {
                      setAccountOpen((v) => !v);
                    }
                  }}
                  className="grid h-10 w-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <User className="h-5 w-5" />
                </button>
                {isAuthenticated && accountOpen && (
                  <div className="absolute right-0 top-full z-50 w-56 pt-2">
                    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xl ring-1 ring-black/5">
                      <div className="border-b border-border px-4 py-3 font-display text-sm text-foreground">
                        Hi {user?.firstName ?? "there"}
                      </div>
                      <Link
                        to="/account/orders"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/account/profile"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/account/wishlist"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground"
                      >
                        Wishlist
                      </Link>
                      <div className="border-t border-border" />
                      <button
                        type="button"
                        onClick={async () => {
                          setAccountOpen(false);
                          await logout();
                          navigate("/");
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm font-medium text-accent hover:bg-secondary"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Tablet/mobile cart + search + menu */}
          <div className="ml-auto flex items-center gap-1 md:hidden">
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative grid h-10 w-10 place-items-center rounded-md text-foreground/80 transition-colors hover:bg-secondary"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] h-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => openSearch()}
              aria-label="Search packaging"
              className="grid h-10 w-10 place-items-center rounded-md border border-border text-foreground/80 transition-colors hover:bg-secondary"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="grid h-10 w-10 place-items-center rounded-md border border-border"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Tablet search trigger between md and lg */}
          <button
            type="button"
            onClick={() => openSearch()}
            aria-label="Search packaging"
            className="hidden h-10 w-10 place-items-center rounded-md border border-border text-foreground/80 transition-colors hover:bg-secondary md:grid lg:hidden"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {open && (
          <div className="border-t border-border bg-background md:hidden">
            <div className="flex flex-col px-5 py-3">
              <div>
                <div className="flex items-center">
                  <Link
                    to="/products"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-md px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-secondary"
                  >
                    Shop
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileShopOpen((v) => !v)}
                    aria-label="Toggle categories"
                    className="grid h-10 w-10 place-items-center rounded-md text-foreground/60 hover:bg-secondary"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${mobileShopOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>
                {mobileShopOpen && (
                  <div className="ml-3 border-l border-border pl-3">
                    <Link
                      to="/products"
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2.5 text-sm text-foreground/70 hover:bg-secondary"
                    >
                      All products
                    </Link>
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        to={`/products?category=${c.slug}`}
                        onClick={() => setOpen(false)}
                        className="block rounded-md px-3 py-2.5 text-sm text-foreground/70 hover:bg-secondary"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {simpleNav.map((n) => (
                <Link
                  key={n.label}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-3 py-3 text-sm font-medium hover:bg-secondary ${
                    n.label === "Deals" ? "text-forest" : "text-foreground/80"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/faq"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-secondary"
              >
                Help / FAQ
              </Link>

              {isAuthenticated ? (
                <div className="mt-2 border-t border-border pt-2">
                  <p className="px-3 py-1.5 text-xs text-muted-foreground">Hi {user?.firstName ?? "there"}</p>
                  <Link
                    to="/account/orders"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2.5 text-sm text-foreground/80 hover:bg-secondary"
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/account/profile"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2.5 text-sm text-foreground/80 hover:bg-secondary"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/account/wishlist"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2.5 text-sm text-foreground/80 hover:bg-secondary"
                  >
                    Wishlist
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setOpen(false);
                      await logout();
                      navigate("/");
                    }}
                    className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-accent hover:bg-secondary"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  to="/account/login"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center gap-2 rounded-md border border-border px-3 py-3 text-sm text-foreground/80 hover:bg-secondary"
                >
                  <User className="h-4 w-4" /> Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} initialQuery={searchSeed} />
    </>
  );
}
