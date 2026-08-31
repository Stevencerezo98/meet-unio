import { cn } from "@/lib/cn";

interface ReactionsFlyoutProps {
  open: boolean;
  onClose: () => void;
  onSelectReaction: (emoji: string) => void;
  handRaised: boolean;
  onToggleHand: () => void;
}

const EMOJIS = [
  { emoji: "👏", label: "Aplauso" },
  { emoji: "👍", label: "Pulgar arriba" },
  { emoji: "❤️", label: "Corazón" },
  { emoji: "😂", label: "Risa" },
  { emoji: "😮", label: "Sorpresa" },
  { emoji: "🎉", label: "Celebración" },
];

export default function ReactionsFlyout({
  open,
  onClose,
  onSelectReaction,
  handRaised,
  onToggleHand,
}: ReactionsFlyoutProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-20 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-auto sm:left-auto z-50 w-72 rounded-xl bg-portal-card p-3 shadow-2xl ring-1 ring-portal-border text-text-primary animate-in fade-in slide-in-from-bottom-2 duration-150 select-none">
        {/* Emoji row */}
        <div className="flex items-center justify-between gap-1 pb-2">
          {EMOJIS.map(({ emoji, label }) => (
            <button
              key={emoji}
              onClick={() => {
                onSelectReaction(emoji);
                onClose();
              }}
              title={label}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl hover:bg-hover hover:scale-125 active:scale-95 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Raise hand button */}
        <div className="pt-2 border-t border-portal-border">
          <button
            onClick={() => {
              onToggleHand();
              onClose();
            }}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition-colors",
              handRaised
                ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border border-amber-500/30 font-semibold"
                : "bg-hover text-text-primary hover:bg-hover/80"
            )}
          >
            <span className="text-base">✋</span>
            <span>{handRaised ? "Bajar la mano" : "Levantar la mano"}</span>
          </button>
        </div>
      </div>
    </>
  );
}
