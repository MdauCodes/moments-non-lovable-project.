import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/SiteLayout";
import { whatsappLink, COMPANY_EMAIL } from "@/data/products";
import { Check, MessageCircle, Mail } from "lucide-react";

/**
 * DRAFT CONTENT — needs admin sign-off before shipping.
 * "Partner" here is drafted as a reseller/referral/bulk-supply program —
 * confirm this matches what the business actually wants to offer (or
 * whether "partner" should instead route straight to Enterprise Quote).
 */
const PARTNER_TYPES = [
  {
    title: "Resellers & distributors",
    desc: "Stock our packaging for your own retail or wholesale customers, at partner pricing.",
  },
  {
    title: "Referral partners",
    desc: "Send us businesses that need packaging and earn a commission on their first order.",
  },
  {
    title: "Supply & production partners",
    desc: "Manufacturers and material suppliers looking to work with us on an ongoing basis.",
  },
];

function BecomeAPartnerPage() {
  return (
    <SiteLayout>
      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center sm:py-20 lg:px-8">
          <p className="text-xs uppercase tracking-widest text-accent">Partnerships</p>
          <h1 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
            Become a partner
          </h1>
          <p className="mt-4 text-muted-foreground">
            We work with resellers, referral partners and suppliers across Kenya. Tell us a bit
            about your business and we'll get back to you.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          {PARTNER_TYPES.map((t) => (
            <div key={t.title} className="rounded-2xl border border-border bg-card p-5">
              <Check className="h-4 w-4 text-accent" />
              <h3 className="mt-3 font-display text-base font-semibold text-foreground">{t.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
          <h2 className="font-display text-xl text-foreground">Ready to talk?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reach out with your business type and what you have in mind — we'll follow up within 2
            business days.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappLink("Hi Moments Packaging, I'm interested in becoming a partner.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
            <a
              href={`mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent("Partnership enquiry")}`}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              <Mail className="h-4 w-4" /> {COMPANY_EMAIL}
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Placing a large one-off order instead?{" "}
            <Link to="/enterprise-quote" className="text-accent hover:underline">
              Get an enterprise quote →
            </Link>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}

export default BecomeAPartnerPage;
