"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

export type ColorProfile = "indigo" | "graphite" | "emerald" | "amber" | "rose" | "cyan"
export type Mode = "dark" | "light"

export interface ThemeState {
  colorProfile: ColorProfile
  mode: Mode
}

interface ThemeContextValue extends ThemeState {
  setColorProfile: (p: ColorProfile) => void
  setMode: (m: Mode) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = "morf-theme"

function getStoredTheme(): ThemeState {
  if (typeof window === "undefined") return { colorProfile: "indigo", mode: "dark" }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { colorProfile: "indigo", mode: "dark" }
}

function applyTheme(state: ThemeState) {
  const root = document.documentElement
  root.classList.remove("dark", "light")
  root.classList.add(state.mode)
  root.dataset.profile = state.colorProfile
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>({ colorProfile: "indigo", mode: "dark" })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = getStoredTheme()
    setTheme(stored)
    applyTheme(stored)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
      applyTheme(theme)
    }
  }, [theme, mounted])

  const setColorProfile = useCallback((colorProfile: ColorProfile) => {
    setTheme(prev => ({ ...prev, colorProfile }))
  }, [])

  const setMode = useCallback((mode: Mode) => {
    setTheme(prev => ({ ...prev, mode }))
  }, [])

  const toggleMode = useCallback(() => {
    setTheme(prev => ({ ...prev, mode: prev.mode === "dark" ? "light" : "dark" }))
  }, [])

  return (
    <ThemeContext.Provider
      value={{ ...theme, setColorProfile, setMode, toggleMode }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
