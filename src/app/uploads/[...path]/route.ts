import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Serves files under `public/uploads/`.
 *
 * Why this exists: `next start` only serves the public files that existed at
 * build time. Anything written at runtime (uploaded logos, favicons, media)
 * 404s from the static handler, which made the logo/favicon appear "not to
 * update after saving". Routing the request through here reads from disk, so
 * runtime uploads work in production.
 */

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  // Resolve inside the uploads root; anything escaping it is a 404.
  const absolute = path.resolve(UPLOADS_ROOT, ...segments);
  if (absolute !== UPLOADS_ROOT && !absolute.startsWith(UPLOADS_ROOT + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = MIME[path.extname(absolute).toLowerCase()];
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await readFile(absolute);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        // Filenames are UUIDs, so a file's content never changes under a URL.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        // An SVG can carry script; sandbox it when opened directly.
        ...(contentType === "image/svg+xml"
          ? {
              "Content-Security-Policy":
                "default-src 'none'; style-src 'unsafe-inline'; sandbox",
            }
          : {}),
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
