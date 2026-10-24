import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getCurrentUser } from "@/server/auth";

export const dynamic = "force-dynamic";

/**
 * CSV export for the admin inbox. CSV (UTF-8 with BOM) is chosen over a binary
 * XLSX because it opens directly in Excel and needs no extra dependency.
 */
function toCsv(rows: (string | number | boolean | null)[][]): string {
  const escape = (value: string | number | boolean | null) => {
    const s = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "\uFEFF" + rows.map((r) => r.map(escape).join(",")).join("\r\n");
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const type = new URL(request.url).searchParams.get("type") ?? "messages";

  if (type === "applications") {
    const apps = await prisma.jobApplication.findMany({ orderBy: { createdAt: "desc" } });
    const rows: (string | number | boolean | null)[][] = [
      ["نام", "ایمیل", "تلفن", "موقعیت", "وضعیت", "رزومه", "تاریخ میلادی"],
      ...apps.map((a) => [
        a.name,
        a.email,
        a.phone,
        a.position,
        a.status,
        a.resumeName ?? "",
        a.createdAt.toISOString(),
      ]),
    ];
    return new NextResponse(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="applications.csv"',
      },
    });
  }

  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  const rows: (string | number | boolean | null)[][] = [
    ["نام", "ایمیل", "تلفن", "موضوع", "پیام", "خوانده‌شده", "تاریخ میلادی"],
    ...messages.map((m) => [
      m.name,
      m.email,
      m.phone ?? "",
      m.subject ?? "",
      m.message,
      m.read,
      m.createdAt.toISOString(),
    ]),
  ];
  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="messages.csv"',
    },
  });
}
