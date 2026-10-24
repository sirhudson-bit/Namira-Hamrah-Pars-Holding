"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

/** Header control that flips between the light and dark palettes. */
export function ThemeToggle({
  className,
  withLabel = false,
}: {
  className?: string;
  withLabel?: boolean;
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme !== "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تیره"}
      aria-pressed={isDark}
      title={isDark ? "حالت روشن" : "حالت تیره"}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line-200 px-3 text-ink-700 transition-colors hover:bg-surface-100 hover:text-accent",
        withLabel ? "w-full" : "w-11",
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" aria-hidden />
      ) : (
        <Moon className="h-[18px] w-[18px]" aria-hidden />
      )}
      {withLabel ? (
        <span className="text-[13px] font-medium">
          {isDark ? "حالت روشن" : "حالت تیره"}
        </span>
      ) : null}
    </button>
  );
}
