"use client";

import { useState } from "react";
import { ImageIcon, ImagePlus, Trash2 } from "lucide-react";
import { MediaPicker } from "./media-picker";
import { isSafeImageSrc } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Image input used by every entity form.
 *
 * The value is a plain text field (so it submits with the form and accepts a
 * pasted URL), with a media-library picker beside it. The preview only paints
 * values that pass `isSafeImageSrc`, so a stale `javascript:` row cannot even
 * be previewed.
 */
export function ImageField({
  label,
  name,
  defaultValue = "",
  hint,
  required,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
  required?: boolean;
  error?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const safe = isSafeImageSrc(value);

  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
        {required ? <span className="text-red-400"> *</span> : null}
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-card border border-line-200 bg-surface-50 sm:w-44">
          {safe ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-[11px] text-ink-500">
              <ImageIcon className="h-6 w-6" aria-hidden />
              تصویری انتخاب نشده
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setOpen(true)} className="btn-secondary px-3 py-1.5 text-xs">
              <ImagePlus className="h-4 w-4" aria-hidden />
              انتخاب از رسانه
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => setValue("")}
                className="btn-ghost px-2 py-1 text-xs text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                حذف تصویر
              </button>
            ) : null}
          </div>
          <input
            id={name}
            name={name}
            type="text"
            dir="ltr"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            required={required}
            placeholder="/uploads/media/…"
            aria-invalid={error ? true : undefined}
            className={cn("input text-xs", error && "border-red-400")}
          />
          {hint ? <p className="text-xs text-ink-500">{hint}</p> : null}
          {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
        </div>
      </div>

      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onPick={(item) => setValue(item.path)}
      />
    </div>
  );
}
