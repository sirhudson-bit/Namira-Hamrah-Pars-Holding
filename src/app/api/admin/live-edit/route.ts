import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db";
import { getCurrentUser } from "@/server/auth";
import { BLOCK_BY_TYPE, parseBlockData } from "@/lib/blocks";

const PAGE_FIELDS = new Set(["title", "eyebrow", "subtitle"]);

/**
 * Small JSON endpoint for the on-site live editor. Only an authenticated admin
 * can call it, and only plain-text fields are writable: page hero copy and the
 * text fields of an existing page-builder widget. Images, URLs and Markdown keep
 * their dedicated admin forms, so a contenteditable element can never inject
 * markup or a script URL.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const payload = body as {
    kind?: string;
    pageSlug?: string;
    blockId?: string;
    field?: string;
    value?: string;
  };
  const pageSlug = String(payload.pageSlug ?? "").trim();
  const field = String(payload.field ?? "").trim();
  const value = String(payload.value ?? "").slice(0, 5000).trim();
  if (!pageSlug || !field) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  if (payload.kind === "page") {
    if (!PAGE_FIELDS.has(field)) return NextResponse.json({ error: "field_not_allowed" }, { status: 400 });
    const page = await prisma.page.findUnique({ where: { slug: pageSlug }, select: { id: true } });
    if (!page) return NextResponse.json({ error: "page_not_found" }, { status: 404 });
    await prisma.page.update({
      where: { id: page.id },
      data: { [field]: value || (field === "title" ? "بدون عنوان" : null) },
    });
    revalidatePath(`/${pageSlug}`);
    revalidatePath("/admin/pages");
    return NextResponse.json({ ok: true });
  }

  if (payload.kind === "block") {
    const blockId = String(payload.blockId ?? "").trim();
    if (!blockId) return NextResponse.json({ error: "missing_block" }, { status: 400 });
    const block = await prisma.pageBlock.findFirst({ where: { id: blockId, pageSlug } });
    if (!block) return NextResponse.json({ error: "block_not_found" }, { status: 404 });
    const def = BLOCK_BY_TYPE[block.type];
    const blockField = def?.fields.find((item) => item.name === field);
    // Only text-like widgets are inline-editable; images keep the picker.
    if (!blockField || (blockField.type !== "text" && blockField.type !== "textarea")) {
      return NextResponse.json({ error: "field_not_allowed" }, { status: 400 });
    }
    const data = parseBlockData(block.data);
    data[field] = value;
    await prisma.pageBlock.update({ where: { id: block.id }, data: { data: JSON.stringify(data) } });
    revalidatePath(pageSlug === "home" ? "/" : `/${pageSlug}`);
    revalidatePath("/admin/layout");
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown_kind" }, { status: 400 });
}
