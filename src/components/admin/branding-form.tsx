"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { uploadBrandAsset, removeBrandAsset } from "@/server/admin-actions";
import type { ActionResult } from "@/server/actions";
import { FormFeedback } from "@/components/admin/fields";
import { cn } from "@/lib/utils";

const ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon";
const MAX_BYTES = 2 * 1024 * 1024;

export function BrandingUploader({
  kind,
  label,
  hint,
  current,
  tone = "light",
  square = false,
}: {
  kind: "logo" | "logo_light" | "favicon";
  label: string;
  hint: string;
  current: string;
  tone?: "light" | "dark";
  square?: boolean;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    uploadBrandAsset,
    null,
  );
  // Guards the transport: an oversized file would otherwise be posted and
  // rejected before the action ran, showing the visitor nothing at all.
  const [localError, setLocalError] = useState("");

  return (
    <div className="rounded-2xl border border-line-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-900">{label}</p>
          <p className="mt-1 text-xs text-ink-500">{hint}</p>
        </div>
        {current ? (
          <form action={removeBrandAsset}>
            <input type="hidden" name="kind" value={kind} />
            <button type="submit" className="btn-ghost text-xs text-red-400">
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              حذف
            </button>
          </form>
        ) : null}
      </div>

      <div
        className={cn(
          "mt-4 flex items-center justify-center rounded-xl border border-line-200 p-3",
          tone === "dark" ? "bg-dark-900" : "bg-surface-50",
          square ? "h-16 w-16" : "h-20 w-48",
        )}
      >
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current}
            alt=""
            className={cn("object-contain", square ? "h-10 w-10" : "max-h-full max-w-full")}
          />
        ) : (
          <span className="text-[11px] text-ink-500">فایلی بارگذاری نشده</span>
        )}
      </div>

      <form action={action} className="mt-4 flex flex-wrap items-center gap-3">
        <input type="hidden" name="kind" value={kind} />
        <input
          type="file"
          name="file"
          accept={ACCEPT}
          required
          aria-label={label}
          onChange={(e) => {
            const file = e.target.files?.[0];
            setLocalError(
              file && file.size > MAX_BYTES
                ? "حجم فایل باید کمتر از ۲ مگابایت باشد."
                : "",
            );
          }}
          className="input w-auto flex-1 file:ml-3 file:rounded-btn file:border-0 file:bg-brand-700/20 file:px-3 file:py-1.5 file:text-accent"
        />
        <button
          type="submit"
          disabled={pending || Boolean(localError)}
          className="btn-primary shrink-0"
        >
          {pending ? "در حال بارگذاری…" : "بارگذاری"}
        </button>
      </form>

      {localError ? (
        <div className="mt-3">
          <FormFeedback ok={false} message={localError} />
        </div>
      ) : null}

      {state ? (
        <div className="mt-3">
          <FormFeedback ok={state.ok} message={state.message} />
        </div>
      ) : null}
    </div>
  );
}
