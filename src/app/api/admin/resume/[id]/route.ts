import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/server/db";
import { getCurrentUser } from "@/server/auth";

export const dynamic = "force-dynamic";

/** Streams a stored resume. Files live outside public/ and are auth-gated. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const application = await prisma.jobApplication.findUnique({ where: { id } });
  if (!application?.resumePath) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    const abs = path.join(process.cwd(), application.resumePath);
    const data = await readFile(abs);
    const ext = application.resumePath.split(".").pop()?.toLowerCase() ?? "pdf";
    const mime =
      ext === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="resume-${application.id}.${ext}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "file missing" }, { status: 404 });
  }
}
