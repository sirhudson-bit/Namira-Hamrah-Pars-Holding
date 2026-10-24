"use client";

import { useActionState, useState } from "react";
import { uploadMedia } from "@/server/admin-actions";
import type { ActionResult } from "@/server/actions";
import { Field, FormFeedback } from "@/components/admin/fields";

const MAX_BYTES = 5 * 1024 * 1024;

export function MediaUploadForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    uploadMedia,
    null,
  );
  // Keeps an oversized file from being posted and rejected before the action
  // can explain why.
  const [localError, setLocalError] = useState("");

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="file" className="label">
          فایل تصویر<span className="text-red-400"> *</span>
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          required
          onChange={(e) => {
            const file = e.target.files?.[0];
            setLocalError(
              file && file.size > MAX_BYTES ? "حجم فایل باید کمتر از ۵ مگابایت باشد." : "",
            );
          }}
          className="input file:ml-3 file:rounded-btn file:border-0 file:bg-brand-700/20 file:px-3 file:py-1.5 file:text-accent"
        />
        <p className="mt-1 text-xs text-ink-500">
          حداکثر ۵ مگابایت. PNG، JPEG، WEBP، SVG یا GIF — تصاویر رستری به‌طور خودکار به WebP
          تبدیل می‌شوند.
        </p>
      </div>
      <Field label="متن جایگزین (alt)" name="alt" hint="برای دسترس‌پذیری توصیه می‌شود." />
      {localError ? <FormFeedback ok={false} message={localError} /> : null}
      {state ? <FormFeedback ok={state.ok} message={state.message} /> : null}
      <button type="submit" disabled={pending || Boolean(localError)} className="btn-primary">
        {pending ? "در حال بارگذاری…" : "بارگذاری"}
      </button>
    </form>
  );
}
