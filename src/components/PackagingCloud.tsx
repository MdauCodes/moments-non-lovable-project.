import { useEffect, useState } from "react";
import cloudImgKraft from "@/assets/packaging-cloud-hero.png";
import cloudImgDiverse from "@/assets/packaging-cloud-hero-v3.png";

/**
 * Roving spotlight regions over the dense packaging photo.
 * Coordinates are % of the image (0-100).
 */
const SPOTS: Array<{ x: number; y: number; label: string }> = [
  { x: 38, y: 30, label: "Kraft carrier bags" },
  { x: 62, y: 22, label: "Shopping bags" },
  { x: 50, y: 48, label: "Coffee cups & lids" },
  { x: 30, y: 58, label: "Takeaway boxes" },
  { x: 70, y: 52, label: "Food boxes" },
  { x: 55, y: 72, label: "Jars & tubs" },
  { x: 35, y: 80, label: "Pizza & meal boxes" },
  { x: 75, y: 78, label: "Bottles & containers" },
  { x: 22, y: 38, label: "Mailers & shipping" },
  { x: 78, y: 35, label: "Gift & retail boxes" },
];

const CLOUD_VARIANTS = [cloudImgKraft, cloudImgDiverse] as const;

export function PackagingCloud() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [variantIdx, setVariantIdx] = useState(0);

  // Spotlight rotation
  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % SPOTS.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  // Slow image crossfade between Kraft & Diverse variants
  useEffect(() => {
    const id = window.setInterval(() => {
      setVariantIdx((i) => (i + 1) % CLOUD_VARIANTS.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, []);

  const active = SPOTS[activeIdx];

  return (
    <div className="relative h-full w-full select-none">
      <div className="relative h-full w-full">
        {/* Stacked images crossfade smoothly via opacity */}
        {CLOUD_VARIANTS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={
              i === 0
                ? "A cluster of kraft paper packaging — bags, boxes, cups and more"
                : "A diverse cluster of branded packaging — kraft, white, black, pastel bags & boxes"
            }
            width={1280}
            height={1280}
            className="absolute inset-0 h-full w-full object-contain transition-opacity duration-[1500ms] ease-in-out"
            style={{
              opacity: variantIdx === i ? 1 : 0,
              filter: "drop-shadow(0 30px 40px rgb(0 0 0 / 0.12))",
            }}
          />
        ))}

        {/* Roving spotlight glow */}
        <div
          className="pointer-events-none absolute h-[28%] w-[28%] rounded-full transition-all duration-[1400ms] ease-in-out"
          style={{
            left: `${active.x}%`,
            top: `${active.y}%`,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgb(212 165 116 / 0.55) 0%, rgb(212 165 116 / 0.15) 40%, transparent 70%)",
            filter: "blur(8px)",
            mixBlendMode: "screen",
          }}
          aria-hidden
        />

        {/* Subtle ring marker */}
        <div
          className="pointer-events-none absolute h-[14%] w-[14%] rounded-full border border-accent/60 transition-all duration-[1400ms] ease-in-out"
          style={{
            left: `${active.x}%`,
            top: `${active.y}%`,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 0 6px rgb(212 165 116 / 0.12)",
          }}
          aria-hidden
        />
      </div>

      {/* Floating label */}
      <div
        key={activeIdx}
        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 animate-fade-in"
        style={{
          left: `${active.x}%`,
          top: `${active.y + 14}%`,
        }}
      >
        <span className="whitespace-nowrap rounded-full bg-foreground px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-background shadow-lg">
          {active.label}
        </span>
      </div>
    </div>
  );
}
