"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_CONFIG, UI_STRINGS } from "@/lib/config";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: UI_STRINGS.nav.home, icon: "🏠" },
  { href: "/explore", label: UI_STRINGS.nav.explore, icon: "🧭" },
  { href: "/review", label: UI_STRINGS.nav.review, icon: "🔁" },
  { href: "/progress", label: UI_STRINGS.nav.progress, icon: "📊" },
  { href: "/settings", label: UI_STRINGS.nav.settings, icon: "⚙️" },
] as const;

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" || pathname.startsWith("/unit/") : pathname.startsWith(href);
}

/** Barra inferior en el celular y barra lateral en PC (≥ 1024px). */
export function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label={UI_STRINGS.nav.label}
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 border-t-2 border-border bg-surface pb-[env(safe-area-inset-bottom)]",
        "lg:inset-y-0 lg:right-auto lg:left-0 lg:w-64 lg:border-t-0 lg:border-r-2 lg:pb-0",
      )}
    >
      <p className="hidden px-6 pt-8 pb-6 text-2xl font-extrabold text-primary lg:block">{APP_CONFIG.name}</p>
      <ul className="grid grid-cols-5 lg:flex lg:flex-col lg:gap-1 lg:px-3">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-bold lg:min-h-14 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-2xl lg:px-4 lg:text-lg",
                  active ? "text-primary lg:bg-primary/10" : "text-muted hover:text-foreground lg:hover:bg-background",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("rounded-full px-3 py-0.5 text-2xl lg:p-0", active && "bg-primary/15 lg:bg-transparent")}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
