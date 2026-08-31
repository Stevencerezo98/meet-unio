import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "system" | "light" | "dark";

interface ThemeState {
  themeMode: ThemeMode;
  resolvedTheme: "light" | "dark";
  autoPipEnabled: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setAutoPipEnabled: (enabled: boolean) => void;
  initTheme: () => void;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeToDOM(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
    root.setAttribute("data-theme", "light");
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: "system",
      resolvedTheme: getSystemTheme(),
      autoPipEnabled: true,

      setThemeMode: (themeMode: ThemeMode) => {
        const resolvedTheme = themeMode === "system" ? getSystemTheme() : themeMode;
        applyThemeToDOM(resolvedTheme);
        set({ themeMode, resolvedTheme });
      },

      setAutoPipEnabled: (autoPipEnabled: boolean) => {
        set({ autoPipEnabled });
      },

      initTheme: () => {
        const { themeMode } = get();
        const resolvedTheme = themeMode === "system" ? getSystemTheme() : themeMode;
        applyThemeToDOM(resolvedTheme);
        set({ resolvedTheme });

        // System preference change listener
        if (typeof window !== "undefined") {
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          const listener = (e: MediaQueryListEvent) => {
            if (get().themeMode === "system") {
              const newTheme = e.matches ? "dark" : "light";
              applyThemeToDOM(newTheme);
              set({ resolvedTheme: newTheme });
            }
          };

          try {
            mediaQuery.addEventListener("change", listener);
          } catch {
            mediaQuery.addListener(listener);
          }
        }
      },
    }),
    {
      name: "zoom-theme-settings",
      partialize: (state) => ({
        themeMode: state.themeMode,
        autoPipEnabled: state.autoPipEnabled,
      }),
    }
  )
);
