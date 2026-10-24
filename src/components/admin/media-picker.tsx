"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ImageIcon, Loader2, Search, Upload, X } from "lucide-react";
import { listMediaAssets, uploadMedia } from "@/server/admin-actions";
import type { MediaItem } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Media library picker for the content editor. Opens over the form, lists the
 * uploaded assets (searchable) and inserts the chosen image as Markdown.
 */
export function MediaPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (item: MediaItem) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listMediaAssets());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setError("");
    void refresh();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, refresh]);

  async function onUpload(formData: FormData) {
    setUploading(true);
    setError("");
    const result = await uploadMedia(null, formData);
    if (!result.ok) setError(result.message);
    setUploading(false);
    await refresh();
  }

  if (!mounted || !open) return null;

  const filtered = query.trim()
    ? items.filter((i) =>
        `${i.filename} ${i.alt}`.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : items;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="کتابخانه رسانه"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"
    >
      <button type="button" aria-label="بستن" onClick={onClose} className="absolute inset-0 cursor-default" />

      <div className="card relative z-10 flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line-200 p-4">
          <h2 className="heading-3">کتابخانه رسانه</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line-200 hover:bg-surface-100"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-line-200 p-4">
          <label className="relative flex-1 min-w-[12rem]">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden />
            <span className="sr-only">جست‌وجوی تصویر</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جست‌وجو…"
              className="input pr-9"
            />
          </label>
          <form action={onUpload} className="flex items-center gap-2">
            <input
              type="file"
              name="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              required
              aria-label="بارگذاری تصویر جدید"
              className="input w-auto file:ml-2 file:rounded-xl file:border-0 file:bg-brand-700/20 file:px-3 file:py-1.5 file:text-accent"
            />
            <button type="submit" disabled={uploading} className="btn-secondary shrink-0">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
              بارگذاری
            </button>
          </form>
        </div>

        {error ? (
          <p role="alert" className="border-b border-line-200 bg-red-500/10 px-4 py-2 text-xs text-red-400">
            {error}
          </p>
        ) : null}

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="py-10 text-center text-sm text-ink-500">در حال بارگذاری…</p>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-500">
              تصویری یافت نشد. از دکمه «بارگذاری» استفاده کنید.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onPick(item);
                    onClose();
                  }}
                  className={cn(
                    "group overflow-hidden rounded-card border border-line-200 bg-surface-100 text-right transition-colors hover:border-brand-500/60",
                  )}
                >
                  <span className="flex h-28 items-center justify-center bg-surface p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.path} alt={item.alt || item.filename} className="max-h-full max-w-full object-contain" />
                  </span>
                  <span className="block truncate px-3 py-2 text-[11px] text-ink-500" dir="ltr">
                    {item.filename}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-line-200 px-4 py-3 text-[11px] text-ink-500">
          <ImageIcon className="h-4 w-4" aria-hidden />
          با انتخاب تصویر، کد آن در متن درج می‌شود.
        </div>
      </div>
    </div>,
    document.body,
  );
}
