import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const MIN_VISIBLE_MS = 650;
const DRAW_MS = 900;

export function PageProgressBar() {
  const location = useLocation();
  const prevKey = useRef(location.key);
  const [status, setStatus] = useState<"idle" | "pending">("idle");

  useEffect(() => {
    if (location.key !== prevKey.current) {
      prevKey.current = location.key;
      setStatus("pending");
      const t = setTimeout(() => setStatus("idle"), 50);
      return () => clearTimeout(t);
    }
  }, [location.key]);
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
