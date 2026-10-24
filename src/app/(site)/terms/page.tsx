import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "قوانین و مقررات",
  description: "قوانین و مقررات استفاده از وب‌سایت هلدینگ نامیرا همراه پارس.",
};

export default function TermsPage() {
  return <LegalPage slug="terms" />;
}
