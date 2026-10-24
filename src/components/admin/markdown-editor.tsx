"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Code,
  Eye,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pencil,
  Quote,
} from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";
import type { MediaItem } from "@/lib/media";
import { MediaPicker } from "./media-picker";
import { cn } from "@/lib/utils";

type Tool = {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  run: () => void;
};

/**
 * Markdown content editor: a formatting toolbar, an image picker wired to the
 * media library, and a live preview. The textarea keeps `name`, so the value
 * submits with the surrounding form and keeps working without JavaScript's
 * help beyond the toolbar itself.
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
  const [preview, setPreview] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  /** Wrap the selection (or a placeholder) in `before`/`after`. */
  function surround(before: string, after: string, placeholder = "متن") {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    setValue(value.slice(0, start) + before + selected + after + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  /** Prefix every line touched by the selection. */
  function prefixLines(prefix: string) {
    const el = ref.current;
    if (!el) return;
    const start = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    const end = el.selectionEnd <= el.selectionStart ? el.selectionStart : el.selectionEnd;
    const block = value.slice(start, end);
    const next = block
      .split("\n")
      .map((line) => prefix + line)
      .join("\n");
    setValue(value.slice(0, start) + next + value.slice(end));
    requestAnimationFrame(() => el.focus());
  }

  const tools: Tool[] = [
    { label: "تیتر بخش", Icon: Heading2, run: () => prefixLines("## ") },
    { label: "تیتر فرعی", Icon: Heading3, run: () => prefixLines("### ") },
    { label: "درشت", Icon: Bold, run: () => surround("**", "**") },
    { label: "کج", Icon: Italic, run: () => surround("*", "*") },
    { label: "فهرست", Icon: List, run: () => prefixLines("- ") },
    { label: "فهرست شماره‌دار", Icon: ListOrdered, run: () => prefixLines("1. ") },
    { label: "نقل قول", Icon: Quote, run: () => prefixLines("> ") },
    { label: "پیوند", Icon: Link2, run: () => surround("[", "](https://)", "متن پیوند") },
    { label: "کد", Icon: Code, run: () => surround("`", "`", "کد") },
    { label: "تصویر", Icon: ImageIcon, run: () => setPickerOpen(true) },
  ];

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`md-${name}`} className="label mb-0">
          {label}
          {required ? <span className="text-red-400"> *</span> : null}
        </label>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="btn-ghost px-2 py-1 text-xs"
          aria-pressed={preview}
        >
          {preview ? <Pencil className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}
          {preview ? "ویرایش" : "پیش‌نمایش"}
        </button>
      </div>

      {hint ? <p className="text-[11px] text-ink-500">{hint}</p> : null}

      <div className="overflow-hidden rounded-card border border-line-200 bg-surface-50">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-line-200 bg-surface-100 p-1.5">
          {tools.map((tool) => (
            <button
              key={tool.label}
              type="button"
              title={tool.label}
              aria-label={tool.label}
              onClick={tool.run}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-ink-700 transition-colors hover:bg-brand-700/20 hover:text-accent"
            >
              <tool.Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        {preview ? (
          <div
            className="prose-page min-h-[8rem] overflow-y-auto p-4"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        ) : (
          <textarea
            id={`md-${name}`}
            ref={ref}
            name={name}
            rows={rows}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full resize-y border-0 bg-transparent p-4 text-sm leading-7 text-ink-900 outline-none"
            placeholder="متن خود را اینجا بنویسید…"
          />
        )}
      </div>

      <p className={cn("text-[11px] text-ink-500")}>
        {words.toLocaleString("fa-IR")} واژه · قالب‌بندی Markdown
      </p>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(item: MediaItem) => {
          const el = ref.current;
          const snippet = `\n![${item.alt || item.filename}](${item.path})\n`;
          if (el) {
            const at = el.selectionStart ?? value.length;
            setValue(value.slice(0, at) + snippet + value.slice(at));
          } else {
            setValue(value + snippet);
          }
          setPreview(false);
        }}
      />
    </div>
  );
}
