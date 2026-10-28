"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutTemplate, LogIn, Pencil, X } from "lucide-react";

/**
 * Admin-only on-site editing bar.
 *
 * Clicking an element that a server component marked with `data-live-field`
 * makes it contenteditable; on blur the new text is posted to
 * `/api/admin/live-edit`, which re-checks the session and only accepts
 * whitelisted text fields. Images and Markdown keep their richer admin editors.
 */
export function LiveEditBar({ isAdmin }: { isAdmin: boolean }) {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    document.body.classList.add("live-edit-mode");
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-live-field]"));
    const cleanups: (() => void)[] = [];

    for (const node of nodes) {
      node.contentEditable = "true";
      node.spellcheck = false;
      node.dataset.original = node.innerText;
      node.setAttribute("role", "textbox");
      node.setAttribute("aria-label", "ویرایش زنده متن");

      const onBlur = async () => {
        const original = node.dataset.original ?? "";
        const value = node.innerText.trim();
        if (value === original.trim()) return;
        const pageSlug = node.dataset.livePage;
        const blockId = node.dataset.liveBlock;
        const field = node.dataset.liveField;
        if (!pageSlug || !field) return;
        setStatus("در حال ذخیره…");
        try {
          const response = await fetch("/api/admin/live-edit", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              kind: blockId ? "block" : "page",
              pageSlug,
              ...(blockId ? { blockId } : {}),
              field,
              value,
            }),
          });
          if (!response.ok) throw new Error("save failed");
          node.dataset.original = value;
          setStatus("ذخیره شد");
          window.setTimeout(() => window.location.reload(), 450);
        } catch {
          node.innerText = original;
          setStatus("ذخیره نشد؛ دوباره تلاش کنید");
        }
      };

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          node.innerText = node.dataset.original ?? "";
          node.blur();
        }
        if (event.key === "Enter" && node.tagName !== "P") {
          event.preventDefault();
          node.blur();
        }
      };

      const onClick = (event: MouseEvent) => {
        if (node.tagName === "A") event.preventDefault();
      };

      node.addEventListener("blur", onBlur);
      node.addEventListener("keydown", onKeyDown);
      node.addEventListener("click", onClick);
      cleanups.push(() => {
        node.removeEventListener("blur", onBlur);
        node.removeEventListener("keydown", onKeyDown);
        node.removeEventListener("click", onClick);
        node.contentEditable = "false";
        node.removeAttribute("role");
        node.removeAttribute("aria-label");
      });
    }

    return () => {
      document.body.classList.remove("live-edit-mode");
      for (const cleanup of cleanups) cleanup();
    };
  }, [active]);

  if (!isAdmin) return null;

  return (
    <>
      {active ? (
        <style>{`
          [data-live-field][contenteditable="true"] {
            outline: 1px dashed #e9b04b;
            outline-offset: 3px;
            border-radius: 4px;
            cursor: text;
            transition: background-color .15s ease;
          }
          [data-live-field][contenteditable="true"]:focus {
            outline: 2px solid #e9b04b;
            background-color: rgba(233, 176, 75, .08);
          }
        `}</style>
      ) : null}

      <div className="fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-2" dir="rtl">
        {status ? (
          <span className="rounded-full border border-line-200 bg-surface px-3 py-1 text-[11px] text-ink-700 shadow-lift" role="status">
            {status}
          </span>
        ) : null}
        {active ? (
          <div className="flex flex-wrap items-center justify-end gap-2 rounded-full border border-line-200 bg-surface/95 px-2 py-1.5 text-[11px] shadow-lift backdrop-blur">
            <span className="px-2 text-ink-500">روی متن کلیک کنید و مستقیم ویرایش کنید</span>
            <Link href="/admin/pages" className="rounded-full px-2 py-1 text-accent hover:bg-surface-100">
              <LayoutTemplate className="ml-1 inline h-3.5 w-3.5" aria-hidden /> صفحات
            </Link>
            <Link href="/admin/menus" className="rounded-full px-2 py-1 text-accent hover:bg-surface-100">
              منوها
            </Link>
            <button
              type="button"
              onClick={() => setActive(false)}
              className="rounded-full bg-brand-700 px-3 py-1.5 font-medium text-white hover:bg-brand-800"
            >
              <X className="ml-1 inline h-3.5 w-3.5" aria-hidden /> پایان ویرایش
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2.5 text-xs font-medium text-white shadow-lift transition-colors hover:bg-brand-800"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            ویرایش زنده
            <LogIn className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </button>
        )}
      </div>
    </>
  );
}
