"use client";

import { useActionState } from "react";
import { saveLogoSize } from "@/server/admin-actions";
import type { ActionResult } from "@/server/actions";
import { Field, FormFeedback } from "@/components/admin/fields";

/** Focused control for the header logo height (24–96 px). */
export function LogoSizeForm({ value }: { value: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    saveLogoSize,
    null,
  );

  return (
    <form action={action} className="mt-5 rounded-2xl border border-line-200 p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-44">
          <Field
            label="ارتفاع لوگو در سربرگ (پیکسل)"
            name="logo_height"
            type="number"
            defaultValue={value}
            hint="بین ۲۴ تا ۹۶. روی لوگوی بارگذاری‌شده و نشان پیش‌فرض اعمال می‌شود."
          />
        </div>
        <button type="submit" disabled={pending} className="btn-secondary shrink-0">
          {pending ? "در حال ذخیره…" : "ذخیره اندازه"}
        </button>
      </div>
      {state ? (
        <div className="mt-3">
          <FormFeedback ok={state.ok} message={state.message} />
        </div>
      ) : null}
    </form>
  );
}
