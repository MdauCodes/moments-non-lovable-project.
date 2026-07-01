import { SiteLayout } from "@/components/SiteLayout";
import { COMPANY_EMAIL } from "@/data/products";
import { Mail } from "lucide-react";

/**
 * DRAFT CONTENT — needs admin sign-off before shipping.
 * No real open roles are listed — confirm current openings (if any) and
 * whether applications should go to a dedicated recruitment inbox instead
 * of the general company email.
 */
function CareersPage() {
  return (
    <SiteLayout>
      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center sm:py-20 lg:px-8">
          <p className="text-xs uppercase tracking-widest text-accent">Careers</p>
          <h1 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
            Work with us
          </h1>
          <p className="mt-4 text-muted-foreground">
            We're a growing Kenyan packaging company. We don't always have open roles listed, but
            we're always glad to hear from good people.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-5 py-12 sm:py-16 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
          <h2 className="font-display text-xl text-foreground">No open positions right now</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Send us your CV and a short note about what you do — we'll keep it on file and reach
            out when something opens up that fits.
          </p>
          <a
            href={`mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent("Application — [Your name]")}`}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Mail className="h-4 w-4" /> {COMPANY_EMAIL}
          </a>
        </div>
      </div>
    </SiteLayout>
  );
}

export default CareersPage;
