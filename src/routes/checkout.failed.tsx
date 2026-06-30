import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { InlineProgress } from "@/components/InlineProgress";
import { useEffect, useState } from "react";
import { XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { orderStore, type CustomerOrder } from "@/services/orderStore";

const searchSchema = z.object({ ref: z.string(), reason: z.string().optional() });



function FailedPage() {
  const [_searchParams] = useSearchParams();
  const ref = _searchParams.get("ref") ?? undefined;
  const reason = _searchParams.get("reason") ?? undefined;

  const navigate = useNavigate();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    orderStore.getStatus(ref ?? "").then((res) => setOrder(res.order));
  }, [ref]);

  async function handleRetry() {
    if (!order) return;
    setRetrying(true);
    try {
      const init = await orderStore.startMpesaStk(order.id ?? order.reference, order.customerPhone);
      if (!init.success) {
        toast.error(init.message ?? "Could not retry payment");
        setRetrying(false);
        return;
      }
      navigate(`/checkout/processing?ref=${order.reference}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not retry payment");
      setRetrying(false);
    }
  }

  const failureText = order?.failureReason
    ?? (reason === "timeout" ? "We didn't receive a confirmation in time" : "Payment was not completed");

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="mt-6 font-display text-3xl sm:text-4xl">Payment didn't go through</h1>
          <p className="mt-3 text-muted-foreground">
            Order <span className="font-semibold text-foreground">{ref}</span> was created but not paid.
            Reason: <span className="text-foreground">{failureText}</span>.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying || !order}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {retrying ? <InlineProgress size="sm" /> : <RefreshCw className="h-4 w-4" />}
              Try M-Pesa again
            </button>
            <Link to="/cart" className="rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary">
              Back to cart
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Still stuck? <Link to="/contact" className="text-accent hover:underline">Contact us</Link> and quote reference {ref}.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

export default FailedPage;
