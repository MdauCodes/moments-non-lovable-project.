import { Link, useLocation, useNavigate } from "react-router-dom";

import { Home, LayoutGrid, MessageCircle, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

/**
 * Persistent mobile tab bar (app-style). Replaces the old floating
 * hamburger menu so mobile navigation feels like a native shopping app
 * instead of a stack of separate floating buttons.
 */
export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { whatsappNumber } = useSiteConfig();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const chatHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        "Hi Moments Packaging, I'd like to enquire about your packaging.",
      )}`
    : null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Link
        to="/"
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
          isActive("/") ? "text-[var(--forest-bright)]" : "text-muted-foreground"
        }`}
      >
        <Home className="h-5 w-5" strokeWidth={isActive("/") ? 2.25 : 1.75} />
        Home
      </Link>

      <Link
        to="/products"
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
          isActive("/products") ? "text-[var(--forest-bright)]" : "text-muted-foreground"
        }`}
      >
        <LayoutGrid className="h-5 w-5" strokeWidth={isActive("/products") ? 2.25 : 1.75} />
        Shop
      </Link>

      {chatHref && (
        <a
          href={chatHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
          Live Chat
        </a>
      )}

      <Link
        to="/cart"
        className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
          isActive("/cart") ? "text-[var(--forest-bright)]" : "text-muted-foreground"
        }`}
      >
        <span className="relative">
          <ShoppingBag className="h-5 w-5" strokeWidth={isActive("/cart") ? 2.25 : 1.75} />
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-1.5 grid min-w-[16px] h-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold text-accent-foreground">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </span>
        Cart
      </Link>

      <button
        type="button"
        onClick={() => navigate(isAuthenticated ? "/account/orders" : "/account/login")}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
          isActive("/account") ? "text-[var(--forest-bright)]" : "text-muted-foreground"
        }`}
      >
        <User className="h-5 w-5" strokeWidth={isActive("/account") ? 2.25 : 1.75} />
        Account
      </button>
    </nav>
  );
}
