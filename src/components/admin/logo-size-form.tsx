"use client";

import { useActionState } from "react";
import { saveLogoSize } from "@/server/admin-actions";
import type { ActionResult } from "@/server/actions";
import { Field, FormFeedback } from "@/components/admin/fields";

/** Focused control for the header logo height (24–96 px). */
export function LogoSizeForm({
  value,
  bare = false,
}: {
  value: string;
  bare?: boolean;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    saveLogoSize,
    null,
  );

  // `bare` drops the card chrome so this can sit inside the card that owns the
  // logo files: a logo and the height it is drawn at are one decision, and two
  // nested boxes for them read as two unrelated settings.
  return (
    <form
      action={action}
      className={bare ? "border-t border-line-200 pt-5" : "mt-5 rounded-2xl border border-line-200 p-5"}
    >
      <div className="flex flex-wrap items-start gap-4">
        <div className="w-40 shrink-0">
          <Field
            label="ارتفاع لوگو (پیکسل)"
            name="logo_height"
            type="number"
            dir="ltr"
            min={24}
            max={96}
            defaultValue={value}
            hint="بین ۲۴ تا ۹۶. روی نشان پیش‌فرض هم اعمال می‌شود."
          />
        </div>
        <button type="submit" disabled={pending} className="btn-secondary mt-[22px] shrink-0">
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
