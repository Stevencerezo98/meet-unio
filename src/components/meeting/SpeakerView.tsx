import ParticipantTile, { type ParticipantInfo } from "./ParticipantTile";

interface SpeakerViewProps {
  participants: ParticipantInfo[];
  activeSpeakerId?: string;
  pinnedId?: string;
  onTogglePin?: (id: string) => void;
}

export default function SpeakerView({
  participants,
  activeSpeakerId,
  pinnedId,
  onTogglePin,
}: SpeakerViewProps) {
  if (participants.length === 0) return null;

  // Determine main speaker: pinned or active speaker or first remote or local
  const mainSpeaker =
    participants.find((p) => p.id === pinnedId) ||
    participants.find((p) => p.id === activeSpeakerId && !p.isLocal) ||
    participants.find((p) => !p.isLocal) ||
    participants[0];

  const thumbnails = participants.filter((p) => p.id !== mainSpeaker.id);

  return (
    <div className="flex h-full w-full flex-col p-2 sm:p-3 overflow-hidden bg-stage gap-2">
      {/* Top Filmstrip of Participants (Zoom style) */}
      {thumbnails.length > 0 && (
        <div className="flex h-28 sm:h-32 shrink-0 items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {thumbnails.map((p) => (
            <div key={p.id} className="h-full aspect-video shrink-0">
              <ParticipantTile
                participant={p}
                isPinned={pinnedId === p.id}
                onTogglePin={onTogglePin}
                className="h-full w-full"
              />
            </div>
          ))}
        </div>
      )}

      {/* Main Dominant Speaker Stage */}
      <div className="flex flex-1 items-center justify-center min-h-0 overflow-hidden">
        <div className="h-full w-full max-w-6xl">
          <ParticipantTile
            participant={mainSpeaker}
            isPinned={pinnedId === mainSpeaker.id}
            onTogglePin={onTogglePin}
            className="h-full w-full ring-2 ring-white/10"
          />
        </div>
      </div>
    </div>
  );
}
