import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useRemoteParticipants,
  useLocalParticipant,
  useRoomContext,
  useConnectionState,
  useTracks,
} from "@livekit/components-react";
import { Track, ConnectionState } from "livekit-client";

import TopBar from "./TopBar";
import ControlBar from "./ControlBar";
import VideoGrid from "./VideoGrid";
import SpeakerView from "./SpeakerView";
import ParticipantsPanel from "./ParticipantsPanel";
import ChatPanel, { type AttachedFile, type ChatMessageItem } from "./ChatPanel";
import PollingModal from "./PollingModal";
import BreakoutRoomsModal from "./BreakoutRoomsModal";
import WhiteboardModal from "./WhiteboardModal";
import FloatingPiP from "./FloatingPiP";
import AppsPanel from "./AppsPanel";
import InviteModal from "./InviteModal";
import SettingsModal from "@/components/ui/SettingsModal";
import type { ParticipantInfo } from "./ParticipantTile";
import { usePollsStore } from "@/store/usePollsStore";
import { useUserStore } from "@/store/useUserStore";
import { usePictureInPicture } from "@/hooks/usePictureInPicture";

interface LiveMeetingProps {
  roomId: string;
  isHost?: boolean;
  initialMicOn?: boolean;
  initialWebcamOn?: boolean;
}

