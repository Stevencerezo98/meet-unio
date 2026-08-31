import ParticipantTile, { type ParticipantInfo } from "./ParticipantTile";
import { cn } from "@/lib/cn";

interface VideoGridProps {
  participants: ParticipantInfo[];
  pinnedId?: string;
  onTogglePin?: (id: string) => void;
}

export default function VideoGrid({
  participants,
  pinnedId,
  onTogglePin,
}: VideoGridProps) {
  const count = participants.length;

  if (count === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-text-secondary text-sm">
        Waiting for participants to join...
      </div>
    );
  }

  // Grid layout classes based on participant count
  let gridClass = "grid-cols-1 grid-rows-1";
  if (count === 2) {
    gridClass = "grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1";
  } else if (count === 3 || count === 4) {
    gridClass = "grid-cols-2 grid-rows-2";
  } else if (count === 5 || count === 6) {
    gridClass = "grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2";
  } else if (count >= 7) {
    gridClass = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-rows-3";
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-2 sm:p-3 overflow-hidden bg-stage">
      <div
        className={cn(
          "grid h-full w-full gap-2 sm:gap-2.5 max-w-7xl max-h-[88vh] mx-auto",
          gridClass
        )}
      >
        {participants.map((p) => (
          <ParticipantTile
            key={p.id}
            participant={p}
            isPinned={pinnedId === p.id}
            onTogglePin={onTogglePin}
            className="w-full h-full min-h-[160px]"
          />
        ))}
      </div>
    </div>
  );
}
