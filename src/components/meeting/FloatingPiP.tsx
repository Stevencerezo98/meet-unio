import { useRef, useEffect } from "react";
import { Maximize2, X, Mic, MicOff, Video, VideoOff, Tv } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import type { ParticipantInfo } from "./ParticipantTile";

interface FloatingPiPProps {
  open: boolean;
  onClose: () => void;
  onExpand: () => void;
  participant?: ParticipantInfo;
  micOn: boolean;
  onToggleMic: () => void;
  webcamOn: boolean;
  onToggleWebcam: () => void;
  roomId?: string;
}

export default function FloatingPiP({
  open,
  onClose,
  onExpand,
  participant,
  micOn,
  onToggleMic,
  webcamOn,
  onToggleWebcam,
  roomId,
}: FloatingPiPProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (open && participant?.webcamOn && participant.videoTrack && videoRef.current) {
      const stream = new MediaStream([participant.videoTrack]);
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [open, participant?.webcamOn, participant?.videoTrack]);

  if (!open || !participant) return null;

  return (
    <aside
      aria-label="Picture in Picture Floating View"
      className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 flex w-72 sm:w-80 flex-col overflow-hidden rounded-2xl bg-portal-card border border-portal-border shadow-2xl ring-1 ring-black/10 select-none animate-in slide-in-from-bottom-5 duration-200"
    >
      {/* Header with Title and Window Controls */}
      <div className="flex h-9 items-center justify-between px-3 bg-portal-bg border-b border-portal-border">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
          <Tv className="h-3.5 w-3.5 text-zoom-blue" />
          <span>Zoom PiP</span>
          {roomId && <span className="text-[10px] text-text-secondary font-mono">({roomId})</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onExpand}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
            title="Expand to Full View"
            aria-label="Expand"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
            title="Close PiP"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Video Content */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        {participant.webcamOn ? (
          participant.videoTrack ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={participant.isLocal}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar
                name={participant.name}
                color={participant.color || "#2d8cff"}
                size={56}
                className="ring-2 ring-white/20"
              />
            </div>
          )
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <Avatar
              name={participant.name}
              color={participant.color || "#2d8cff"}
              size={56}
              className="ring-2 ring-white/10"
            />
          </div>
        )}

        {/* Participant Name Badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 backdrop-blur-sm px-2 py-0.5 text-[11px] font-medium text-white">
          <span>{participant.name}</span>
          {participant.isSpeaking && (
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
          )}
        </div>
      </div>

      {/* Mini Controls Bar */}
      <div className="flex items-center justify-around px-3 py-2 bg-portal-card border-t border-portal-border">
        <button
          onClick={onToggleMic}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
            micOn
              ? "bg-portal-bg hover:bg-hover text-text-primary"
              : "bg-leave text-white"
          }`}
          title={micOn ? "Mute" : "Unmute"}
          aria-label={micOn ? "Mute" : "Unmute"}
        >
          {micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
        </button>

        <button
          onClick={onToggleWebcam}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
            webcamOn
              ? "bg-portal-bg hover:bg-hover text-text-primary"
              : "bg-leave text-white"
          }`}
          title={webcamOn ? "Stop Video" : "Start Video"}
          aria-label={webcamOn ? "Stop Video" : "Start Video"}
        >
          {webcamOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
        </button>

        <button
          onClick={onExpand}
          className="flex items-center gap-1 rounded-lg bg-zoom-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-zoom-blue-hover transition-colors"
        >
          <span>Volver</span>
        </button>
      </div>
    </aside>
  );
}