export default function LiveMeeting({
  roomId,
  isHost = true,
  initialMicOn = true,
  initialWebcamOn = true,
}: LiveMeetingProps) {
  const navigate = useNavigate();
  const userName = useUserStore((s) => s.displayName) || "You";

  // Context & Hooks Oficiales de LiveKit
  const room = useRoomContext();
  const rawConnectionState = useConnectionState();
  const remoteParticipantsLK = useRemoteParticipants();
  const { localParticipant: localLK } = useLocalParticipant();
  const audioTracks = useTracks([Track.Source.Microphone], { onlySubscribed: true });
  const activeSpeakers = audioTracks.filter((track) => track.publication?.isSpeaking);

  // Mapear el estado de conexión para tu TopBar
  const connectionState: "idle" | "connecting" | "connected" | "error" =
    rawConnectionState === ConnectionState.Connected
      ? "connected"
      : rawConnectionState === ConnectionState.Connecting
      ? "connecting"
      : rawConnectionState === ConnectionState.Disconnected
      ? "idle"
      : "error";

  // Meeting states
  const [micOn, setMicOn] = useState(initialMicOn);
  const [webcamOn, setWebcamOn] = useState(initialWebcamOn);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [myReaction, setMyReaction] = useState<string | undefined>();
  const [isLocked, setIsLocked] = useState(false);
  const [waitingRoom, setWaitingRoom] = useState(false);

  // Views & Panels
  const [viewMode, setViewMode] = useState<"grid" | "speaker">("grid");
  const [pinnedId, setPinnedId] = useState<string | undefined>();
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>("local");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showPolling, setShowPolling] = useState(false);
  const [showBreakout, setShowBreakout] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Real Chat data
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const meetingContainerRef = useRef<HTMLDivElement>(null);

  // Sincronización de Micrófono local con LiveKit
  useEffect(() => {
    if (localLK) {
      localLK.setMicrophoneEnabled(micOn).catch(() => {});
    }
  }, [micOn, localLK]);

  // Sincronización de Cámara local con LiveKit
  useEffect(() => {
    if (localLK) {
      localLK.setCameraEnabled(webcamOn).catch(() => {});
    }
  }, [webcamOn, localLK]);

  // Escuchar mensajes de Chat o datos DataReceived enviados vía LiveKit
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);

        if (data.type === "chat" && data.message) {
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, { ...data.message, isLocal: false }];
          });
          setUnreadChatCount((c) => c + 1);
        }
      } catch {
        // Ignorar paquetes que no sean JSON
      }
    };

    room.on("dataReceived", handleDataReceived);
    return () => {
      room.off("dataReceived", handleDataReceived);
    };
  }, [room]);

  // Obtiene la lista de altavoces/hablantes activos en tiempo real
  useEffect(() => {
    if (activeSpeakers.length > 0) {
      const topSpeaker = activeSpeakers[0];
      const speakerIdentity = topSpeaker.participant?.identity || topSpeaker.participant?.name;

      if (speakerIdentity) {
        setActiveSpeakerId(
          speakerIdentity === localLK?.identity ? "local" : speakerIdentity
        );
      }
    }
  }, [activeSpeakers, localLK?.identity]);

  // Transmitir datos por el canal seguro de LiveKit
  const broadcastData = useCallback(
    (dataObj: object) => {
      if (room?.state === ConnectionState.Connected && localLK) {
        const payload = new TextEncoder().encode(JSON.stringify(dataObj));
        localLK.publishData(payload, { reliable: true });
      }
    },
    [room, localLK]
  );

  // Mapear participantes remotos al formato ParticipantInfo de tu app
  const remoteParticipants: ParticipantInfo[] = remoteParticipantsLK.map((p) => {
    const camPub =
      p.getTrackPublication(Track.Source.Camera) ||
      Array.from(p.videoTrackPublications.values()).find((pub) => pub.track);

    let meta: Record<string, unknown> = {};
    try {
      if (p.metadata) meta = JSON.parse(p.metadata);
    } catch {
      // ignore
    }

    return {
      id: p.identity,
      name: p.name || p.identity,
      isLocal: false,
      isHost: Boolean(meta.isHost),
      micOn: p.isMicrophoneEnabled,
      webcamOn: p.isCameraEnabled,
      handRaised: Boolean(meta.handRaised),
      reaction: typeof meta.reaction === "string" ? meta.reaction : undefined,
      isSpeaking: p.isSpeaking,
      color: typeof meta.color === "string" ? meta.color : "#3b6ea5",
      videoTrack: camPub?.track?.mediaStreamTrack || null,
    };
  });

  // Track de cámara local nativo desde LiveKit
  const localCamPub = localLK?.getTrackPublication(Track.Source.Camera);
  const localVideoTrack = localCamPub?.track?.mediaStreamTrack || null;

  // Participante Local en formato ParticipantInfo
  const localParticipant: ParticipantInfo = {
    id: "local",
    name: userName,
    isLocal: true,
    isHost: isHost,
    micOn: micOn,
    webcamOn: webcamOn,
    handRaised: handRaised,
    reaction: myReaction,
    isSpeaking: activeSpeakerId === "local" && micOn,
    color: "#2d8cff",
    videoTrack: localVideoTrack,
  };

  const allParticipants = [localParticipant, ...remoteParticipants];

  // Active speaker para PiP
  const activeSpeaker =
    allParticipants.find((p) => p.id === (pinnedId || activeSpeakerId)) || localParticipant;

  // Picture-in-Picture Hook
  const { isPipActive, inAppPipOpen, setInAppPipOpen, togglePip } =
    usePictureInPicture({
      activeSpeaker,
      allParticipants,
      roomId,
      isMeetingActive: true,
    });

  // Reacciones
  const handleSelectReaction = (emoji: string) => {
    setMyReaction(emoji);
    broadcastData({ type: "reaction", emoji });
    setTimeout(() => {
      setMyReaction(undefined);
    }, 4000);
  };

  const handleToggleHandRaise = () => {
    const next = !handRaised;
    setHandRaised(next);
    broadcastData({ type: "hand_raise", raised: next });
  };

  // Pantalla completa
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      meetingContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Compartir pantalla con LiveKit Native SDK
  const handleToggleShareScreen = async () => {
    if (!localLK) return;
    try {
      const nextState = !isSharingScreen;
      await localLK.setScreenShareEnabled(nextState);
      setIsSharingScreen(nextState);
    } catch (err) {
      console.error("Error al compartir pantalla:", err);
      setIsSharingScreen(false);
    }
  };

  // Envío de mensajes por Chat
  const handleSendMessage = (text: string, files?: AttachedFile[]) => {
    const newMessage: ChatMessageItem = {
      id: crypto.randomUUID(),
      senderName: userName,
      senderId: localLK?.identity || "local",
      message: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isLocal: true,
      files,
    };
    setChatMessages((prev) => [...prev, newMessage]);
    broadcastData({ type: "chat", message: newMessage });
  };

  const handleOpenChat = () => {
    setShowChat(true);
    setUnreadChatCount(0);
  };

  // Zustand Polls
  const polls = usePollsStore((s) => s.polls);
  const results = usePollsStore((s) => s.results);
  const myVotes = usePollsStore((s) => s.myVotes);
  const createPoll = usePollsStore((s) => s.createPoll);
  const launchPoll = usePollsStore((s) => s.launchPoll);
  const vote = usePollsStore((s) => s.vote);

  return (
    <div
      ref={meetingContainerRef}
      className="relative flex h-screen w-screen flex-col overflow-hidden bg-stage text-text-primary select-none font-sans transition-colors duration-200"
    >
      {/* Top Bar */}
      <TopBar
        roomId={roomId}
        topic="Quick Zoom Meeting"
        hostName={isHost ? `${userName} (Host)` : "Admin Host"}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        isPipActive={isPipActive}
        onTogglePip={togglePip}
        onOpenSettings={() => setShowSettings(true)}
        connectionState={connectionState}
      />

      {/* Main Video Stage & Side Panels Container */}
      <div className="relative flex flex-1 overflow-hidden min-h-0">
        {/* Central Stage Area */}
        <main className="relative flex flex-1 h-full w-full flex-col overflow-hidden bg-stage">
          {/* Screen Sharing Banner */}
          {isSharingScreen && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xl">
              <span>You are sharing your screen</span>
              <button
                onClick={handleToggleShareScreen}
                className="rounded bg-black/30 px-2 py-0.5 text-[11px] hover:bg-black/50"
              >
                Stop Share
              </button>
            </div>
          )}

          {/* Video Grid or Speaker View */}
          {viewMode === "grid" ? (
            <VideoGrid
              participants={allParticipants}
              pinnedId={pinnedId}
              onTogglePin={(id) => setPinnedId(pinnedId === id ? undefined : id)}
            />
          ) : (
            <SpeakerView
              participants={allParticipants}
              activeSpeakerId={activeSpeakerId}
              pinnedId={pinnedId}
              onTogglePin={(id) => setPinnedId(pinnedId === id ? undefined : id)}
            />
          )}
        </main>

        {/* Side Panels */}
        <ParticipantsPanel
          open={showParticipants}
          onClose={() => setShowParticipants(false)}
          participants={allParticipants}
          isHost={isHost}
          onMuteAll={() => setMicOn(false)}
          onInvite={() => setShowInvite(true)}
        />

        <ChatPanel
          open={showChat}
          onClose={() => setShowChat(false)}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          participants={allParticipants}
        />

        <AppsPanel
          open={showApps}
          onClose={() => setShowApps(false)}
          roomId={roomId}
        />
      </div>

      {/* Bottom Control Bar */}
      <ControlBar
        micOn={micOn}
        onToggleMic={() => setMicOn(!micOn)}
        webcamOn={webcamOn}
        onToggleWebcam={() => setWebcamOn(!webcamOn)}
        isSharingScreen={isSharingScreen}
        onToggleShareScreen={handleToggleShareScreen}
        isRecording={isRecording}
        onToggleRecord={() => setIsRecording(!isRecording)}
        handRaised={handRaised}
        onToggleHand={handleToggleHandRaise}
        onSelectReaction={handleSelectReaction}
        isLocked={isLocked}
        onToggleLock={() => setIsLocked(!isLocked)}
        waitingRoom={waitingRoom}
        onToggleWaitingRoom={() => setWaitingRoom(!waitingRoom)}
        participantsCount={allParticipants.length}
        unreadChatCount={unreadChatCount}
        isHost={isHost}
        onOpenParticipants={() => {
          setShowParticipants(!showParticipants);
          setShowChat(false);
          setShowApps(false);
        }}
        onOpenChat={() => {
          handleOpenChat();
          setShowParticipants(false);
          setShowApps(false);
        }}
        onOpenApps={() => {
          setShowApps(!showApps);
          setShowParticipants(false);
          setShowChat(false);
        }}
        isAppsOpen={showApps}
        onOpenPolling={() => setShowPolling(true)}
        onOpenBreakoutRooms={() => setShowBreakout(true)}
        onOpenWhiteboard={() => setShowWhiteboard(true)}
        onLeaveMeeting={() => {
          room?.disconnect();
          navigate("/");
        }}
        isPipActive={isPipActive}
        onTogglePip={togglePip}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Floating In-App PiP Window */}
      <FloatingPiP
        open={inAppPipOpen}
        onClose={() => setInAppPipOpen(false)}
        onExpand={() => {
          setInAppPipOpen(false);
          window.focus();
        }}
        participant={activeSpeaker}
        micOn={micOn}
        onToggleMic={() => setMicOn(!micOn)}
        webcamOn={webcamOn}
        onToggleWebcam={() => setWebcamOn(!webcamOn)}
        roomId={roomId}
      />

      {/* Settings Modal */}
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

      {/* Invite Modal */}
      <InviteModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        roomId={roomId}
        topic="Quick Zoom Meeting"
        hostName={isHost ? `${userName} (Host)` : "Admin Host"}
      />

      {/* Modals */}
      <PollingModal
        open={showPolling}
        onClose={() => setShowPolling(false)}
        polls={polls}
        onCreatePoll={createPoll}
        onLaunchPoll={launchPoll}
        onVote={vote}
        results={results}
        myVotes={myVotes}
        isHost={isHost}
      />

      <BreakoutRoomsModal
        open={showBreakout}
        onClose={() => setShowBreakout(false)}
        participants={allParticipants}
      />

      <WhiteboardModal
        open={showWhiteboard}
        onClose={() => setShowWhiteboard(false)}
      />
    </div>
  );
}