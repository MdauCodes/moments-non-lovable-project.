import { LegalPageLayout, type LegalSection } from "@/components/LegalPageLayout";
import { SiteLayout } from "@/components/SiteLayout";

/**
 * DRAFT CONTENT — needs admin sign-off before shipping.
 * Deposit thresholds and till/paybill numbers are placeholders — confirm
 * actual M-Pesa till/paybill number and enterprise deposit terms before publishing.
 */
function PaymentMethodsPage() {
  const sections: LegalSection[] = [
    {
      id: "mpesa",
      title: "M-Pesa",
      body: (
        <p>
          Pay instantly via M-Pesa STK push at checkout — enter your phone number and confirm the
          prompt on your phone. Payments are processed directly through Safaricom; we never see or
          store your PIN. [ADMIN: confirm whether this is Till, Paybill, or STK-only, and add the
          number here if customers should also be able to pay manually.]
        </p>
      ),
    },
    {
      id: "bank-transfer",
      title: "Bank transfer",
      body: (
        <p>
          For larger or enterprise orders, pay by bank transfer to our company account. Your
          account manager will share bank details and a payment reference when you request a
          quote. [ADMIN: confirm whether bank details should be published here directly or shared
          per-order only.]
        </p>
      ),
    },
    {
      id: "cash-on-delivery",
      title: "Cash on delivery",
      body: (
        <p>
          Available for approved customers within our Nairobi delivery zone. Pay the courier in
          cash when your order arrives. [ADMIN: confirm eligibility criteria — e.g. returning
          customers only, order value cap.]
        </p>
      ),
    },
    {
      id: "enterprise-deposits",
      title: "Enterprise orders & deposits",
      body: (
        <p>
          Custom-branded and bulk enterprise orders may require a deposit before production
          starts, with the balance due before dispatch. Your account manager will confirm the
          exact split for your order.
        </p>
      ),
    },
  ];

  return (
    <SiteLayout>
      <LegalPageLayout
        eyebrow="Checkout"
        title="Payment methods"
        intro={<p>How you can pay for your order — and what to expect at each step.</p>}
        updated="July 2026"
        sections={sections}
        related={[
          { to: "/how-it-works", label: "How ordering works" },
          { to: "/faq", label: "FAQ" },
          { to: "/terms", label: "Terms of Service" },
        ]}
      />
    </SiteLayout>
  );
}

export default PaymentMethodsPage;
