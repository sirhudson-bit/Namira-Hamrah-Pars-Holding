import type { Metadata } from "next";
import Link from "next/link";
import { Download, Mail, Trash2 } from "lucide-react";
import { prisma } from "@/server/db";
import {
  setMessageRead,
  deleteContactMessage,
  setApplicationStatus,
  deleteApplication,
  deleteSubscriber,
} from "@/server/admin-actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatJalaliLong, toPersianDigits } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "پیام‌ها و فرم‌ها" };

const STATUS_LABELS: Record<string, string> = {
  new: "جدید",
  review: "در بررسی",
  archived: "بایگانی",
};

export default async function AdminFormsPage() {
  const [messages, applications, subscribers] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.jobApplication.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="پیام‌ها و فرم‌ها"
        description="پیام‌های تماس، درخواست‌های همکاری و اعضای خبرنامه."
        action={
          <div className="flex flex-wrap gap-2">
            <a href="/api/admin/export?type=messages" className="btn-secondary">
              <Download className="h-4 w-4" aria-hidden />
              خروجی پیام‌ها (CSV)
            </a>
            <a href="/api/admin/export?type=applications" className="btn-secondary">
              <Download className="h-4 w-4" aria-hidden />
              خروجی رزومه‌ها (CSV)
            </a>
          </div>
        }
      />

      {/* Contact messages */}
      <section>
        <h2 className="heading-3 mb-4">پیام‌های تماس ({toPersianDigits(messages.length)})</h2>
        {messages.length === 0 ? (
          <div className="card p-8 text-center text-sm text-ink-500">پیامی دریافت نشده است.</div>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
                      {!m.read ? <span className="h-2 w-2 rounded-full bg-brand-600" /> : null}
                      {m.name}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      <a href={`mailto:${m.email}`} dir="ltr" className="hover:text-accent">
                        {m.email}
                      </a>
                      {m.phone ? (
                        <>
                          {" · "}
                          <span dir="ltr">{m.phone}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <time className="text-[11px] text-ink-500">{formatJalaliLong(m.createdAt)}</time>
                </div>
                {m.subject ? (
                  <p className="mt-3 text-xs font-medium text-ink-700">موضوع: {m.subject}</p>
                ) : null}
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-ink-700">{m.message}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <form action={setMessageRead}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="read" value={m.read ? "false" : "true"} />
                    <button type="submit" className="btn-ghost">
                      {m.read ? "علامت‌گذاری به‌عنوان خوانده‌نشده" : "علامت‌گذاری خوانده‌شده"}
                    </button>
                  </form>
                  <a href={`mailto:${m.email}`} className="btn-secondary">
                    <Mail className="h-4 w-4" aria-hidden />
                    پاسخ
                  </a>
                  <DeleteButton action={deleteContactMessage} id={m.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Applications */}
      <section>
        <h2 className="heading-3 mb-4">درخواست‌های همکاری ({toPersianDigits(applications.length)})</h2>
        {applications.length === 0 ? (
          <div className="card p-8 text-center text-sm text-ink-500">درخواستی ثبت نشده است.</div>
        ) : (
          <ul className="space-y-3">
            {applications.map((a) => (
              <li key={a.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink-900">{a.name}</p>
                    <p className="mt-1 text-xs text-ink-500">
                      {a.position} ·{" "}
                      <a href={`mailto:${a.email}`} dir="ltr" className="hover:text-accent">
                        {a.email}
                      </a>{" "}
                      · <span dir="ltr">{a.phone}</span>
                    </p>
                  </div>
                  <time className="text-[11px] text-ink-500">{formatJalaliLong(a.createdAt)}</time>
                </div>
                {a.coverLetter ? (
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-ink-700">
                    {a.coverLetter}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {a.resumePath ? (
                    <Link href={`/api/admin/resume/${a.id}`} className="btn-secondary">
                      <Download className="h-4 w-4" aria-hidden />
                      دانلود رزومه
                    </Link>
                  ) : (
                    <span className="text-xs text-ink-500">رزومه‌ای پیوست نشده است.</span>
                  )}
                  <form action={setApplicationStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={a.id} />
                    <label htmlFor={`status-${a.id}`} className="text-xs text-ink-500">
                      وضعیت:
                    </label>
                    <select
                      id={`status-${a.id}`}
                      name="status"
                      defaultValue={a.status}
                      className="input w-auto py-1.5 text-xs"
                    >
                      {Object.entries(STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn-ghost">
                      ذخیره
                    </button>
                  </form>
                  <DeleteButton action={deleteApplication} id={a.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Subscribers */}
      <section>
        <h2 className="heading-3 mb-4">اعضای خبرنامه ({toPersianDigits(subscribers.length)})</h2>
        {subscribers.length === 0 ? (
          <div className="card p-8 text-center text-sm text-ink-500">عضوی ثبت نشده است.</div>
        ) : (
          <div className="card divide-y divide-line-200">
            {subscribers.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm text-ink-900" dir="ltr">
                    {s.email}
                  </p>
                  <p className="text-[11px] text-ink-500">{formatJalaliLong(s.createdAt)}</p>
                </div>
                <form action={deleteSubscriber}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="btn-ghost" aria-label="حذف">
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
