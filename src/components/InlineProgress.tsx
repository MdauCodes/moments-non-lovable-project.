import { cn } from "@/lib/utils";

/**
 * InlineProgress — a thin, looping horizontal progress bar.
 * Use inside buttons or beside text during in-place actions
 * (Add to cart, Submit form, Apply filters, etc.).
 *
 * Looks like a small editorial "ink" bar that flows from left to right.
 * Color defaults to the foreground of whatever button it sits inside,
 * so it works on accent (clay) buttons, primary (forest) buttons, and
 * neutral surfaces alike.
 *
 * Sizes:
 *  - sm: 2-3 chars wide (~28px) — fits inline with button label
 *  - md: ~64px — fits centered inside a button while text is hidden
 *  - full: stretches to parent width — for form-submit progress
 */
type Size = "sm" | "md" | "full";

const sizeClass: Record<Size, string> = {
  sm: "w-7 h-[2px]",
  md: "w-16 h-[2px]",
  full: "w-full h-[2px]",
};

export function InlineProgress({
  size = "sm",
  className,
  tone = "currentColor",
  label,
}: {
  size?: Size;
  className?: string;
  /** CSS color value. Defaults to currentColor so it inherits text color. */
  tone?: string;
  /** Optional accessible label. Defaults to "Loading". */
  label?: string;
}) {
  return (
    <span
      role="progressbar"
      aria-label={label ?? "Loading"}
      aria-busy="true"
      className={cn(
        "relative inline-block overflow-hidden rounded-full align-middle",
        sizeClass[size],
        className,
      )}
      style={{ backgroundColor: `color-mix(in oklab, ${tone} 18%, transparent)` }}
    >
      <span
        className="absolute inset-y-0 left-0 w-1/2 rounded-full inline-progress-flow"
        style={{ backgroundColor: tone }}
      />
    </span>
  );
}
