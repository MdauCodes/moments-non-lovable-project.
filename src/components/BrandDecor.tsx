/**
 * BrandDecor — recurring decorative graphics that act as the site's
 * visual fingerprint. All pieces are absolutely positioned, pointer-events
 * disabled, and meant to live inside a `relative overflow-hidden` parent.
 *
 * Pieces:
 *  - <DotGrid />        — subtle dotted background (forest @ ~8% opacity)
 *  - <PaperTexture />   — diagonal kraft fiber overlay (very subtle)
 *  - <ArcStroke />      — large thin circle/arc outline accent
 *  - <UnderlineStroke />— hand-drawn underline for emphasising a word
 *  - <CornerLines />    — small bracket of crossing lines for section corners
 *
 * Colors come from CSS variables so they always stay on-brand.
 */
import { cn } from "@/lib/utils";

/* -------------------------------- DOT GRID ------------------------------- */
export function DotGrid({
  className,
  size = 22,
  opacity = 0.09,
}: {
  className?: string;
  size?: number;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `radial-gradient(circle, var(--forest) 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        opacity,
      }}
    />
  );
}

/* ----------------------------- PAPER TEXTURE ---------------------------- */
/** Diagonal repeating very-faint lines to mimic kraft paper fibers. */
export function PaperTexture({
  className,
  opacity = 0.05,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          var(--kraft) 0px,
          var(--kraft) 1px,
          transparent 1px,
          transparent 7px
        )`,
        opacity,
      }}
    />
  );
}

/* ------------------------------- ARC STROKE ------------------------------ */
/**
 * A large, very thin circle outline. Use it as a background accent behind
 * a hero headline or product grid. Position with utility classes.
 */
export function ArcStroke({
  className,
  color = "forest",
  strokeWidth = 1,
  opacity = 0.25,
}: {
  className?: string;
  color?: "forest" | "clay" | "kraft";
  strokeWidth?: number;
  opacity?: number;
}) {
  const stroke =
    color === "clay" ? "var(--clay)" : color === "kraft" ? "var(--kraft)" : "var(--forest)";
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      className={cn("pointer-events-none absolute", className)}
      style={{ opacity }}
      fill="none"
    >
      <circle cx="100" cy="100" r="98" stroke={stroke} strokeWidth={strokeWidth} />
      <circle cx="100" cy="100" r="78" stroke={stroke} strokeWidth={strokeWidth} strokeDasharray="2 4" />
    </svg>
  );
}

/* -------------------------- UNDERLINE STROKE ---------------------------- */
/**
 * A loose, hand-drawn underline. Drop inside a relative span around the word
 * you want to emphasise; it auto-stretches to width.
 */
export function UnderlineStroke({
  className,
  color = "clay",
  strokeWidth = 3,
}: {
  className?: string;
  color?: "clay" | "forest";
  strokeWidth?: number;
}) {
  const stroke = color === "forest" ? "var(--forest)" : "var(--clay)";
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 14"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute -bottom-2 left-0 h-3 w-full", className)}
      fill="none"
    >
      <path
        d="M2 9 C 40 2, 80 12, 120 6 S 180 4, 198 8"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------ CORNER LINES ----------------------------- */
/** A small two-line bracket to anchor a corner of a section. */
export function CornerLines({
  className,
  color = "forest",
  opacity = 0.25,
}: {
  className?: string;
  color?: "forest" | "clay" | "kraft";
  opacity?: number;
}) {
  const stroke =
    color === "clay" ? "var(--clay)" : color === "kraft" ? "var(--kraft)" : "var(--forest)";
  return (
    <svg
      aria-hidden
      viewBox="0 0 60 60"
      className={cn("pointer-events-none absolute h-16 w-16", className)}
      style={{ opacity }}
      fill="none"
    >
      <path d="M0 20 L40 20 L40 60" stroke={stroke} strokeWidth="1" />
      <path d="M0 30 L30 30 L30 60" stroke={stroke} strokeWidth="1" strokeDasharray="2 3" />
    </svg>
  );
}

/* ---------------------------- SECTION DIVIDER ---------------------------- */
/**
 * A thin signature divider: a single horizontal line that fades at both ends
 * with a small circle marker in the middle. Use between sections of the same
 * background color where a hard border would feel heavy.
 */
export function SignatureDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative mx-auto flex h-6 w-full max-w-7xl items-center justify-center", className)}
    >
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in oklab, var(--forest) 35%, transparent), transparent)",
        }}
      />
      <span
        className="absolute h-1.5 w-1.5 rounded-full"
        style={{ background: "var(--clay)", opacity: 0.6 }}
      />
    </div>
  );
}
