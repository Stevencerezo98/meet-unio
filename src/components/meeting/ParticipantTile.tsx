import { useRef, useEffect } from "react";
import { MicOff, Mic, Pin } from "lucide-react";
import { VideoTrack } from "@livekit/components-react";
import { Track, Participant } from "livekit-client";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

export interface ParticipantInfo {
  id: string;
  name: string;
  isLocal?: boolean;
  isHost?: boolean;
  micOn: boolean;
  webcamOn: boolean;
  handRaised?: boolean;
  reaction?: string;
  isSpeaking?: boolean;
  color?: string;
  videoTrack?: MediaStreamTrack | null;
  participantLK?: Participant; // Instancia nativa de LiveKit
}

interface ParticipantTileProps {
  participant: ParticipantInfo;
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
  className?: string;
}

export default function ParticipantTile({
  participant,
  isPinned,
  onTogglePin,
  className,
}: ParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fallback de VideoTrack usando MediaStream (por si no se pasa participantLK)
  useEffect(() => {
    if (
      !participant.participantLK &&
      participant.webcamOn &&
      participant.videoTrack &&
      videoRef.current
    ) {
      const stream = new MediaStream([participant.videoTrack]);
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [participant.webcamOn, participant.videoTrack, participant.participantLK]);

  const avatarColor = participant.color || "#3b6ea5";

  return (
    <div
      className={cn(
        "group relative flex items-center justify-center overflow-hidden rounded-xl bg-tile border border-panel-border shadow-sm transition-all select-none",
        participant.isSpeaking
          ? "ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.35)]"
          : "",
        className
      )}
    >
      {/* Video stream or Avatar fallback */}
      {participant.webcamOn ? (
        <div className="relative h-full w-full bg-black">
          {/* Si tenemos el objeto de LiveKit, usamos VideoTrack oficial de la librería */}
          {participant.participantLK ? (
            <VideoTrack
              participant={participant.participantLK}
              source={Track.Source.Camera}
              className="h-full w-full object-cover"
            />
          ) : participant.videoTrack ? (
            /* Fallback con elemento HTMLVideo tradicional */
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={participant.isLocal}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center">
              <Avatar
                name={participant.name}
                color={avatarColor}
                size={84}
                className="ring-4 ring-white/10 shadow-lg"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-tile">
          <Avatar
            name={participant.name}
            color={avatarColor}
            size={88}
            className="ring-4 ring-portal-border transition-transform group-hover:scale-105 shadow-md"
          />
        </div>
      )}

      {/* Floating Reaction Overlay (Top Right) */}
      {participant.reaction && (
        <div className="absolute top-3 right-3 flex items-center justify-center h-10 w-10 rounded-full bg-black/70 backdrop-blur-md text-2xl shadow-lg ring-1 ring-white/20 animate-bounce z-10">
          {participant.reaction}
        </div>
      )}

      {/* Raised Hand Badge (Top Left) */}
      {participant.handRaised && (
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-black shadow-lg z-10">
          <span>✋</span>
          <span className="hidden sm:inline">Hand Raised</span>
        </div>
      )}

      {/* Pin / Action button on hover */}
      {onTogglePin && (
        <button
          onClick={() => onTogglePin(participant.id)}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 hover:bg-black/80 text-white transition-opacity z-10"
          title={isPinned ? "Unpin video" : "Pin video"}
        >
          <Pin className={cn("h-3.5 w-3.5", isPinned && "text-zoom-blue fill-zoom-blue")} />
        </button>
      )}

      {/* Bottom-left Name Pill (Zoom authentic look) */}
      <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white shadow-md ring-1 ring-white/10">
        {participant.micOn ? (
          <span className="flex items-center text-emerald-400">
            <Mic className="h-3 w-3" />
          </span>
        ) : (
          <span className="flex items-center text-leave">
            <MicOff className="h-3 w-3 text-leave" />
          </span>
        )}
        <span className="truncate max-w-[140px] text-gray-100">
          {participant.name}
          {participant.isLocal && " (Me)"}
          {participant.isHost && !participant.isLocal && " (Host)"}
        </span>
      </div>
    </div>
  );
}