"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useWebglAllowed } from "@/components/three/use-webgl-allowed";
import { cn } from "@/lib/utils";

const OrbScene = dynamic(() => import("@/components/three/orb-scene"), {
  ssr: false,
});

/** Static composition shown without WebGL, and under reduced motion. */
function OrbFallback() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 animate-soft-pulse rounded-full bg-brand-500/25 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-3/5 w-3/5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-500/30" />
      <div className="absolute left-1/2 top-1/2 h-4/5 w-4/5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-500/15" />
      <div className="absolute left-1/2 top-1/2 h-2/5 w-2/5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-500/70 to-brand-800/70" />
    </div>
  );
}

/** Follows the site theme so the particles stay legible on either background. */
function useOrbTheme(): "dark" | "light" {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

/**
 * The particle orb. Mounts the WebGL scene only while it is on screen and the
 * browser can actually provide a context; otherwise the static fallback holds
 * the same space so nothing shifts.
 */
export function ParticleOrb({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "160px" });
  const allowed = useWebglAllowed();
  const theme = useOrbTheme();

  return (
    <div ref={ref} className={cn("relative", className)} aria-hidden>
      {allowed && inView ? (
        <>
          {/* Soft ambient bloom behind the particles. */}
          <div className="pointer-events-none absolute inset-[12%] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_70%)]" />
          <OrbScene theme={theme} />
        </>
      ) : (
        <OrbFallback />
      )}
    </div>
  );
}
