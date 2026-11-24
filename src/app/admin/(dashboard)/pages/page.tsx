import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Copy, Home, Plus } from "lucide-react";
import { prisma } from "@/server/db";
import { savePage, deletePage, duplicatePage } from "@/server/admin-actions";
import { RecordForm } from "@/components/admin/record-form";
import { formatJalaliLong } from "@/lib/format";
import { ScreenHeader, ListTable, SearchBox, CountLinks } from "@/components/admin/wp/screen";
import { InlineDelete } from "@/components/admin/wp/inline-delete";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "برگه‌ها" };

const SYSTEM_SLUGS = new Set([
  "about",
  "business-groups",
  "stores",
  "innovation",
  "services",
  "units",
  "media",
  "contact",
  "careers",
  "privacy",
  "terms",
  "cookie-policy",
  "refund-policy",
]);

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; s?: string; kind?: string }>;
}) {
  const params = await searchParams;
  const isNew = params.new === "1";
  const search = (params.s ?? "").trim();
  const kind = params.kind === "system" || params.kind === "custom" ? params.kind : "";

  const pages = await prisma.page.findMany({
    where: {
      ...(search ? { OR: [{ title: { contains: search } }, { slug: { contains: search } }] } : {}),
      ...(kind === "system"
        ? { slug: { in: Array.from(SYSTEM_SLUGS) } }
        : kind === "custom"
          ? { slug: { notIn: Array.from(SYSTEM_SLUGS) } }
          : {}),
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  const all = await prisma.page.findMany({ select: { slug: true } });
  const systemCount = all.filter((page) => SYSTEM_SLUGS.has(page.slug)).length;
  const customCount = all.length - systemCount;
  const listHref = "/admin/pages";

  return (
    <div>
      <ScreenHeader
        title={isNew ? "برگه جدید" : "برگه‌ها"}
        description={
          isNew
            ? "عنوان و نشانی برگه را انتخاب کنید؛ سپس متن و ابزارک‌ها را کامل می‌کنید."
            : "برگه‌های ثابت سایت و برگه‌های سفارشی. هر برگه متن، تصویر شاخص، سئو و ابزارک دارد."
        }
        breadcrumb={isNew ? [{ label: "برگه‌ها", href: listHref }, { label: "برگه جدید" }] : [{ label: "برگه‌ها" }]}
        action={
          isNew ? (
            <Link href={listHref} className="btn-secondary">
              <ArrowRight className="h-4 w-4" aria-hidden />
              بازگشت به فهرست
            </Link>
          ) : (
            <Link href={`${listHref}?new=1`} className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden />
              افزودن برگه
            </Link>
          )
        }
      />

      {isNew ? (
        <div className="mx-auto max-w-2xl">
          <div className="card p-5">
            <RecordForm
              action={savePage}
              submitLabel="ساخت برگه و ادامه ویرایش"
              columns={1}
              fields={[
                { type: "text", name: "title", label: "عنوان برگه", required: true },
                {
                  type: "text",
                  name: "slug",
                  label: "نشانی صفحه (slug)",
                  dir: "ltr",
                  required: true,
                  placeholder: "مثلاً investor-relations",
                  hint: "فقط حروف کوچک انگلیسی، رقم و خط تیره. آدرس صفحه می‌شود /investor-relations",
                },
                { type: "checkbox", name: "published", label: "انتشار فوری", defaultChecked: false },
              ]}
            />
          </div>
          <p className="mt-3 text-[11.5px] text-ink-500">
            پس از ساخت، به ویرایشگر کامل صفحه هدایت می‌شوید تا متن و ابزارک‌ها را اضافه کنید.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* The front page is not a Page row; it has its own editor. */}
          <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line-200 bg-surface-100 text-accent">
                <Home className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-ink-900">صفحه اصلی</p>
                <p className="text-[11.5px] text-ink-500">
                  هیروی صفحه اصلی، تصویر کاور، آمار و بنرها
                </p>
              </div>
            </div>
            <Link href="/admin/home" className="wp-action text-[12.5px]">
              ویرایش صفحه اصلی
            </Link>
          </div>

          <ListTable
            columns={[
              { label: "عنوان" },
              { label: "نشانی", hideOnMobile: true, width: "170px" },
              { label: "وضعیت", width: "110px" },
              { label: "آخرین ویرایش", hideOnMobile: true, width: "160px" },
            ]}
            toolbar={
              <>
                <CountLinks
                  items={[
                    { label: "همه", href: listHref, count: systemCount + customCount, active: !kind && !search },
                    { label: "صفحات اصلی و حقوقی", href: `${listHref}?kind=system`, count: systemCount, active: kind === "system" },
                    { label: "برگه‌های سفارشی", href: `${listHref}?kind=custom`, count: customCount, active: kind === "custom" },
                  ]}
                />
                <SearchBox action={listHref} value={search} hidden={kind ? { kind } : {}} />
              </>
            }
            rows={pages.map((page) => ({
              id: page.id,
              title: page.title,
              href: `/admin/pages/${page.id}`,
              externalHref: `/${page.slug}`,
              badge: SYSTEM_SLUGS.has(page.slug) ? (
                <span className="rounded bg-surface-200 px-1.5 py-0.5 text-[10px] text-ink-700">سیستمی</span>
              ) : null,
              cells: [
                null,
                <span key="slug" dir="ltr" className="text-ink-500">
                  /{page.slug}
                </span>,
                page.published ? "منتشر شده" : "پیش‌نویس",
                formatJalaliLong(page.updatedAt),
              ],
              actions: (
                <>
                  {!SYSTEM_SLUGS.has(page.slug) ? (
                    <>
                      <form action={duplicatePage} className="inline">
                        <input type="hidden" name="id" value={page.id} />
                        <button type="submit" className="wp-action">
                          <Copy className="me-0.5 inline h-3 w-3" aria-hidden />
                          کپی
                        </button>
                      </form>
                      <InlineDelete action={deletePage} id={page.id} />
                    </>
                  ) : null}
                </>
              ),
            }))}
            empty={search ? "برگه‌ای با این عنوان پیدا نشد." : "هنوز برگه‌ای ساخته نشده است."}
          />
        </div>
      )}
    </div>
  );
}
