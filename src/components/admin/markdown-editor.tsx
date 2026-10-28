"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "@/lib/utils";

const MdxEditorInner = dynamic(() => import("./mdx-editor-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-64 items-center justify-center rounded-card border border-line-200 bg-surface-50 text-sm text-ink-500">
      در حال بارگذاری ویرایشگر…
    </div>
  ),
});

/**
 * CMS content editor.
 *
 * The heavy lifting is done by MDXEditor (a ready-made Lexical-based Markdown
 * WYSIWYG). This wrapper keeps the existing form contract: a hidden input with
 * the field `name` carries the Markdown into the server action, and the component
 * still exposes label/hint/word count. It is dynamically imported with SSR off
 * because Lexical touches browser-only APIs.
 */
export function MarkdownEditor({
  name,
  label,
  defaultValue = "",
  hint,
  rows = 14,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  rows?: number;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`md-${name}`} className="label mb-0">
          {label}
          {required ? <span className="text-red-400"> *</span> : null}
        </label>
        <span className="text-[11px] text-ink-500">ویرایشگر حرفه‌ای Markdown</span>
      </div>

      {hint ? <p className="text-[11px] text-ink-500">{hint}</p> : null}

      <input type="hidden" id={`md-${name}`} name={name} value={value} />
      <MdxEditorInner
        markdown={value}
        onChange={setValue}
        minHeight={Math.max(320, Math.min(760, rows * 26))}
      />

      <p className={cn("text-[11px] text-ink-500")}>
        {words.toLocaleString("fa-IR")} واژه · خروجی به‌صورت Markdown ذخیره می‌شود
      </p>
    </div>
  );
}
