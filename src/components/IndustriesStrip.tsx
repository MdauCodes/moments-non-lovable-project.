import { Link } from "react-router-dom";

import { ArrowRight } from "lucide-react";
import { industries } from "@/data/products";

/**
 * Compact "Industries we serve" band used on the homepage just below the
 * value-prop sections. Communicates market breadth at a glance and links
 * each chip to the pre-filtered catalogue (`/products?industry=<slug>`).
 */
export function IndustriesStrip() {
  return (
    <section className="border-y border-border bg-cream/60">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Markets we serve</p>
            <h2 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
              Packaging for every kind of business in Kenya.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
              From your cousin's bakery to nationwide enterprise rollouts — eight industries,
              one production line. Tap any sector to see what we make for it.
            </p>
          </div>
          <Link
            to="/industries"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent"
          >
            See all industries <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {industries.map((ind) => {
            const Icon = ind.icon;
            return (
              <li key={ind.id}>
                <Link
                  to={`/products?industry=${ind.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    {ind.image ? (
                      <img
                        src={ind.image}
                        alt={`${ind.name} packaging in context`}
                        loading="lazy"
                        width={1024}
                        height={768}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    ) : null}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/10 to-transparent" />
                    <span
                      className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors group-hover:bg-accent group-hover:text-accent-foreground"
                      aria-hidden
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <ArrowRight className="absolute right-3 top-3 h-4 w-4 text-background/90 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <h3 className="font-display text-lg text-foreground">{ind.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {ind.tagline ?? ind.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent">
                      Shop {ind.name.toLowerCase()} packaging
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
