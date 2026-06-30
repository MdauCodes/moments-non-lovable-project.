import { Link } from "react-router-dom";

import { SiteLayout } from "@/components/SiteLayout";
import { Palette, Sparkles, ArrowRight } from "lucide-react";



function StyleGuidePage() {
  return (
    <SiteLayout>
      <main className="relative overflow-hidden bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl"
        />
        <section className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-accent" aria-hidden /> Coming soon
          </span>
          <div className="mt-8 grid h-16 w-16 place-items-center rounded-2xl border border-border bg-card shadow-sm">
            <Palette className="h-7 w-7 text-accent" aria-hidden />
          </div>
          <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            The Moments style guide is being polished.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            A living reference for our brand voice, colour, typography and packaging
            components. We&apos;re tightening the details so it&apos;s genuinely useful when it ships.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Read our story <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary"
            >
              See legal &amp; privacy
            </Link>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

export default StyleGuidePage;
