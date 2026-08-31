import { useState } from "react";
import { Check, Lock, Users, EyeOff } from "lucide-react";

interface SecurityMenuProps {
  open: boolean;
  onClose: () => void;
  isLocked: boolean;
  onToggleLock: () => void;
  waitingRoom: boolean;
  onToggleWaitingRoom: () => void;
}

export default function SecurityMenu({
  open,
  onClose,
  isLocked,
  onToggleLock,
  waitingRoom,
  onToggleWaitingRoom,
}: SecurityMenuProps) {
  const [hideProfilePics, setHideProfilePics] = useState(false);
  const [allowShare, setAllowShare] = useState(true);
  const [allowChat, setAllowChat] = useState(true);
  const [allowRename, setAllowRename] = useState(true);
  const [allowUnmute, setAllowUnmute] = useState(true);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-20 left-12 sm:left-24 z-50 w-64 rounded-xl bg-portal-card p-2 shadow-2xl ring-1 ring-portal-border text-text-primary text-xs select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
          Controles de seguridad
        </div>

        {/* Lock meeting */}
        <button
          onClick={onToggleLock}
          className="flex w-full items-center justify-between px-3 py-2 rounded-lg hover:bg-hover text-left transition-colors"
        >
          <div className="flex items-center gap-2 text-text-primary">
            <Lock className="h-3.5 w-3.5 text-text-secondary" />
            <span>Bloquear reunión</span>
          </div>
          {isLocked && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
        </button>

        {/* Enable waiting room */}
        <button
          onClick={onToggleWaitingRoom}
          className="flex w-full items-center justify-between px-3 py-2 rounded-lg hover:bg-hover text-left transition-colors"
        >
          <div className="flex items-center gap-2 text-text-primary">
            <Users className="h-3.5 w-3.5 text-text-secondary" />
            <span>Habilitar sala de espera</span>
          </div>
          {waitingRoom && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
        </button>

        {/* Hide Profile Pictures */}
        <button
          onClick={() => setHideProfilePics(!hideProfilePics)}
          className="flex w-full items-center justify-between px-3 py-2 rounded-lg hover:bg-hover text-left transition-colors"
        >
          <div className="flex items-center gap-2 text-text-primary">
            <EyeOff className="h-3.5 w-3.5 text-text-secondary" />
            <span>Ocultar fotos de perfil</span>
          </div>
          {hideProfilePics && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
        </button>

        <div className="my-1.5 border-t border-portal-border" />

        <div className="px-3 py-1 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
          Permitir que los participantes:
        </div>

        <button
          onClick={() => setAllowShare(!allowShare)}
          className="flex w-full items-center justify-between px-3 py-1.5 rounded-lg hover:bg-hover text-left transition-colors text-text-primary"
        >
          <span>Compartan pantalla</span>
          {allowShare && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
        </button>

        <button
          onClick={() => setAllowChat(!allowChat)}
          className="flex w-full items-center justify-between px-3 py-1.5 rounded-lg hover:bg-hover text-left transition-colors text-text-primary"
        >
          <span>Chateen</span>
          {allowChat && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
        </button>

        <button
          onClick={() => setAllowRename(!allowRename)}
          className="flex w-full items-center justify-between px-3 py-1.5 rounded-lg hover:bg-hover text-left transition-colors text-text-primary"
        >
          <span>Cambien su nombre</span>
          {allowRename && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
        </button>

        <button
          onClick={() => setAllowUnmute(!allowUnmute)}
          className="flex w-full items-center justify-between px-3 py-1.5 rounded-lg hover:bg-hover text-left transition-colors text-text-primary"
        >
          <span>Reactiven su micrófono</span>
          {allowUnmute && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
        </button>
      </div>
    </>
  );
}
