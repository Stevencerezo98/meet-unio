import { useState } from "react";
import { ShieldCheck, ChevronDown, Check, Copy, Maximize2, Minimize2, Tv, Settings } from "lucide-react";
import { ZGrid, ZSpeaker } from "@/components/icons/ZoomIcons";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";

interface TopBarProps {
  roomId: string;
  topic?: string;
  hostName?: string;
  viewMode: "grid" | "speaker";
  onViewModeChange: (mode: "grid" | "speaker") => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isPipActive?: boolean;
  onTogglePip?: () => void;
  onOpenSettings?: () => void;
  connectionState?: "idle" | "connecting" | "connected" | "error";
}

export default function TopBar({
  roomId,
  topic = "Zoom Meeting",
  hostName = "Host",
  viewMode,
  onViewModeChange,
  isFullscreen,
  onToggleFullscreen,
  isPipActive,
  onTogglePip,
  onOpenSettings,
  connectionState = "connected",
}: TopBarProps) {
  const [showShieldMenu, setShowShieldMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [originalSound, setOriginalSound] = useState(false);

  const inviteUrl = `${window.location.origin}/meeting/${roomId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative z-30 flex h-11 w-full items-center justify-between bg-stage px-3 md:px-4 text-text-primary select-none border-b border-panel-border/30 transition-colors duration-200">
      {/* Left controls: Green Shield + Original Sound */}
      <div className="flex items-center gap-2">
        {/* Security Shield */}
        <div className="relative">
          <button
            onClick={() => {
              setShowShieldMenu(!showShieldMenu);
              setShowViewMenu(false);
              setShowSoundMenu(false);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 transition-colors"
            title="Información de la Reunión"
            aria-label="Información de la Reunión"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </button>

          {/* Meeting Info Popover */}
          {showShieldMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowShieldMenu(false)}
              />
              <div className="absolute left-0 top-9 z-50 w-72 rounded-xl bg-portal-card p-4 text-xs shadow-2xl ring-1 ring-portal-border text-text-primary animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center gap-2 pb-3 border-b border-portal-border">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600/20 text-emerald-500">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight text-text-primary">{topic}</h3>
                    <span className="text-[11px] text-emerald-500 font-medium">
                      {connectionState === "connected"
                        ? "LiveKit WebRTC Conectado"
                        : connectionState === "connecting"
                        ? "Conectando WebRTC..."
                        : "Reunión Segura"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-2.5 text-[12px]">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">ID de Reunión:</span>
                    <span className="font-mono font-medium text-text-primary">{roomId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Anfitrión:</span>
                    <span className="font-medium text-text-primary">{hostName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Código de acceso:</span>
                    <span className="font-mono font-medium text-text-primary">884920</span>
                  </div>
                  <div className="pt-2 border-t border-portal-border">
                    <span className="block text-[11px] text-text-secondary mb-1">Enlace de invitación:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        readOnly
                        value={inviteUrl}
                        className="w-full bg-portal-bg px-2 py-1 rounded text-[11px] font-mono text-text-secondary truncate outline-none border border-portal-border"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="shrink-0 flex items-center gap-1 rounded bg-zoom-blue px-2.5 py-1 text-[11px] font-medium text-white hover:bg-zoom-blue-hover transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3" /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Original Sound Indicator */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => {
              setShowSoundMenu(!showSoundMenu);
              setShowShieldMenu(false);
              setShowViewMenu(false);
            }}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
          >
            <span>Sonido original: {originalSound ? "Activado" : "Desactivado"}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {showSoundMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSoundMenu(false)}
              />
              <div className="absolute left-0 top-9 z-50 w-60 rounded-xl bg-portal-card p-1.5 text-xs shadow-xl ring-1 ring-portal-border text-text-primary">
                <button
                  onClick={() => {
                    setOriginalSound(!originalSound);
                    setShowSoundMenu(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 rounded hover:bg-hover text-left transition-colors"
                >
                  <span>{originalSound ? "Desactivar" : "Activar"} sonido original</span>
                  {originalSound && <Check className="h-3.5 w-3.5 text-zoom-blue" />}
                </button>
                <div className="px-3 py-1.5 text-[11px] text-text-secondary border-t border-portal-border mt-1">
                  Modo de música de alta fidelidad y supresión de ruido
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center: Meeting Title */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none hidden md:flex items-center gap-2">
        <span className="text-[13px] font-medium text-text-primary truncate max-w-xs">{topic}</span>
        <span className="text-[11px] text-text-secondary font-mono">({roomId})</span>
      </div>

      {/* Right controls: Theme Toggle + PiP + View Switcher + Settings */}
      <div className="flex items-center gap-1.5">
        {/* Quick Theme Toggle */}
        <ThemeToggle />

        {/* PiP Button in TopBar */}
        {onTogglePip && (
          <button
            onClick={onTogglePip}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors border",
              isPipActive
                ? "bg-zoom-blue text-white border-zoom-blue"
                : "bg-portal-card hover:bg-hover text-text-secondary hover:text-text-primary border-panel-border"
            )}
            title="Activar Picture-in-Picture"
            aria-label="Picture-in-Picture"
          >
            <Tv className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">PiP</span>
          </button>
        )}

        {/* View Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowViewMenu(!showViewMenu);
              setShowShieldMenu(false);
              setShowSoundMenu(false);
            }}
            className="flex items-center gap-1.5 rounded-md bg-portal-card hover:bg-hover px-2.5 py-1 text-[12px] font-medium text-text-primary transition-colors border border-panel-border"
            aria-label="Selector de vista"
          >
            {viewMode === "grid" ? (
              <ZGrid className="h-3.5 w-3.5 text-text-secondary" />
            ) : (
              <ZSpeaker className="h-3.5 w-3.5 text-text-secondary" />
            )}
            <span>Vista</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {showViewMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowViewMenu(false)}
              />
              <div className="absolute right-0 top-9 z-50 w-52 rounded-xl bg-portal-card p-1 text-xs shadow-xl ring-1 ring-portal-border text-text-primary animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onViewModeChange("speaker");
                    setShowViewMenu(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 rounded hover:bg-hover text-left transition-colors",
                    viewMode === "speaker" && "text-zoom-blue font-medium bg-zoom-blue/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ZSpeaker className="h-3.5 w-3.5" />
                    <span>Vista del hablante</span>
                  </div>
                  {viewMode === "speaker" && <Check className="h-3.5 w-3.5" />}
                </button>

                <button
                  onClick={() => {
                    onViewModeChange("grid");
                    setShowViewMenu(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 rounded hover:bg-hover text-left transition-colors",
                    viewMode === "grid" && "text-zoom-blue font-medium bg-zoom-blue/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ZGrid className="h-3.5 w-3.5" />
                    <span>Vista de galería</span>
                  </div>
                  {viewMode === "grid" && <Check className="h-3.5 w-3.5" />}
                </button>

                <div className="my-1 border-t border-portal-border" />

                <button
                  onClick={() => {
                    onToggleFullscreen();
                    setShowViewMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 rounded hover:bg-hover text-left text-text-secondary hover:text-text-primary transition-colors"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="h-3.5 w-3.5" />
                      <span>Salir de pantalla completa</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>Pantalla completa</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Settings button in TopBar */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-portal-card hover:bg-hover text-text-secondary hover:text-text-primary border border-panel-border transition-colors"
            title="Configuración"
            aria-label="Configuración"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
