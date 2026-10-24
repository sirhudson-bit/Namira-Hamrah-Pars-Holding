"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Seamless marquee. The track holds two identical copies and animates by -50%,
 * so the loop is continuous; the duplicate is hidden from assistive tech.
 */
export function Marquee({
  items,
  reverse = false,
  speed = 40,
  className,
}: {
  items: ReactNode[];
  reverse?: boolean;
  speed?: number;
  className?: string;
}) {
  return (
    <div className={cn("relative flex overflow-hidden", className)}>
      <div
        className="flex w-max items-center"
        style={{
          animation: `${reverse ? "marquee-x-reverse" : "marquee-x"} ${speed}s linear infinite`,
        }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex items-center gap-12 pl-12"
          >
            {items.map((item, i) => (
              <div key={i} className="shrink-0">
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
