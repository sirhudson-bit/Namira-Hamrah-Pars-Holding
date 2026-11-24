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
import { ScreenHeader, ScreenTabs } from "@/components/admin/wp/screen";
import { formatJalaliLong, toPersianDigits } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "فرم‌ها" };

const STATUS_LABELS: Record<string, string> = {
  new: "جدید",
  review: "در بررسی",
  archived: "بایگانی",
};

const TABS = [
  { key: "messages", label: "پیام‌های تماس" },
  { key: "applications", label: "درخواست‌های شغلی" },
  { key: "subscribers", label: "خبرنامه" },
];

export default async function AdminFormsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = TABS.some((entry) => entry.key === params.tab) ? (params.tab as string) : "messages";

  const [messages, applications, subscribers] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.jobApplication.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const unread = messages.filter((message) => !message.read).length;

  return (
    <div>
      <ScreenHeader
        title="فرم‌ها"
        description="پیام‌های تماس، درخواست‌های همکاری و اعضای خبرنامه که از سایت دریافت شده‌اند."
        breadcrumb={[{ label: "فرم‌ها" }]}
        action={
          <>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/api/admin/export?type=messages" className="btn-secondary">
              <Download className="h-4 w-4" aria-hidden />
              خروجی پیام‌ها
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/api/admin/export?type=applications" className="btn-secondary">
              <Download className="h-4 w-4" aria-hidden />
              خروجی رزومه‌ها
            </a>
          </>
        }
      />

      <ScreenTabs
        active={tab}
        tabs={TABS.map((entry) => ({
          key: entry.key,
          label:
            entry.key === "messages" && unread
              ? `${entry.label} (${toPersianDigits(unread)})`
              : entry.label,
          href: `/admin/forms?tab=${entry.key}`,
        }))}
      />

      {tab === "messages" ? (
        <div className="card overflow-hidden">
          {messages.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-ink-500">پیامی دریافت نشده است.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="wp-table">
                <thead>
                  <tr>
                    <th>فرستنده</th>
                    <th className="hidden md:table-cell">موضوع</th>
                    <th className="hidden md:table-cell">تاریخ</th>
                    <th>وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.id}>
                      <td className="min-w-[240px]">
                        <div className="flex items-start gap-2">
                          {!message.read ? (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
                          ) : null}
                          <div className="min-w-0">
                            <p className="font-semibold text-ink-900">{message.name}</p>
                            <p className="text-[11px] text-ink-500">
                              <a href={`mailto:${message.email}`} dir="ltr" className="hover:text-accent">
                                {message.email}
                              </a>
                              {message.phone ? <span dir="ltr"> · {message.phone}</span> : null}
                            </p>
                            <details className="mt-1">
                              <summary className="cursor-pointer text-[11px] text-accent">
                                متن پیام
                              </summary>
                              <p className="mt-1.5 whitespace-pre-line rounded border border-line-200 bg-surface-100 p-2.5 text-[12px] leading-6 text-ink-700">
                                {message.message}
                              </p>
                            </details>
                            <div className="wp-row-actions">
                              <form action={setMessageRead} className="inline">
                                <input type="hidden" name="id" value={message.id} />
                                <input type="hidden" name="read" value={message.read ? "false" : "true"} />
                                <button type="submit" className="wp-action">
                                  {message.read ? "خوانده‌نشده" : "خوانده شد"}
                                </button>
                              </form>
                              <a href={`mailto:${message.email}`} className="wp-action">
                                پاسخ
                              </a>
                              <form action={deleteContactMessage} className="inline">
                                <input type="hidden" name="id" value={message.id} />
                                <button type="submit" className="wp-action wp-action-danger">
                                  حذف
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell">{message.subject || "—"}</td>
                      <td className="hidden whitespace-nowrap md:table-cell">
                        {formatJalaliLong(message.createdAt)}
                      </td>
                      <td>
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-[10.5px] ${
                            message.read ? "bg-surface-200 text-ink-700" : "bg-red-500 text-white"
                          }`}
                        >
                          {message.read ? "خوانده‌شده" : "جدید"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="border-t border-line-200 px-4 py-2.5 text-[11.5px] text-ink-500">
            {toPersianDigits(messages.length)} پیام · {toPersianDigits(unread)} خوانده‌نشده
          </div>
        </div>
      ) : null}

      {tab === "applications" ? (
        <div className="card overflow-hidden">
          {applications.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-ink-500">درخواستی ثبت نشده است.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="wp-table">
                <thead>
                  <tr>
                    <th>متقاضی</th>
                    <th className="hidden md:table-cell">موقعیت</th>
                    <th className="hidden md:table-cell">تاریخ</th>
                    <th>وضعیت</th>
                    <th>رزومه</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td className="min-w-[220px]">
                        <p className="font-semibold text-ink-900">{application.name}</p>
                        <p className="text-[11px] text-ink-500" dir="ltr">
                          {application.email} · {application.phone}
                        </p>
                        {application.coverLetter ? (
                          <details className="mt-1">
                            <summary className="cursor-pointer text-[11px] text-accent">متن درخواست</summary>
                            <p className="mt-1.5 whitespace-pre-line rounded border border-line-200 bg-surface-100 p-2.5 text-[12px] leading-6">
                              {application.coverLetter}
                            </p>
                          </details>
                        ) : null}
                        <div className="wp-row-actions">
                          <form action={deleteApplication} className="inline">
                            <input type="hidden" name="id" value={application.id} />
                            <button type="submit" className="wp-action wp-action-danger">
                              حذف
                            </button>
                          </form>
                        </div>
                      </td>
                      <td className="hidden md:table-cell">{application.position}</td>
                      <td className="hidden whitespace-nowrap md:table-cell">
                        {formatJalaliLong(application.createdAt)}
                      </td>
                      <td>
                        <form action={setApplicationStatus} className="flex items-center gap-1.5">
                          <input type="hidden" name="id" value={application.id} />
                          <label htmlFor={`status-${application.id}`} className="sr-only">
                            وضعیت
                          </label>
                          <select
                            id={`status-${application.id}`}
                            name="status"
                            defaultValue={application.status}
                            className="input w-auto py-1 text-[11.5px]"
                          >
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <button type="submit" className="wp-action">
                            ذخیره
                          </button>
                        </form>
                      </td>
                      <td>
                        {application.resumePath ? (
                          <Link
                            href={`/api/admin/resume/${application.id}`}
                            className="inline-flex items-center gap-1 text-[11.5px] text-accent hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" aria-hidden />
                            دانلود
                          </Link>
                        ) : (
                          <span className="text-[11px] text-ink-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="border-t border-line-200 px-4 py-2.5 text-[11.5px] text-ink-500">
            {toPersianDigits(applications.length)} درخواست
          </div>
        </div>
      ) : null}

      {tab === "subscribers" ? (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line-200 px-4 py-2.5">
            <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-700">
              <Mail className="h-4 w-4 text-ink-400" aria-hidden />
              {toPersianDigits(subscribers.length)} عضو
            </span>
            <span className="text-[11px] text-ink-500">فقط ایمیل‌هایی که رضایت داده‌اند.</span>
          </div>
          {subscribers.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-ink-500">عضوی ثبت نشده است.</p>
          ) : (
            <ul className="divide-y divide-line-200">
              {subscribers.map((subscriber) => (
                <li key={subscriber.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] text-ink-900" dir="ltr">
                      {subscriber.email}
                    </p>
                    <p className="text-[10.5px] text-ink-500">{formatJalaliLong(subscriber.createdAt)}</p>
                  </div>
                  <form action={deleteSubscriber}>
                    <input type="hidden" name="id" value={subscriber.id} />
                    <button type="submit" className="wp-action wp-action-danger" aria-label="حذف">
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
