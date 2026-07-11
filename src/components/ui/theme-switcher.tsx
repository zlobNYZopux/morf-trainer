"use client"

import { useTheme, type ColorProfile, type Mode } from "@/lib/theme"
import { cn } from "@/lib/utils"

const COLOR_PROFILES: { id: ColorProfile; label: string; color: string }[] = [
  { id: "indigo", label: "Indigo", color: "#6366f1" },
  { id: "graphite", label: "Graphite", color: "#d4af37" },
  { id: "emerald", label: "Emerald", color: "#10b981" },
  { id: "amber", label: "Amber", color: "#f59e0b" },
  { id: "rose", label: "Rose", color: "#f43f5e" },
  { id: "cyan", label: "Cyan", color: "#06b6d4" },
]

const MODES: { id: Mode; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
]

export function ThemeSwitcher() {
  const { colorProfile, mode, setColorProfile, setMode } = useTheme()

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Color
        </p>
        <div className="flex flex-wrap gap-1.5">
          {COLOR_PROFILES.map((p) => (
            <button
              key={p.id}
              onClick={() => setColorProfile(p.id)}
              title={p.label}
              className={cn(
                "h-6 w-6 rounded-full border-2 transition-all",
                colorProfile === p.id
                  ? "scale-110 border-foreground shadow-sm"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
              style={{ backgroundColor: p.color }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Mode
        </p>
        <div className="flex gap-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                mode === m.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
