"use client";

import { motion } from "framer-motion";
import { EASE } from "@/components/motion/reveal";
import { RevealOnScroll } from "@/components/site/reveal-on-scroll";

/**
 * Applied to every public page (and remounted on navigation). The wrapper
 * animates opacity only — a transform here would create a containing block and
 * break the sticky/pinned sections.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <RevealOnScroll />
      {children}
    </motion.div>
  );
}
