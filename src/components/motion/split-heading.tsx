"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE } from "@/components/motion/reveal";

/**
 * Oversized editorial headline whose words rise into place, one after another.
 *
 * Each word sits in an `overflow-hidden` box so it is masked while it travels.
 * The extra bottom padding (cancelled by a negative margin) keeps Persian
 * descenders — ی، ج، ق — from being clipped by that mask. Screen readers get
 * the plain sentence once from the `sr-only` copy; the animated spans are
 * hidden from the accessibility tree, so the words are never read one by one.
 */
export function SplitHeading({
  text,
  className,
  delay = 0,
  wordDelay = 0.05,
}: {
  text: string;
  className?: string;
  delay?: number;
  wordDelay?: number;
}) {
  const reduce = useReducedMotion();
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  return (
    <span className={cn("block", className)}>
      <span className="sr-only">{lines.join(" ")}</span>
      <span aria-hidden>
        {lines.map((line, lineIndex) => (
          <span key={`${line}-${lineIndex}`} className="block">
            {line.split(" ").map((word, wordIndex) => (
              <span
                key={`${word}-${wordIndex}`}
                className="inline-block overflow-hidden pb-[0.18em] -mb-[0.18em] align-bottom"
              >
                {reduce ? (
                  <span className="inline-block">
                    {word}
                    {"\u00A0"}
                  </span>
                ) : (
                  <motion.span
                    className="inline-block will-change-transform"
                    initial={{ y: "110%" }}
                    whileInView={{ y: "0%" }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.9,
                      ease: EASE,
                      delay: delay + (lineIndex * 4 + wordIndex) * wordDelay,
                    }}
                  >
                    {word}
                    {"\u00A0"}
                  </motion.span>
                )}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}
