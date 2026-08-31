import type { ReactNode } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/cn";

interface ControlBarButtonProps {
  icon: ReactNode;
  label: string;
  badge?: number | string;
  active?: boolean;
  alert?: boolean;
  accentColor?: string;
  hasChevron?: boolean;
  onClick?: () => void;
  onChevronClick?: () => void;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export default function ControlBarButton({
  icon,
  label,
  badge,
  active,
  alert,
  accentColor,
  hasChevron,
  onClick,
  onChevronClick,
  className,
  disabled,
  id,
}: ControlBarButtonProps) {
  return (
    <div
      id={id}
      className={cn(
        "group relative flex items-center h-[52px] rounded-lg transition-colors select-none text-text-primary",
        disabled && "opacity-40 pointer-events-none",
        className
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        className={cn(
          "flex flex-col items-center justify-center h-full px-2.5 min-w-[56px] rounded-lg transition-colors hover:bg-hover active:bg-hover/80",
          active && "text-zoom-blue",
          alert && "text-leave",
          hasChevron && "rounded-r-none pr-1"
        )}
      >
        <div className="relative flex items-center justify-center h-6 w-6">
          <div
            className="flex items-center justify-center text-current"
            style={accentColor ? { color: accentColor } : undefined}
          >
            {icon}
          </div>
          {badge !== undefined && (
            <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zoom-blue px-1 text-[10px] font-semibold text-white leading-none shadow-sm">
              {badge}
            </span>
          )}
        </div>
        <span
          className={cn(
            "mt-1 text-[11px] font-normal tracking-tight text-text-secondary group-hover:text-text-primary transition-colors whitespace-nowrap",
            alert && "text-leave group-hover:text-leave"
          )}
        >
          {label}
        </span>
      </button>

      {hasChevron && (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onChevronClick?.();
          }}
          aria-label={`${label} options`}
          className="flex h-full items-center justify-center px-1 rounded-r-lg hover:bg-hover active:bg-hover/80 text-text-secondary hover:text-text-primary transition-colors border-l border-panel-border/30"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
