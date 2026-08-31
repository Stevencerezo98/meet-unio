import { useState } from "react";
import { X, Plus, Users, Play, Square } from "lucide-react";
import type { ParticipantInfo } from "./ParticipantTile";

interface BreakoutRoomsModalProps {
  open: boolean;
  onClose: () => void;
  participants: ParticipantInfo[];
}

export default function BreakoutRoomsModal({
  open,
  onClose,
  participants,
}: BreakoutRoomsModalProps) {
  const [rooms, setRooms] = useState([
    { id: "r1", name: "Sala 1", participants: [] as string[] },
    { id: "r2", name: "Sala 2", participants: [] as string[] },
  ]);
  const [isOpen, setIsOpen] = useState(false);

  if (!open) return null;

  const handleAddRoom = () => {
    setRooms((prev) => [
      ...prev,
      { id: `r${prev.length + 1}`, name: `Sala ${prev.length + 1}`, participants: [] },
    ]);
  };

  const handleToggleRooms = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-[#242424] text-white shadow-2xl ring-1 ring-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-6 border-b border-white/10 bg-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-zoom-blue" />
            <h2 className="text-base font-semibold text-white">Salas para grupos pequeños</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-gray-300">
            Dividir a los {participants.length} participantes en grupos de discusión más pequeños:
          </p>

          <div className="space-y-3">
            {rooms.map((room, i) => (
              <div
                key={room.id}
                className="flex items-center justify-between rounded-xl bg-[#1a1a1a] p-3.5 border border-white/5"
              >
                <div>
                  <h4 className="text-sm font-medium text-white">{room.name}</h4>
                  <span className="text-[11px] text-gray-400">
                    {i === 0
                      ? `${Math.ceil(participants.length / 2)} participantes asignados`
                      : `${Math.floor(participants.length / 2)} participantes asignados`}
                  </span>
                </div>
                <button className="text-xs text-zoom-blue hover:text-zoom-blue-hover font-medium">
                  Asignar
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddRoom}
            className="flex items-center gap-1.5 text-xs text-zoom-blue hover:text-zoom-blue-hover font-medium pt-1"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar una sala</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-[#1f1f1f]">
          <span className="text-[11px] text-gray-400">
            {isOpen ? "Las salas están abiertas" : "Las salas están cerradas"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
            >
              Cerrar
            </button>
            <button
              onClick={handleToggleRooms}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-colors ${
                isOpen
                  ? "bg-leave hover:bg-leave-hover"
                  : "bg-zoom-blue hover:bg-zoom-blue-hover"
              }`}
            >
              {isOpen ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-white" />
                  <span>Cerrar todas las salas</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Abrir todas las salas</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
