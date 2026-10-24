"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { useWebglAllowed } from "@/components/three/use-webgl-allowed";

const LabsScene = dynamic(() => import("@/components/three/labs-scene"), {
  ssr: false,
});

function LabsFallback() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 animate-soft-pulse rounded-full bg-brand-600/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl border border-brand-400/25" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-400/15" />
    </div>
  );
}

/** WebGL node-field for the dark «نامیرا لبز» section, with a static fallback. */
export function Labs3D({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "160px" });
  const allowed = useWebglAllowed();

  return (
    <div ref={ref} className={className} aria-hidden>
      {allowed && inView ? <LabsScene /> : <LabsFallback />}
    </div>
  );
}
