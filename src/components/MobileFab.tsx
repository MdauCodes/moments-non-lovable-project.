import { Link } from "react-router-dom";

import { useEffect, useState } from "react";
import { Menu, X, Tag, Briefcase, MessageCircle, ShoppingBag, Home, LogIn, Truck } from "lucide-react";

/**
 * Global floating action menu shown on every page (mobile only).
 * Sits just above the WhatsApp FAB (which lives at bottom-4/right-4).
 */
export function MobileFab() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const el = document.getElementById("mpk-fab-root");
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const items = [
    { label: "WhatsApp", Icon: MessageCircle, href: "https://wa.me/254700000000", iconColor: "var(--forest)" },
    { label: "Sign in", Icon: LogIn, to: "/account/login" as const, iconColor: "var(--accent)" },
    { label: "Track Order", Icon: Truck, to: "/orders/track" as const, iconColor: "var(--forest)" },
    { label: "Enterprise", Icon: Briefcase, to: "/enterprise-quote" as const, iconColor: "var(--ink)" },
    { label: "Deals", Icon: Tag, to: "/products" as const, iconColor: "var(--accent)" },
    { label: "Shop", Icon: ShoppingBag, to: "/products" as const, iconColor: "var(--ink)" },
    { label: "Home", Icon: Home, to: "/" as const, iconColor: "var(--ink)" },
  ];

  return (
    <div
      id="mpk-fab-root"
      className="fixed right-4 flex flex-col items-end"
      style={{ zIndex: 50, bottom: "76px" }}
    >
      {open && (
        <div
          className="mb-2 flex flex-col items-end gap-2 rounded-2xl p-2"
          style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.18)" }}
        >
          {items.map((it) => {
            const pill = (
              <span className="rounded-full bg-[color:var(--ink)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                {it.label}
              </span>
            );
            const icon = (
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-md">
                <it.Icon className="h-4 w-4" strokeWidth={1.8} style={{ color: it.iconColor }} />
              </span>
            );
            return it.to ? (
              <Link key={it.label} to={it.to} className="flex items-center gap-2" onClick={() => setOpen(false)}>
                {pill}
                {icon}
              </Link>
            ) : (
              <a key={it.label} href={it.href} target="_blank" rel="noreferrer" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                {pill}
                {icon}
              </a>
            );
          })}
        </div>
      )}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="grid h-11 w-11 place-items-center rounded-full text-white shadow-lg"
        style={{ background: "var(--accent)" }}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </div>
  );
}
