import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: "سیاست حریم خصوصی هلدینگ نامیرا همراه پارس.",
};

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />;
}
