import { LegalPageLayout, type LegalSection } from "@/components/LegalPageLayout";
import { SiteLayout } from "@/components/SiteLayout";

/**
 * DRAFT CONTENT — needs admin sign-off before shipping.
 * Steps and timelines below are inferred from terms.tsx / contact.tsx.
 * Confirm actual production lead times for custom-branded orders before publishing.
 */
function HowItWorksPage() {
  const sections: LegalSection[] = [
    {
      id: "browse",
      title: "1. Browse or search",
      body: (
        <p>
          Use the Shop menu, filter by your business type (café, retail, agriculture, etc.), or
          search directly for what you need — e.g. "pizza box" or "kraft bags". Every product
          shows pack size, price per unit, and stock status up front, so there are no surprises
          at checkout.
        </p>
      ),
    },
    {
      id: "quantity",
      title: "2. Choose your quantity",
      body: (
        <ul>
          <li>Most products can be ordered from as low as 100 units.</li>
          <li>
            Switch between packet / carton / bale pricing on the product page — larger packs
            usually save you money per unit.
          </li>
          <li>
            Need custom branding or printing? Use "Get a quote" on the product page or the
            Enterprise Quote form to send us your artwork.
          </li>
        </ul>
      ),
    },
    {
      id: "checkout",
      title: "3. Checkout & pay",
      body: (
        <p>
          Pay with M-Pesa, bank transfer, or (for approved accounts) cash on delivery. Enterprise
          orders may require a 50% deposit before production starts. You'll get an order
          confirmation immediately, and a receipt once payment clears.
        </p>
      ),
    },
    {
      id: "delivery",
      title: "4. Delivery & tracking",
      body: (
        <p>
          Same-day delivery within Nairobi for orders placed before the daily cutoff, and up to 3
          business days countrywide. Track your order any time from the Track Order page using
          your order reference.
        </p>
      ),
    },
  ];

  return (
    <SiteLayout>
      <LegalPageLayout
        eyebrow="Getting started"
        title="How ordering works"
        intro={<p>From browsing to delivery — here's exactly what happens when you order from us.</p>}
        updated="July 2026"
        sections={sections}
        related={[
          { to: "/faq", label: "FAQ" },
          { to: "/payment-methods", label: "Payment methods" },
          { to: "/orders/track", label: "Track order" },
        ]}
      />
    </SiteLayout>
  );
}

export default HowItWorksPage;
