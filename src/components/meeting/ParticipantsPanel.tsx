import { useState } from "react";
import { X, Search, Mic, MicOff, Video, VideoOff, MoreHorizontal, UserPlus, VolumeX } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import type { ParticipantInfo } from "./ParticipantTile";

interface ParticipantsPanelProps {
  open: boolean;
  onClose: () => void;
  participants: ParticipantInfo[];
  isHost: boolean;
  onMuteParticipant?: (id: string) => void;
  onMuteAll?: () => void;
  onInvite?: () => void;
}

export default function ParticipantsPanel({
  open,
  onClose,
  participants,
  isHost,
  onMuteParticipant,
  onMuteAll,
  onInvite,
}: ParticipantsPanelProps) {
  const [search, setSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  if (!open) return null;

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full w-full sm:w-[340px] flex-col border-l border-panel-border bg-portal-card text-text-primary shadow-2xl z-30 select-none animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex h-12 items-center justify-between px-4 border-b border-panel-border">
        <h2 className="text-sm font-semibold text-text-primary">
          Participantes ({participants.length})
        </h2>
        <button
          onClick={onClose}
          aria-label="Cerrar panel"
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search box */}
      <div className="p-3 border-b border-panel-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar participante"
            className="w-full rounded-md bg-portal-bg pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder-text-secondary outline-none border border-portal-border focus:border-zoom-blue"
          />
        </div>
      </div>

      {/* Participants list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="group relative flex items-center justify-between rounded-lg p-2 hover:bg-hover transition-colors"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Avatar
                name={p.name}
                color={p.color || "#3b6ea5"}
                size={32}
                className="shrink-0 text-xs font-semibold"
              />
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-text-primary truncate max-w-[140px]">
                    {p.name}
                  </span>
                  {p.isLocal && (
                    <span className="text-[10px] text-text-secondary font-normal">(Yo)</span>
                  )}
                  {p.isHost && (
                    <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-1 rounded">
                      Anfitrión
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status icons or hover controls */}
            <div className="flex items-center gap-2">
              {p.handRaised && <span className="text-sm">✋</span>}

              {p.micOn ? (
                <Mic className="h-4 w-4 text-text-secondary" />
              ) : (
                <MicOff className="h-4 w-4 text-leave" />
              )}

              {p.webcamOn ? (
                <Video className="h-4 w-4 text-text-secondary" />
              ) : (
                <VideoOff className="h-4 w-4 text-leave" />
              )}

              {isHost && !p.isLocal && (
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveMenuId(activeMenuId === p.id ? null : p.id)
                    }
                    className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded hover:bg-hover text-text-secondary hover:text-text-primary transition-opacity"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>

                  {activeMenuId === p.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setActiveMenuId(null)}
                      />
                      <div className="absolute right-0 top-7 z-50 w-44 rounded-lg bg-portal-card p-1 text-xs shadow-xl ring-1 ring-portal-border text-text-primary">
                        <button
                          onClick={() => {
                            onMuteParticipant?.(p.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-hover transition-colors"
                        >
                          {p.micOn ? "Silenciar" : "Solicitar reactivar audio"}
                        </button>
                        <button
                          onClick={() => setActiveMenuId(null)}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-hover transition-colors"
                        >
                          Hacer anfitrión
                        </button>
                        <button
                          onClick={() => setActiveMenuId(null)}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-hover text-leave transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action Buttons (Zoom style: Invite, Mute All) */}
      <div className="p-3 border-t border-panel-border bg-portal-card flex items-center justify-between gap-2">
        <button
          onClick={onInvite}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-hover hover:bg-hover/80 py-2 text-xs font-medium text-text-primary transition-colors border border-panel-border"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Invitar</span>
        </button>

        {isHost && (
          <button
            onClick={onMuteAll}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-hover hover:bg-hover/80 py-2 text-xs font-medium text-text-primary transition-colors border border-panel-border"
          >
            <VolumeX className="h-3.5 w-3.5" />
            <span>Silenciar a todos</span>
          </button>
        )}
      </div>
    </div>
  );
}
