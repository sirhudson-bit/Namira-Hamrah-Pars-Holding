import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/site/forms";
import { getChrome } from "@/server/chrome";

export async function NewsletterBand() {
  const { labels } = await getChrome();
  return (
    <section aria-label={labels.newsletterTag} className="border-t border-line-200 bg-surface-50">
      <div className="container grid gap-8 py-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <span className="eyebrow">
            <Mail className="h-4 w-4" aria-hidden />
            {labels.newsletterTag}
          </span>
          <h2 className="heading-3">{labels.newsletterTitle}</h2>
          <p className="mt-2 text-sm leading-7 text-ink-500">{labels.newsletterLead}</p>
        </div>
        <NewsletterForm
          labels={{
            join: labels.newsletterJoin,
            consentPrefix: labels.newsletterConsentPrefix,
            consentSuffix: labels.newsletterConsentSuffix,
            privacy: labels.privacy,
          }}
        />
      </div>
    </section>
  );
}
