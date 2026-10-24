import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "سیاست کوکی",
  description: "سیاست کوکی وب‌سایت هلدینگ نامیرا همراه پارس.",
};

export default function CookiePolicyPage() {
  return <LegalPage slug="cookie-policy" />;
}
