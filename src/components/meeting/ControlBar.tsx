import { useState } from "react";
import {
  ZMute,
  ZUnmute,
  ZStartVideo,
  ZStopVideo,
  ZSecurity,
  ZParticipants,
  ZChat,
  ZShareScreen,
  ZPolling,
  ZRecord,
  ZReaction,
  ZBreakoutRooms,
  ZApps,
} from "@/components/icons/ZoomIcons";
import ControlBarButton from "./ControlBarButton";
import ReactionsFlyout from "./ReactionsFlyout";
import SecurityMenu from "./SecurityMenu";
import BottomSheet from "@/components/ui/BottomSheet";
import { MoreHorizontal, PenTool, Hand, Lock, Tv, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";

interface ControlBarProps {
  micOn: boolean;
  onToggleMic: () => void;
  webcamOn: boolean;
  onToggleWebcam: () => void;
  isSharingScreen: boolean;
  onToggleShareScreen: () => void;
  isRecording: boolean;
  onToggleRecord: () => void;
  handRaised: boolean;
  onToggleHand: () => void;
  onSelectReaction: (emoji: string) => void;
  isLocked: boolean;
  onToggleLock: () => void;
  waitingRoom: boolean;
  onToggleWaitingRoom: () => void;
  participantsCount: number;
  unreadChatCount: number;
  isHost: boolean;
  onOpenParticipants: () => void;
  onOpenChat: () => void;
  onOpenPolling: () => void;
  onOpenBreakoutRooms: () => void;
  onOpenWhiteboard: () => void;
  onOpenApps?: () => void;
  isAppsOpen?: boolean;
  onLeaveMeeting: () => void;
  isPipActive?: boolean;
  onTogglePip?: () => void;
  onOpenSettings?: () => void;
}

export default function ControlBar({
  micOn,
  onToggleMic,
  webcamOn,
  onToggleWebcam,
  isSharingScreen,
  onToggleShareScreen,
  isRecording,
  onToggleRecord,
  handRaised,
  onToggleHand,
  onSelectReaction,
  isLocked,
  onToggleLock,
  waitingRoom,
  onToggleWaitingRoom,
  participantsCount,
  unreadChatCount,
  isHost,
  onOpenParticipants,
  onOpenChat,
  onOpenPolling,
  onOpenBreakoutRooms,
  onOpenWhiteboard,
  onOpenApps,
  isAppsOpen,
  onLeaveMeeting,
  isPipActive,
  onTogglePip,
  onOpenSettings,
}: ControlBarProps) {
  const isMobile = useIsMobile();
  const [showReactions, setShowReactions] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showMoreMobile, setShowMoreMobile] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showVideoMenu, setShowVideoMenu] = useState(false);

  return (
    <nav
      aria-label="Meeting controls"
      className="relative z-30 flex h-[72px] sm:h-[80px] w-full items-center justify-between bg-controlbar px-2 sm:px-4 border-t border-panel-border select-none text-text-primary transition-colors duration-200"
    >
      {/* Desktop Layout */}
      {!isMobile && (
        <>
          {/* Left Audio & Video Controls */}
          <div className="flex items-center gap-1">
            {/* Mic Button */}
            <div className="relative">
              <ControlBarButton
                icon={micOn ? <ZMute className="h-5 w-5" /> : <ZUnmute className="h-5 w-5 text-leave" />}
                label={micOn ? "Silenciar" : "Reactivar"}
                alert={!micOn}
                hasChevron
                onClick={onToggleMic}
                onChevronClick={() => setShowAudioMenu(!showAudioMenu)}
              />

              {showAudioMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAudioMenu(false)} />
                  <div className="absolute bottom-16 left-0 z-50 w-60 rounded-xl bg-portal-card p-2 text-xs shadow-2xl ring-1 ring-portal-border text-text-primary">
                    <div className="px-2.5 py-1 text-[11px] font-semibold text-text-secondary uppercase">Seleccionar micrófono</div>
                    <div className="px-2.5 py-1.5 rounded bg-zoom-blue/10 text-zoom-blue font-medium">✓ Micrófono predeterminado</div>
                    <div className="my-1 border-t border-portal-border" />
                    <div className="px-2.5 py-1 text-[11px] font-semibold text-text-secondary uppercase">Seleccionar altavoz</div>
                    <div className="px-2.5 py-1.5 rounded bg-zoom-blue/10 text-zoom-blue font-medium">✓ Altavoz predeterminado</div>
                  </div>
                </>
              )}
            </div>

            {/* Video Button */}
            <div className="relative">
              <ControlBarButton
                icon={webcamOn ? <ZStopVideo className="h-5 w-5" /> : <ZStartVideo className="h-5 w-5 text-leave" />}
                label={webcamOn ? "Detener video" : "Iniciar video"}
                alert={!webcamOn}
                hasChevron
                onClick={onToggleWebcam}
                onChevronClick={() => setShowVideoMenu(!showVideoMenu)}
              />

              {showVideoMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowVideoMenu(false)} />
                  <div className="absolute bottom-16 left-0 z-50 w-60 rounded-xl bg-portal-card p-2 text-xs shadow-2xl ring-1 ring-portal-border text-text-primary">
                    <div className="px-2.5 py-1 text-[11px] font-semibold text-text-secondary uppercase">Seleccionar cámara</div>
                    <div className="px-2.5 py-1.5 rounded bg-zoom-blue/10 text-zoom-blue font-medium">✓ Cámara predeterminada</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center Main Controls */}
          <div className="flex items-center gap-1">
            {/* Security (Host) */}
            {isHost && (
              <div className="relative">
                <ControlBarButton
                  icon={<ZSecurity className="h-5 w-5" />}
                  label="Seguridad"
                  hasChevron
                  onClick={() => setShowSecurity(!showSecurity)}
                  onChevronClick={() => setShowSecurity(!showSecurity)}
                />
                <SecurityMenu
                  open={showSecurity}
                  onClose={() => setShowSecurity(false)}
                  isLocked={isLocked}
                  onToggleLock={onToggleLock}
                  waitingRoom={waitingRoom}
                  onToggleWaitingRoom={onToggleWaitingRoom}
                />
              </div>
            )}

            {/* Participants */}
            <ControlBarButton
              icon={<ZParticipants className="h-5 w-5" />}
              label="Participantes"
              badge={participantsCount}
              onClick={onOpenParticipants}
            />

            {/* Chat */}
            <ControlBarButton
              icon={<ZChat className="h-5 w-5" />}
              label="Chat"
              badge={unreadChatCount > 0 ? unreadChatCount : undefined}
              onClick={onOpenChat}
            />

            {/* Share Screen */}
            <ControlBarButton
              icon={<ZShareScreen className={cn("h-5 w-5", isSharingScreen ? "text-emerald-500" : "text-share-green")} />}
              label={isSharingScreen ? "Detener" : "Compartir"}
              active={isSharingScreen}
              hasChevron
              onClick={onToggleShareScreen}
            />

            {/* Polling */}
            <ControlBarButton
              icon={<ZPolling className="h-5 w-5" />}
              label="Votaciones"
              onClick={onOpenPolling}
            />

            {/* Record */}
            {isRecording ? (
              <div className="flex items-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg bg-leave/20 border border-leave/30 text-leave text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-leave animate-pulse" />
                  <span>Grabando</span>
                </div>
                <button
                  onClick={onToggleRecord}
                  className="px-2.5 py-1.5 rounded-r-lg bg-leave text-white text-xs font-semibold hover:bg-leave-hover"
                >
                  Detener
                </button>
              </div>
            ) : (
              <ControlBarButton
                icon={<ZRecord className="h-5 w-5" />}
                label="Grabar"
                onClick={onToggleRecord}
              />
            )}

            {/* Breakout Rooms */}
            {isHost && (
              <ControlBarButton
                icon={<ZBreakoutRooms className="h-5 w-5" />}
                label="Grupos"
                onClick={onOpenBreakoutRooms}
              />
            )}

            {/* Whiteboard */}
            <ControlBarButton
              icon={<PenTool className="h-5 w-5" />}
              label="Pizarra"
              onClick={onOpenWhiteboard}
            />

            {/* Apps Button */}
            {onOpenApps && (
              <ControlBarButton
                icon={<ZApps className="h-5 w-5" />}
                label="Apps"
                active={isAppsOpen}
                onClick={onOpenApps}
              />
            )}

            {/* Picture-in-Picture Button */}
            {onTogglePip && (
              <ControlBarButton
                icon={<Tv className={cn("h-5 w-5", isPipActive ? "text-zoom-blue" : "")} />}
                label="Modo PiP"
                active={isPipActive}
                onClick={onTogglePip}
              />
            )}

            {/* Reactions */}
            <div className="relative">
              <ControlBarButton
                icon={<ZReaction className="h-5 w-5" />}
                label="Reacciones"
                active={handRaised}
                onClick={() => setShowReactions(!showReactions)}
              />
              <ReactionsFlyout
                open={showReactions}
                onClose={() => setShowReactions(false)}
                onSelectReaction={onSelectReaction}
                handRaised={handRaised}
                onToggleHand={onToggleHand}
              />
            </div>
          </div>

          {/* Right Controls: Settings & Leave/End Button */}
          <div className="flex items-center gap-2">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
                title="Configuración"
                aria-label="Configuración"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center justify-center rounded-lg bg-leave hover:bg-leave-hover active:bg-[#ab342e] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              {isHost ? "Finalizar" : "Salir"}
            </button>
          </div>
        </>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div className="flex w-full items-center justify-between">
          <ControlBarButton
            icon={micOn ? <ZMute className="h-5 w-5" /> : <ZUnmute className="h-5 w-5 text-leave" />}
            label={micOn ? "Silenciar" : "Reactivar"}
            alert={!micOn}
            onClick={onToggleMic}
          />

          <ControlBarButton
            icon={webcamOn ? <ZStopVideo className="h-5 w-5" /> : <ZStartVideo className="h-5 w-5 text-leave" />}
            label={webcamOn ? "Detener" : "Iniciar"}
            alert={!webcamOn}
            onClick={onToggleWebcam}
          />

          <ControlBarButton
            icon={<ZShareScreen className="h-5 w-5 text-share-green" />}
            label="Compartir"
            onClick={onToggleShareScreen}
          />

          {onTogglePip && (
            <ControlBarButton
              icon={<Tv className="h-5 w-5 text-zoom-blue" />}
              label="PiP"
              active={isPipActive}
              onClick={onTogglePip}
            />
          )}

          <ControlBarButton
            icon={<MoreHorizontal className="h-5 w-5" />}
            label="Más"
            onClick={() => setShowMoreMobile(true)}
          />

          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center justify-center rounded-lg bg-leave hover:bg-leave-hover px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
          >
            {isHost ? "Finalizar" : "Salir"}
          </button>
        </div>
      )}

      {/* Mobile "More" BottomSheet */}
      <BottomSheet
        open={showMoreMobile}
        onClose={() => setShowMoreMobile(false)}
        title="Más opciones"
      >
        <div className="grid grid-cols-3 gap-3 p-4">
          <button
            onClick={() => {
              setShowMoreMobile(false);
              onOpenParticipants();
            }}
            className="flex flex-col items-center gap-2 rounded-xl bg-hover p-3.5 text-text-primary text-xs"
          >
            <ZParticipants className="h-6 w-6 text-zoom-blue" />
            <span>Participantes ({participantsCount})</span>
          </button>

          <button
            onClick={() => {
              setShowMoreMobile(false);
              onOpenChat();
            }}
            className="flex flex-col items-center gap-2 rounded-xl bg-hover p-3.5 text-text-primary text-xs"
          >
            <ZChat className="h-6 w-6 text-zoom-blue" />
            <span>Chat</span>
          </button>

          <button
            onClick={() => {
              setShowMoreMobile(false);
              onOpenPolling();
            }}
            className="flex flex-col items-center gap-2 rounded-xl bg-hover p-3.5 text-text-primary text-xs"
          >
            <ZPolling className="h-6 w-6 text-zoom-blue" />
            <span>Votaciones</span>
          </button>

          <button
            onClick={() => {
              setShowMoreMobile(false);
              onOpenWhiteboard();
            }}
            className="flex flex-col items-center gap-2 rounded-xl bg-hover p-3.5 text-text-primary text-xs"
          >
            <PenTool className="h-6 w-6 text-zoom-blue" />
            <span>Pizarra</span>
          </button>

          {onOpenApps && (
            <button
              onClick={() => {
                setShowMoreMobile(false);
                onOpenApps();
              }}
              className="flex flex-col items-center gap-2 rounded-xl bg-hover p-3.5 text-text-primary text-xs"
            >
              <ZApps className="h-6 w-6" />
              <span>Apps</span>
            </button>
          )}

          {onTogglePip && (
            <button
              onClick={() => {
                setShowMoreMobile(false);
                onTogglePip();
              }}
              className="flex flex-col items-center gap-2 rounded-xl bg-hover p-3.5 text-text-primary text-xs"
            >
              <Tv className="h-6 w-6 text-zoom-blue" />
              <span>Picture-in-Picture</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              onClick={() => {
                setShowMoreMobile(false);
                onOpenSettings();
              }}
              className="flex flex-col items-center gap-2 rounded-xl bg-hover p-3.5 text-text-primary text-xs"
            >
              <Settings className="h-6 w-6 text-zoom-blue" />
              <span>Configuración</span>
            </button>
          )}

          <button
            onClick={() => {
              onToggleHand();
              setShowMoreMobile(false);
            }}
            className="flex flex-col items-center gap-2 rounded-xl bg-hover p-3.5 text-text-primary text-xs"
          >
            <Hand className={cn("h-6 w-6", handRaised ? "text-amber-400" : "text-text-secondary")} />
            <span>{handRaised ? "Bajar la mano" : "Levantar la mano"}</span>
          </button>

          {isHost && (
            <>
              <button
                onClick={() => {
                  onToggleRecord();
                  setShowMoreMobile(false);
                }}
                className="flex flex-col items-center gap-2 rounded-xl bg-hover p-3.5 text-text-primary text-xs"
              >
                <ZRecord className={cn("h-6 w-6", isRecording ? "text-leave" : "text-text-secondary")} />
                <span>{isRecording ? "Detener grabación" : "Grabar reunión"}</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMobile(false);
                  onOpenBreakoutRooms();
                }}
                className="flex flex-col items-center gap-2 rounded-xl bg-hover p-3.5 text-text-primary text-xs"
              >
                <ZBreakoutRooms className="h-6 w-6 text-zoom-blue" />
                <span>Salas para grupos</span>
              </button>

              <button
                onClick={() => {
                  onToggleLock();
                  setShowMoreMobile(false);
                }}
                className="flex flex-col items-center gap-2 rounded-xl bg-hover p-3.5 text-text-primary text-xs"
              >
                <Lock className={cn("h-6 w-6", isLocked ? "text-leave" : "text-text-secondary")} />
                <span>{isLocked ? "Desbloquear reunión" : "Bloquear reunión"}</span>
              </button>
            </>
          )}
        </div>
      </BottomSheet>

      {/* Leave / End Confirmation Dialog */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-2xl bg-portal-card p-6 text-text-primary shadow-2xl ring-1 ring-portal-border space-y-4">
            <h3 className="text-base font-semibold text-text-primary">
              {isHost ? "Finalizar reunión" : "Salir de la reunión"}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {isHost
                ? "¿Deseas finalizar la reunión para todos los participantes o sólo salir tú?"
                : "¿Estás seguro de que deseas salir de esta reunión?"}
            </p>

            <div className="flex flex-col gap-2 pt-2">
              {isHost && (
                <button
                  onClick={() => {
                    setShowLeaveModal(false);
                    onLeaveMeeting();
                  }}
                  className="w-full rounded-lg bg-leave py-2 text-xs font-semibold text-white hover:bg-leave-hover transition-colors"
                >
                  Finalizar la reunión para todos
                </button>
              )}
              <button
                onClick={() => {
                  setShowLeaveModal(false);
                  onLeaveMeeting();
                }}
                className="w-full rounded-lg bg-hover py-2 text-xs font-semibold text-text-primary hover:bg-hover/80 transition-colors"
              >
                Salir de la reunión
              </button>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="w-full rounded-lg py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
