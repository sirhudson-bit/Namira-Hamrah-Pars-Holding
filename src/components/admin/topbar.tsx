import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { logoutAction } from "@/server/auth-actions";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { SessionUser } from "@/server/auth";

export function AdminTopbar({ user }: { user: SessionUser }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line-200 bg-surface-50/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-sm font-bold text-white">
          {user.name.charAt(0)}
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-ink-900">{user.name}</p>
          <p className="text-xs text-ink-500" dir="ltr">
            {user.email}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/"
          target="_blank"
          className="btn-ghost hidden sm:inline-flex"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          مشاهده سایت
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="btn-secondary">
            <LogOut className="h-4 w-4" aria-hidden />
            خروج
          </button>
        </form>
      </div>
    </header>
  );
}
