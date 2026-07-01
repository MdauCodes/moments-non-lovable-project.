import { Star } from "lucide-react";

/**
 * ⚠️ PLACEHOLDER CONTENT — DO NOT SHIP AS-IS.
 * These are NOT real customer quotes. Publishing fabricated testimonials
 * is misleading advertising. Replace every entry below with a genuine
 * quote (with the customer's permission to use their name/business) before
 * this section goes live. Until then this renders with a visible
 * "sample" label so nobody mistakes it for real content in a preview.
 */
const PLACEHOLDER_TESTIMONIALS = [
  {
    quote: "[Awaiting a real customer quote — e.g. about delivery speed or print quality]",
    name: "[Customer name]",
    business: "[Business name / type]",
  },
  {
    quote: "[Awaiting a real customer quote — e.g. about ordering experience]",
    name: "[Customer name]",
    business: "[Business name / type]",
  },
  {
    quote: "[Awaiting a real customer quote — e.g. about repeat-order reliability]",
    name: "[Customer name]",
    business: "[Business name / type]",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent">What customers say</p>
            <h2 className="mt-2 font-display text-3xl font-medium text-foreground sm:text-4xl">
              Trusted by Kenyan businesses
            </h2>
          </div>
          <span className="rounded-full border border-dashed border-accent/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent">
            Sample — pending real quotes
          </span>
        </div>
        <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-3">
          {PLACEHOLDER_TESTIMONIALS.map((t, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-current" aria-hidden />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.quote}</p>
              <p className="mt-4 text-sm font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.business}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
