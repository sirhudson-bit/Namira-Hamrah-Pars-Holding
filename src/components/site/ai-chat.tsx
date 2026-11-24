"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Loader2, MessageCircle, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/components/motion/reveal";
import type { ChromeLabels } from "@/server/chrome";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_KEYS = [
  "chatPromptGroups",
  "chatPromptContact",
  "chatPromptServices",
  "chatPromptJobs",
] as const;

/**
 * Floating site assistant.
 *
 * The button is the animated "orb" that used to sit inside the cover: moved to
 * the bottom-left corner (where a support launcher belongs) and made useful.
 * The panel is a plain chat transcript over `/api/chat`; the server decides
 * whether it answers from an LLM or from the site's own content.
 */
export function AiChat({
  enabled = true,
  title = "دستیار نامیرا",
  welcome = "سلام! چطور می‌توانم کمک کنم؟",
  labels,
}: {
  enabled?: boolean;
  title?: string;
  welcome?: string;
  labels: Pick<
    ChromeLabels,
    | "chatStatus"
    | "chatPlaceholder"
    | "chatTyping"
    | "chatNote"
    | "chatSend"
    | "chatClose"
    | "chatOpen"
    | "chatRetry"
    | "chatUnavailable"
    | "chatNetwork"
    | "chatPromptGroups"
    | "chatPromptContact"
    | "chatPromptServices"
    | "chatPromptJobs"
    | "close"
  >;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: welcome }]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 250);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, pending, open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || pending) return;

    const next: Message[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // The greeting is client-only chrome; only real turns go to the server.
          messages: next.filter((message, index) => index > 0 || message.role === "user"),
        }),
      });
      if (response.status === 429) {
        setError(labels.chatRetry);
      } else if (!response.ok) {
        setError(labels.chatUnavailable);
      } else {
        const data = (await response.json()) as { reply?: string };
        setMessages([
          ...next,
          { role: "assistant", content: data.reply || welcome },
        ]);
      }
    } catch {
      setError(labels.chatNetwork);
    } finally {
      setPending(false);
    }
  }

  if (!enabled) return null;

  return (
    <>
      {/* Launcher — the orb, now doing a job. */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? labels.chatClose : labels.chatOpen}
        aria-expanded={open}
        className={cn(
          "group fixed left-4 z-[76] inline-flex h-14 w-14 items-center justify-center rounded-full [bottom:calc(1.25rem+var(--consent-h,0px))] sm:left-6",
          "border border-brand-300/30 bg-[radial-gradient(circle_at_30%_25%,#45C7B8,#0F7C71_55%,#0A4B46)]",
          "text-white shadow-[0_18px_40px_-16px_rgba(38,181,166,0.85)] transition-transform duration-300",
          "hover:scale-105 active:scale-95 sm:bottom-6 sm:left-6",
        )}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border border-brand-300/40 opacity-60 [animation:soft-pulse_5s_ease-in-out_infinite]"
        />
        {open ? (
          <X className="relative h-5 w-5" aria-hidden />
        ) : (
          <MessageCircle className="relative h-6 w-6" aria-hidden />
        )}
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-surface-50 bg-brand-300"
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="chat"
            role="dialog"
            aria-modal="false"
            aria-label={title}
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="fixed left-3 z-[77] flex w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-line-200 bg-surface shadow-lift sm:left-6 sm:w-[380px]"
            style={{
              maxHeight: "min(560px, calc(100vh - 11rem))",
              bottom: "calc(var(--consent-h, 0px) + 5.25rem)",
            }}
          >
            <header className="flex items-center justify-between gap-3 border-b border-line-200 bg-surface-100/70 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700/20 text-accent">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-ink-900">{title}</p>
                  <p className="flex items-center gap-1.5 text-[10px] text-ink-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
                    {labels.chatStatus}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={labels.close}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-surface-200 hover:text-ink-900"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </header>

            <div ref={bodyRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-start" : "justify-end",
                  )}
                >
                  <p
                    className={cn(
                      "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-6",
                      message.role === "user"
                        ? "bg-brand-700 text-white"
                        : "border border-line-200 bg-surface-100 text-ink-700",
                    )}
                  >
                    {message.content}
                  </p>
                </div>
              ))}

              {pending ? (
                <div className="flex justify-end">
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-line-200 bg-surface-100 px-3 py-2 text-[11.5px] text-ink-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    {labels.chatTyping}
                  </span>
                </div>
              ) : null}

              {error ? (
                <p role="alert" className="rounded-btn bg-red-500/10 px-3 py-2 text-[11.5px] text-red-400">
                  {error}
                </p>
              ) : null}

              {messages.length <= 1 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => send(labels[key])}
                      className="rounded-full border border-line-200 px-2.5 py-1 text-[10.5px] text-ink-500 transition-colors hover:border-brand-500/50 hover:text-accent"
                    >
                      {labels[key]}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
              className="border-t border-line-200 bg-surface p-2.5"
            >
              <div className="flex items-end gap-2 rounded-xl border border-line-200 bg-surface-100 px-2 py-1.5 focus-within:border-brand-500">
                <label htmlFor="ai-chat-input" className="sr-only">
                  {labels.chatPlaceholder}
                </label>
                <textarea
                  id="ai-chat-input"
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder={labels.chatPlaceholder}
                  className="max-h-24 min-h-9 flex-1 resize-none bg-transparent px-1 py-1.5 text-[12.5px] text-ink-900 outline-none placeholder:text-ink-400"
                />
                <button
                  type="submit"
                  disabled={pending || input.trim().length === 0}
                  aria-label={labels.chatSend}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white transition-colors hover:bg-brand-800 disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <p className="mt-1.5 px-1 text-[9.5px] text-ink-400">
                {labels.chatNote}
              </p>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
