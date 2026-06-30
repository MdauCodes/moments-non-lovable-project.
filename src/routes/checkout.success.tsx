import { Link, useSearchParams } from "react-router-dom";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { PrintReceipt } from "@/components/PrintReceipt";
import { orderStore, type CustomerOrder } from "@/services/orderStore";

const searchSchema = z.object({ ref: z.string() });



function fmt(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
}

function SuccessPage() {
  const [_searchParams] = useSearchParams();
  const ref = _searchParams.get("ref") ?? undefined;

  const [order, setOrder] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    orderStore.getStatus(ref ?? "").then((res) => setOrder(res.order));
  }, [ref]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle2 className="h-8 w-8 text-accent" />
          </div>
          <h1 className="mt-6 font-display text-3xl sm:text-4xl">Payment confirmed</h1>
          <p className="mt-3 text-muted-foreground">
            Thank you! Your order <span className="font-semibold text-foreground">{ref}</span> is now in production.
            We'll be in touch within 24 hours with proofs and a delivery ETA.
          </p>

          {order && (
            <dl className="mx-auto mt-8 max-w-md space-y-2 rounded-xl border border-border bg-background/50 p-5 text-left text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Reference</dt><dd className="font-mono">{order.reference}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">M-Pesa code</dt><dd className="font-mono">{order.paymentReference ?? order.receiptNumber ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Items</dt><dd>{order.items.length}</dd></div>
              <div className="flex justify-between border-t border-border pt-2"><dt className="text-muted-foreground">Total paid</dt><dd className="font-semibold">{fmt(order.total)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Delivery to</dt><dd className="text-right">{order.shippingAddress}, {order.city}</dd></div>
            </dl>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to={ref ? `/orders/track?ref=${ref}` : "/orders/track"} className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Track this order
            </Link>
            {order && <PrintReceipt order={order} />}
            <Link to="/products" className="rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary">
              Continue shopping
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

export default SuccessPage;
