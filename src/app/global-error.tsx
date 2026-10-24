"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          fontFamily: "Vazirmatn, system-ui, sans-serif",
          background: "#F7F9FB",
          color: "#22262A",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <TriangleAlert size={48} style={{ color: "#0F7C71" }} aria-hidden />
          <h1 style={{ fontSize: "1.5rem", marginTop: "1rem" }}>خطایی رخ داد</h1>
          <p style={{ color: "#6B7175", lineHeight: 2, marginTop: "0.5rem" }}>
            در پردازش درخواست شما مشکلی پیش آمد. می‌توانید دوباره تلاش کنید.
          </p>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#0F7C71",
                color: "#fff",
                border: 0,
                borderRadius: 12,
                padding: "0.7rem 1.4rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              تلاش دوباره
            </button>
            <Link
              href="/"
              style={{
                border: "1px solid #E3E7EA",
                borderRadius: 12,
                padding: "0.7rem 1.4rem",
                textDecoration: "none",
                color: "#22262A",
              }}
            >
              صفحه اصلی
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
