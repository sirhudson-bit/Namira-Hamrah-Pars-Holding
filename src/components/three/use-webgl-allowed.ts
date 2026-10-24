"use client";

import { useEffect, useState } from "react";

/**
 * True only when it is safe and worthwhile to mount a WebGL canvas: the visitor
 * has not asked for reduced motion, and the browser can actually create a
 * WebGL context. Everything else falls back to the static composition.
 */
export function useWebglAllowed() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      if (!gl) return;
    } catch {
      return;
    }
    setAllowed(true);
  }, []);

  return allowed;
}
