import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/site/forms";

export function NewsletterBand() {
  return (
    <section aria-label="خبرنامه" className="border-t border-line-200 bg-surface-50">
      <div className="container grid gap-8 py-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <span className="eyebrow">
            <Mail className="h-4 w-4" aria-hidden />
            خبرنامه
          </span>
          <h2 className="heading-3">از اخبار و مقالات نامیرا باخبر شوید</h2>
          <p className="mt-2 text-sm leading-7 text-ink-500">
            ایمیل خود را وارد کنید تا اخبار هلدینگ، رویدادها و مقالات تازه برایتان ارسال شود.
          </p>
        </div>
        <NewsletterForm />
      </div>
    </section>
  );
}
