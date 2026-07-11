"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeSwitcher } from "./theme-switcher"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "D" },
  { href: "/trainer", label: "Trainer", icon: "T" },
  { href: "/solver", label: "Solver", icon: "S" },
  { href: "/review", label: "Review", icon: "R" },
  { href: "/drills", label: "Drills", icon: "D" },
  { href: "/leaderboard", label: "Leaderboard", icon: "L" },
  { href: "/settings", label: "Settings", icon: "G" },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
          M
        </div>
        <span className="text-lg font-semibold tracking-tight">MORF</span>
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          Beta
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold">
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <ThemeSwitcher />
      </div>
    </aside>
  )
}
