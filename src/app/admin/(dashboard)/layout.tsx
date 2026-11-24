import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { AdminBar } from "@/components/admin/wp/admin-bar";
import { AdminSidebar } from "@/components/admin/wp/sidebar";
import { ensureMenus } from "@/server/menus";

export const metadata: Metadata = {
  title: { default: "پیشخوان", template: "%s | پیشخوان نامیرا" },
  robots: { index: false, follow: false },
};

/**
 * Dashboard shell: admin bar, WordPress-style sidebar, content column.
 *
 * `.admin-shell` carries its own light token set, so the panel keeps the
 * paper-white data look even when the public site is in dark mode — the theme
 * toggle belongs to the site, not to the back office.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  // Seed the editable navigation once, so the first login makes the header and
  // footer database-backed instead of waiting for /admin/menus to be opened.
  await ensureMenus();

  return (
    <div className="admin-shell min-h-screen">
      <AdminBar user={user} />
      <div className="flex min-h-[calc(100vh-2rem)] flex-col lg:flex-row">
        <AdminSidebar user={{ name: user.name, email: user.email }} />
        <main className="min-w-0 flex-1 px-3 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
