"use client";

import { useActionState, useState } from "react";
import { Loader2, Trash2, Type, Upload } from "lucide-react";
import { deleteFont, uploadFont } from "@/server/admin-actions";
import type { ActionResult } from "@/server/actions";
import { FormFeedback } from "@/components/admin/fields";
import type { FontAssetRow } from "@/server/fonts";

const WEIGHTS = [
  { value: "300", label: "Light 300" },
  { value: "400", label: "Regular 400" },
  { value: "500", label: "Medium 500" },
  { value: "600", label: "SemiBold 600" },
  { value: "700", label: "Bold 700" },
  { value: "800", label: "ExtraBold 800" },
  { value: "900", label: "Black 900" },
];

/**
 * Font library: upload files, group them into a family, preview, delete.
 *
 * A family is only usable once at least one weight exists for it; the settings
 * form lists exactly the families present in this table plus the bundled
 * Vazirmatn, so a typo can never point the site at a font that does not exist.
 */
export function FontManager({
  assets,
  families,
}: {
  assets: FontAssetRow[];
  families: string[];
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    uploadFont,
    null,
  );
  const [file, setFile] = useState<File | null>(null);

  const grouped = families
    .filter((family) => family !== "Vazirmatn")
    .map((family) => ({
      family,
      files: assets.filter((asset) => asset.family === family),
    }))
    .filter((group) => group.files.length > 0);

  return (
    <div className="space-y-5">
      <section className="card p-5">
        <h2 className="mb-1 flex items-center gap-2 text-[14px] font-bold text-ink-900">
          <Upload className="h-4 w-4 text-accent" aria-hidden />
          بارگذاری فونت
        </h2>
        <p className="mb-4 text-[12px] leading-6 text-ink-500">
          فایل‌های woff2، woff، ttf و otf تا ۴ مگابایت. برای هر وزن فایل جدا بارگذاری کنید و
          «نام خانواده» را برای همه‌ی وزن‌ها یکسان بنویسید (مثلاً «IRANSansX»). خانواده‌ای که
          بسازید، در همین صفحه برای متن یا تیترها قابل انتخاب می‌شود.
        </p>

        <form action={action} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="font-family" className="label">
              نام خانواده
            </label>
            <input
              id="font-family"
              name="family"
              list="font-families"
              required
              dir="ltr"
              className="input"
              placeholder="IRANSansX"
            />
            <datalist id="font-families">
              {families
                .filter((family) => family !== "Vazirmatn")
                .map((family) => (
                  <option key={family} value={family} />
                ))}
            </datalist>
            <p className="mt-1 text-[11px] text-ink-500">
              نام تکراری، وزن جدیدی به همان خانواده اضافه می‌کند.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="font-weight" className="label">
                وزن
              </label>
              <select id="font-weight" name="weight" defaultValue="400" className="input">
                {WEIGHTS.map((weight) => (
                  <option key={weight.value} value={weight.value}>
                    {weight.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="font-style" className="label">
                سبک
              </label>
              <select id="font-style" name="style" defaultValue="normal" className="input">
                <option value="normal">معمولی</option>
                <option value="italic">ایتالیک</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="font-file" className="label">
              فایل فونت
            </label>
            <input
              id="font-file"
              name="file"
              type="file"
              required
              accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="input file:ml-3 file:rounded-btn file:border-0 file:bg-brand-700/20 file:px-3 file:py-1.5 file:text-accent"
            />
            <p className="mt-1 text-[11px] text-ink-500">
              {file
                ? `${file.name} — ${(file.size / 1024).toFixed(0)} کیلوبایت`
                : "فایل فونت را انتخاب کنید؛ حداکثر ۴ مگابایت."}
            </p>
          </div>

          {state ? (
            <div className="sm:col-span-2">
              <FormFeedback ok={state.ok} message={state.message} />
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <button type="submit" disabled={pending || !file} className="btn-primary">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
              {pending ? "در حال بارگذاری…" : "بارگذاری فونت"}
            </button>
          </div>
        </form>
      </section>

      <section className="card p-5">
        <h2 className="mb-1 flex items-center gap-2 text-[14px] font-bold text-ink-900">
          <Type className="h-4 w-4 text-accent" aria-hidden />
          کتابخانه فونت
        </h2>
        <p className="mb-4 text-[12px] text-ink-500">
          پیش‌فرض سایت Vazirmatn است و نیازی به بارگذاری ندارد. خانواده‌های زیر از فایل‌های
          بارگذاری‌شده ساخته شده‌اند.
        </p>

        {grouped.length === 0 ? (
          <div className="rounded border border-dashed border-line-200 px-4 py-8 text-center text-[12.5px] text-ink-500">
            هنوز فونتی بارگذاری نشده است.
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map((group) => (
              <div key={group.family} className="rounded border border-line-200">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line-200 bg-surface-100 px-3 py-2">
                  <span className="text-[13px] font-semibold text-ink-900" dir="ltr">
                    {group.family}
                  </span>
                  <span className="text-[10.5px] text-ink-500">
                    {group.files.length.toLocaleString("fa-IR")} فایل
                  </span>
                </div>

                <p
                  className="border-b border-line-200 px-3 py-4 text-[18px] leading-9 text-ink-900"
                  style={{ fontFamily: `"${group.family}", Vazirmatn, sans-serif` }}
                >
                  نامیرا همراه پارس — نمونه متن فارسی ۱۲۳۴۵
                </p>

                <ul className="divide-y divide-line-200">
                  {group.files.map((asset) => (
                    <li key={asset.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                      <span className="min-w-0 text-[11.5px] text-ink-700">
                        <span className="font-medium text-ink-900">{asset.weight}</span>
                        <span className="mx-1 text-ink-400">·</span>
                        {asset.style === "italic" ? "ایتالیک" : "معمولی"}
                        <span className="mx-1 text-ink-400">·</span>
                        <span className="text-ink-500" dir="ltr">
                          {asset.path.split("/").pop()}
                        </span>
                        <span className="mx-1 text-ink-400">·</span>
                        {(asset.size / 1024).toFixed(0)} KB
                      </span>
                      <form action={deleteFont}>
                        <input type="hidden" name="id" value={asset.id} />
                        <button
                          type="submit"
                          className="wp-action wp-action-danger inline-flex items-center gap-1 text-[11px]"
                          aria-label="حذف فونت"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          حذف
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
