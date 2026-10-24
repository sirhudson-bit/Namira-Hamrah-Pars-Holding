"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CirclePlay, X } from "lucide-react";

/**
 * Hero video button. Opens the admin-configured embed in a full-screen viewer
 * with three ways out: the close button, Escape, or clicking the backdrop.
 * Renders nothing when no embed URL is configured, so the control can never be
 * present but dead.
 */
export function VideoModalTrigger({
  embedUrl,
  label,
}: {
  embedUrl: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  if (!embedUrl) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-line-200 bg-surface px-6 py-3 text-sm font-medium text-ink-900 transition-colors hover:border-brand-500/60 hover:bg-surface-100"
      >
        <CirclePlay className="h-4 w-4" aria-hidden />
        {label}
      </button>

      {/*
        Portalled to <body>: the page wraps content in its own stacking context
        (the ambient grid's z-10 layer), which would otherwise cap this overlay
        below the sticky header.
      */}
      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label={label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
                >
                  {/* Backdrop: click anywhere outside the player to close. */}
                  <button
                    type="button"
                    aria-label="بستن ویدئو"
                    onClick={close}
                    className="absolute inset-0 cursor-default"
                  />

                  <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    aria-label="بستن ویدئو"
                    className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 sm:right-8 sm:top-8"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>

                  <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="relative z-10 aspect-video w-full max-w-6xl overflow-hidden rounded-card border border-white/10 bg-black shadow-lift"
                  >
                    <iframe
                      src={embedUrl}
                      title={label}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
