import { TrendingUp, Info } from "lucide-react";
import type { CreditReadiness } from "@/services/businessAccountApi";

// Shared between the Business Account "Trade Credit" tab and the Individual Shopper "Credit
// Worthiness" tab — same informational readiness signal, same visual treatment, for either
// account type. Extracted from account.business.tsx so it isn't duplicated per dashboard.

const READINESS_LABEL_COPY: Record<CreditReadiness["label"], string> = {
  Building: "You're just getting started — keep ordering to build your history.",
  Promising: "You're building a solid order history toward trade credit eligibility.",
  Strong: "You have a strong order history — a great position once trade credit applications open.",
};

const READINESS_BAR_COLOR: Record<CreditReadiness["label"], string> = {
  Building: "bg-amber-500",
  Promising: "bg-accent",
  Strong: "bg-emerald-500",
};

export function CreditReadinessCard({ readiness, compact }: { readiness: CreditReadiness; compact?: boolean }) {
  const factors: { label: string; points: number; max: number }[] = [
    { label: "Order frequency", points: readiness.orderCountPoints, max: readiness.orderCountMax },
    { label: "Lifetime spend", points: readiness.spendPoints, max: readiness.spendMax },
    { label: "Account age", points: readiness.accountAgePoints, max: readiness.accountAgeMax },
    { label: "Recent activity", points: readiness.recencyPoints, max: readiness.recencyMax },
  ];
  const barColor = READINESS_BAR_COLOR[readiness.label];

  return (
    <div className="rounded-lg border border-border bg-background/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Trade credit readiness
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
          {readiness.label}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <p className="font-mono text-3xl font-semibold tabular-nums text-foreground">{readiness.score}</p>
        <p className="text-sm text-muted-foreground">/ 100</p>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${readiness.score}%` }} />
      </div>
      <p className="mt-2.5 text-xs text-muted-foreground">{READINESS_LABEL_COPY[readiness.label]}</p>

      {!compact && (
        <>
          <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
            {factors.map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {f.points}/{f.max}
                  </span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent/70"
                    style={{ width: `${f.max > 0 ? (f.points / f.max) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-md bg-secondary/40 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              This is an informational estimate only — not a credit score, and it doesn't automatically approve or
              deny anything. Trade credit applications (coming soon) will still require documents and a human
              review.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
