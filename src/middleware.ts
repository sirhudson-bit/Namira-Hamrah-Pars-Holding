import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "namira_admin";

/**
 * Edge guard for the admin area. It only checks that a session cookie is
 * present — a fast, cheap redirect for anonymous visitors. The authoritative
 * check (session exists, is unexpired, belongs to a real user) happens in the
 * admin layout via requireAdmin(), which can reach the database.
 *
 * There is deliberately no "signed-in cookie → skip the login page" rule here:
 * a revoked or expired cookie would bounce /admin/login → /admin/dashboard →
 * /admin/login forever, because only the database can tell a live session from
 * a stale one. The login page performs that check itself.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminArea = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login";
  const hasCookie = Boolean(request.cookies.get(COOKIE_NAME)?.value);

  if (isAdminArea && !isLogin && !hasCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
