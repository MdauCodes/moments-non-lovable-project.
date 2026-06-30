import { useEffect, useRef, useState } from "react";
import { useNavigation } from "react-router-dom";


/**
 * Editorial "drawing line" route-change indicator.
 *
 * On every route navigation, a thin clay line draws itself horizontally
 * across the very top of the viewport from left to right, then dissolves
 * once the new route has settled. No spinner, no pulse — feels like ink.
 *
 * Even if the new route resolves in <100ms, we hold the animation for a
 * minimum visible window so the user always perceives the transition.
 */
const MIN_VISIBLE_MS = 650; // minimum time the line stays on screen
const DRAW_MS = 900;        // duration of the initial 0 → 0.85 draw

export function PageProgressBar() {
  const status = useNavigation().state !== "idle" ? "pending" : "idle";
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [duration, setDuration] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    let completeTimer: ReturnType<typeof setTimeout> | null = null;
    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    if (status === "pending") {
      startedAtRef.current = performance.now();
      setOpacity(1);
      setScale(0);
      setDuration(0);
      const grow = requestAnimationFrame(() => {
        setDuration(DRAW_MS);
        setScale(0.85);
      });
      return () => cancelAnimationFrame(grow);
    }

    if (status === "idle" && startedAtRef.current !== null) {
      const elapsed = performance.now() - startedAtRef.current;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

      completeTimer = setTimeout(() => {
        setDuration(220);
        setScale(1);
        fadeTimer = setTimeout(() => setOpacity(0), 240);
        resetTimer = setTimeout(() => {
          setScale(0);
          setDuration(0);
          startedAtRef.current = null;
        }, 600);
      }, wait);
    }

    return () => {
      if (completeTimer) clearTimeout(completeTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [status]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px]"
      style={{ opacity, transition: "opacity 320ms ease-out" }}
    >
      <div
        className="h-full origin-left"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, var(--clay) 10%, var(--clay) 90%, transparent 100%)",
          transform: `scaleX(${scale})`,
          transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          boxShadow: "0 0 6px color-mix(in oklab, var(--clay) 40%, transparent)",
        }}
      />
    </div>
  );
}
