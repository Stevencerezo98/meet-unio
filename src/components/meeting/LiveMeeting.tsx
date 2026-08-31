import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import { useLiveKitRoom } from "@/hooks/useLiveKitRoom";

interface LiveMeetingProps {
  roomId: string;
  token?: string | null;
  isHost?: boolean;
  initialMicOn?: boolean;
  initialWebcamOn?: boolean;
}

export default function LiveMeeting({
  roomId,
  token,
  isHost = true,
  initialMicOn = true,
  initialWebcamOn = true,
}: LiveMeetingProps) {
  const navigate = useNavigate();
  const userName = useUserStore((s) => s.displayName) || "You";

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

  // Real Chat data (Clean, no mock messages)
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const handleReceiveChat = useCallback((msg: ChatMessageItem) => {
    setChatMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, { ...msg, isLocal: false }];
    });
    setUnreadChatCount((c) => c + 1);
  }, []);

  // Connect to LiveKit Room using Token
  const {
    connectionState,
    remoteParticipants,
    activeSpeakerId: lkActiveSpeakerId,
    sendBroadcastChat,
    sendBroadcastReaction,
    sendBroadcastHandRaise,
  } = useLiveKitRoom({
    roomId,
    token,
    userName,
    isHost,
    micOn,
    webcamOn,
    isSharingScreen,
    onReceiveChat: handleReceiveChat,
  });

  const polls = usePollsStore((s) => s.polls);
  const results = usePollsStore((s) => s.results);
  const myVotes = usePollsStore((s) => s.myVotes);
  const createPoll = usePollsStore((s) => s.createPoll);
  const launchPoll = usePollsStore((s) => s.launchPoll);
  const vote = usePollsStore((s) => s.vote);

  // Camera stream track
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
  const meetingContainerRef = useRef<HTMLDivElement>(null);

  // Initialize camera track if webcamOn
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (webcamOn) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          activeStream = s;
          const track = s.getVideoTracks()[0];
          setLocalVideoTrack(track || null);
        })
        .catch(() => {
          setLocalVideoTrack(null);
        });
    } else {
      setLocalVideoTrack(null);
    }

    return () => {
      activeStream?.getTracks().forEach((t) => t.stop());
    };
  }, [webcamOn]);

  // Sync active speaker with LiveKit or local
  useEffect(() => {
    if (lkActiveSpeakerId) {
      setActiveSpeakerId(lkActiveSpeakerId);
    }
  }, [lkActiveSpeakerId]);

  // Assemble full participants list
  const localParticipant: ParticipantInfo = {
    id: "local",
    name: userName,
    isLocal: true,
    isHost: isHost,
    micOn: micOn,
    webcamOn: webcamOn,
    handRaised: handRaised,
    reaction: myReaction,
    isSpeaking: (lkActiveSpeakerId === "local" || activeSpeakerId === "local") && micOn,
    color: "#2d8cff",
    videoTrack: localVideoTrack,
  };

  const allParticipants = [localParticipant, ...remoteParticipants];

  // Active speaker for PiP
  const activeSpeaker =
    allParticipants.find((p) => p.id === (pinnedId || activeSpeakerId)) || localParticipant;

  // Picture-in-Picture Hook
  const {
    isPipActive,
    inAppPipOpen,
    setInAppPipOpen,
    togglePip,
  } = usePictureInPicture({
    activeSpeaker,
    allParticipants,
    roomId,
    isMeetingActive: true,
  });

  // Reactions handler
  const handleSelectReaction = (emoji: string) => {
    setMyReaction(emoji);
    sendBroadcastReaction(emoji);
    setTimeout(() => {
      setMyReaction(undefined);
    }, 4000);
  };

  const handleToggleHandRaise = () => {
    const next = !handRaised;
    setHandRaised(next);
    sendBroadcastHandRaise(next);
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      meetingContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Screen sharing toggle
  const handleToggleShareScreen = async () => {
    if (isSharingScreen) {
      setIsSharingScreen(false);
    } else {
      try {
        const stream = await navigator.mediaDevices?.getDisplayMedia?.({ video: true });
        if (stream) {
          setIsSharingScreen(true);
          stream.getVideoTracks()[0].onended = () => {
            setIsSharingScreen(false);
          };
        }
      } catch {
        setIsSharingScreen(!isSharingScreen);
      }
    }
  };

  // Chat message send
  const handleSendMessage = (text: string, files?: AttachedFile[]) => {
    const newMessage: ChatMessageItem = {
      id: crypto.randomUUID(),
      senderName: `${userName}`,
      senderId: "local",
      message: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isLocal: true,
      files,
    };
    setChatMessages((prev) => [...prev, newMessage]);
    sendBroadcastChat(newMessage);
  };

  const handleOpenChat = () => {
    setShowChat(true);
    setUnreadChatCount(0);
  };

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
                onClick={() => setIsSharingScreen(false)}
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
        onLeaveMeeting={() => navigate("/")}
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
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />

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