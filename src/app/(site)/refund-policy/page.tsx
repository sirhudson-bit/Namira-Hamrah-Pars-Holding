import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "شرایط بازگشت پول",
  description: "شرایط بازگشت پول در فروشگاه‌های هلدینگ نامیرا همراه پارس.",
};

export default function RefundPolicyPage() {
  return <LegalPage slug="refund-policy" />;
}
