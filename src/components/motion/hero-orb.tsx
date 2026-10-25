"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ParticleOrb } from "@/components/three/particle-orb";

/** Distance over which the orb fades out as the hero leaves the viewport. */
const FADE_PX = 140;

/**
 * The hero's particle orb, pinned to an edge of the viewport.
 *
 * Placement comes from /admin/home and arrives as three CSS variables, so the
 * stylesheet keeps owning the geometry (including the phone fallback) while the
 * administrator only chooses the numbers.
 *
 * It is fixed, so it stays put while the hero scrolls — but it belongs to the
 * hero and must not survive it. An rAF-throttled scroll probe fades it out over
 * the last `FADE_PX` of the hero and then unmounts the WebGL scene entirely, so
 * it is never visible over the rest of the site and stops costing GPU time the
 * moment the hero is gone.
 *
 * The wrapper is `pointer-events: none` so it never intercepts clicks on the
 * content that scrolls underneath.
 */
export function HeroOrb({
  align = "left",
  offsetX = 2,
  offsetY = 50,
  size = 44,
}: {
  align?: "left" | "right" | "center";
  /** Distance from the chosen edge, in vw. */
  offsetX?: number;
  /** Vertical centre, in vh from the top. */
  offsetY?: number;
  /** Diameter, in vw. */
  size?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const hero = el.closest("section");
    if (!hero) return;

    let raf = 0;

    const apply = () => {
      raf = 0;
      const { bottom } = hero.getBoundingClientRect();
      // 1 while the hero is on screen, easing to 0 as its bottom edge passes
      // the top of the viewport.
      const fade = Math.min(1, Math.max(0, bottom / FADE_PX));
      el.style.setProperty("--sphere-fade", fade.toFixed(3));
      setActive(bottom > 0);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const style = {
    "--sphere-x": offsetX,
    "--sphere-y": offsetY,
    "--sphere-size": `${size}vw`,
  } as CSSProperties;

  return (
    <span ref={ref} className="sphere" data-align={align} style={style} aria-hidden>
      {active ? <ParticleOrb className="h-full w-full" /> : null}
    </span>
  );
}
