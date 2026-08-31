import { Sun, Moon, Laptop } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);

  const cycleTheme = () => {
    if (themeMode === "system") {
      setThemeMode("light");
    } else if (themeMode === "light") {
      setThemeMode("dark");
    } else {
      setThemeMode("system");
    }
  };

  const getIcon = () => {
    if (themeMode === "system") {
      return <Laptop className="h-4 w-4 text-zoom-blue" />;
    }
    if (themeMode === "light") {
      return <Sun className="h-4 w-4 text-amber-500" />;
    }
    return <Moon className="h-4 w-4 text-indigo-400" />;
  };

  const getLabel = () => {
    if (themeMode === "system") return "Auto";
    if (themeMode === "light") return "Claro";
    return "Oscuro";
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-portal-border bg-portal-card px-2.5 py-1 text-xs font-medium text-text-primary hover:bg-hover transition-colors select-none",
        className
      )}
      title={`Tema actual: ${themeMode} (${resolvedTheme}). Clic para cambiar.`}
      aria-label="Cambiar modo de tema"
    >
      {getIcon()}
      {showLabel && <span className="hidden sm:inline">{getLabel()}</span>}
    </button>
  );
}
