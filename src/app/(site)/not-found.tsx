import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container-prose flex flex-col items-center py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-card bg-brand-700/20 text-accent">
          <Compass className="h-8 w-8" aria-hidden />
        </span>
        <p className="mt-6 text-5xl font-extrabold text-accent">۴۰۴</p>
        <h1 className="mt-3 heading-2">صفحه‌ای که دنبالش بودید پیدا نشد</h1>
        <p className="mt-3 text-sm leading-7 text-ink-500">
          ممکن است نشانی تغییر کرده یا صفحه حذف شده باشد.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            بازگشت به صفحه اصلی
          </Link>
          <Link href="/contact" className="btn-secondary">
            تماس با ما
          </Link>
        </div>
      </div>
    </section>
  );
}
