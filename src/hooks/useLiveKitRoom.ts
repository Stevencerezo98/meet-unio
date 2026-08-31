import { useEffect, useRef, useState, useCallback } from "react";
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  Participant,
} from "livekit-client";
import type { ParticipantInfo } from "@/components/meeting/ParticipantTile";
import type { ChatMessageItem } from "@/components/meeting/ChatPanel";

interface UseLiveKitRoomProps {
  roomId: string;
  userName: string;
  isHost?: boolean;
  micOn: boolean;
  webcamOn: boolean;
  isSharingScreen: boolean;
  onReceiveChat?: (msg: ChatMessageItem) => void;
  onReceiveReaction?: (participantId: string, emoji: string) => void;
  onReceiveHandRaise?: (participantId: string, raised: boolean) => void;
}

export function useLiveKitRoom({
  roomId,
  userName,
  isHost = false,
  micOn,
  webcamOn,
  isSharingScreen,
  onReceiveChat,
  onReceiveReaction,
  onReceiveHandRaise,
}: UseLiveKitRoomProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [connectionState, setConnectionState] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");
  const [remoteParticipants, setRemoteParticipants] = useState<ParticipantInfo[]>([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [livekitConfigured, setLivekitConfigured] = useState<boolean>(true);

  const roomRef = useRef<Room | null>(null);
  const audioElementsRef = useRef<Map<string, HTMLMediaElement>>(new Map());

  // Helper to extract ParticipantInfo from a RemoteParticipant
  const mapRemoteParticipant = useCallback((p: RemoteParticipant): ParticipantInfo => {
    let videoTrack: MediaStreamTrack | null = null;
    
    // Find camera or video track
    const camPub = p.getTrackPublication(Track.Source.Camera) ||
      Array.from(p.videoTrackPublications.values()).find((pub) => pub.track);
    
    if (camPub?.track?.mediaStreamTrack) {
      videoTrack = camPub.track.mediaStreamTrack;
    }

    let meta: Record<string, unknown> = {};
    try {
      if (p.metadata) {
        meta = JSON.parse(p.metadata);
      }
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
      videoTrack: videoTrack,
    };
  }, []);

  const syncRemoteParticipants = useCallback(() => {
    if (!roomRef.current) return;
    const participants: ParticipantInfo[] = [];
    roomRef.current.remoteParticipants.forEach((p) => {
      participants.push(mapRemoteParticipant(p));
    });
    setRemoteParticipants(participants);
  }, [mapRemoteParticipant]);

  // Connect to LiveKit Room
  useEffect(() => {
    let isCancelled = false;

    async function initRoom() {
      setConnectionState("connecting");
      setError(null);

      try {
        const res = await fetch(
          `/api/livekit/token?room=${encodeURIComponent(roomId)}&username=${encodeURIComponent(userName)}`
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (errData.configured === false) {
            setLivekitConfigured(false);
          }
          throw new Error(errData.error || "No se pudo obtener el token de LiveKit");
        }

        const data = await res.json();
        if (isCancelled) return;

        const token = data.token;
        const wsUrl = data.wsUrl || import.meta.env.VITE_LIVEKIT_URL || window.location.origin.replace(/^http/, "ws");

        if (!wsUrl || !token) {
          throw new Error("Credenciales de WebSocket LiveKit no configuradas en el servidor");
        }

        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: { width: 1280, height: 720, frameRate: 30 },
          },
        });

        roomRef.current = newRoom;
        setRoom(newRoom);

        // Listen to room events
        newRoom.on(RoomEvent.Connected, () => {
          if (!isCancelled) {
            setConnectionState("connected");
            setLivekitConfigured(true);
            syncRemoteParticipants();
          }
        });

        newRoom.on(RoomEvent.Disconnected, () => {
          if (!isCancelled) {
            setConnectionState("idle");
            setRemoteParticipants([]);
          }
        });

        newRoom.on(RoomEvent.ParticipantConnected, () => {
          syncRemoteParticipants();
        });

        newRoom.on(RoomEvent.ParticipantDisconnected, (p: RemoteParticipant) => {
          // Clean audio elements if any
          const el = audioElementsRef.current.get(p.identity);
          if (el) {
            el.remove();
            audioElementsRef.current.delete(p.identity);
          }
          syncRemoteParticipants();
        });

        newRoom.on(
          RoomEvent.TrackSubscribed,
          (track: RemoteTrack, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
            if (track.kind === Track.Kind.Audio) {
              const el = track.attach();
              audioElementsRef.current.set(`${participant.identity}_audio`, el);
              document.body.appendChild(el);
            }
            syncRemoteParticipants();
          }
        );

        newRoom.on(
          RoomEvent.TrackUnsubscribed,
          (track: RemoteTrack, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
            track.detach();
            const el = audioElementsRef.current.get(`${participant.identity}_audio`);
            if (el) {
              el.remove();
              audioElementsRef.current.delete(`${participant.identity}_audio`);
            }
            syncRemoteParticipants();
          }
        );

        newRoom.on(RoomEvent.TrackMuted, () => syncRemoteParticipants());
        newRoom.on(RoomEvent.TrackUnmuted, () => syncRemoteParticipants());

        newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
          if (speakers.length > 0) {
            setActiveSpeakerId(speakers[0].identity);
          }
          syncRemoteParticipants();
        });

        // LiveKit data packets (for real-time chat, reactions, hand raises across all devices)
        newRoom.on(
          RoomEvent.DataReceived,
          (payload: Uint8Array, participant?: RemoteParticipant) => {
            try {
              const text = new TextDecoder().decode(payload);
              const data = JSON.parse(text);

              if (data.type === "chat" && onReceiveChat) {
                onReceiveChat(data.message);
              } else if (data.type === "reaction" && onReceiveReaction && participant) {
                onReceiveReaction(participant.identity, data.emoji);
              } else if (data.type === "hand_raise" && onReceiveHandRaise && participant) {
                onReceiveHandRaise(participant.identity, data.raised);
              }
            } catch {
              // Non-json data packet
            }
          }
        );

        // Connect room
        await newRoom.connect(wsUrl, token);

        // Set metadata (host flag, display info)
        await newRoom.localParticipant.setMetadata(
          JSON.stringify({ isHost, name: userName })
        );

        // Set initial camera / mic states
        if (webcamOn) {
          await newRoom.localParticipant.setCameraEnabled(true).catch(() => {});
        }
        if (micOn) {
          await newRoom.localParticipant.setMicrophoneEnabled(true).catch(() => {});
        }

        if (!isCancelled) {
          setConnectionState("connected");
          syncRemoteParticipants();
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : "Error al conectar con LiveKit";
          setError(msg);
          setConnectionState("error");
        }
      }
    }

    const audioMap = audioElementsRef.current;

    initRoom();

    return () => {
      isCancelled = true;
      if (roomRef.current) {
        // Detach all audio elements
        audioMap.forEach((el) => el.remove());
        audioMap.clear();
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [roomId, userName, isHost, micOn, webcamOn, mapRemoteParticipant, syncRemoteParticipants, onReceiveChat, onReceiveReaction, onReceiveHandRaise]);

  // Sync Local Camera with LiveKit
  useEffect(() => {
    if (roomRef.current?.state === "connected") {
      roomRef.current.localParticipant.setCameraEnabled(webcamOn).catch(() => {});
    }
  }, [webcamOn]);

  // Sync Local Mic with LiveKit
  useEffect(() => {
    if (roomRef.current?.state === "connected") {
      roomRef.current.localParticipant.setMicrophoneEnabled(micOn).catch(() => {});
    }
  }, [micOn]);

  // Sync Local Screen Share with LiveKit
  useEffect(() => {
    if (roomRef.current?.state === "connected") {
      roomRef.current.localParticipant.setScreenShareEnabled(isSharingScreen).catch(() => {});
    }
  }, [isSharingScreen]);

  // Broadcast chat message to all peers in the room
  const sendBroadcastChat = useCallback((msg: ChatMessageItem) => {
    if (roomRef.current?.state === "connected") {
      const data = JSON.stringify({ type: "chat", message: msg });
      const encoded = new TextEncoder().encode(data);
      roomRef.current.localParticipant.publishData(encoded, { reliable: true }).catch(() => {});
    }
  }, []);

  // Broadcast reaction to all peers in the room
  const sendBroadcastReaction = useCallback((emoji: string) => {
    if (roomRef.current?.state === "connected") {
      const data = JSON.stringify({ type: "reaction", emoji });
      const encoded = new TextEncoder().encode(data);
      roomRef.current.localParticipant.publishData(encoded, { reliable: true }).catch(() => {});
    }
  }, []);

  // Broadcast hand raise to all peers in the room
  const sendBroadcastHandRaise = useCallback((raised: boolean) => {
    if (roomRef.current?.state === "connected") {
      const data = JSON.stringify({ type: "hand_raise", raised });
      const encoded = new TextEncoder().encode(data);
      roomRef.current.localParticipant.publishData(encoded, { reliable: true }).catch(() => {});
    }
  }, []);

  return {
    room,
    connectionState,
    remoteParticipants,
    activeSpeakerId,
    error,
    livekitConfigured,
    sendBroadcastChat,
    sendBroadcastReaction,
    sendBroadcastHandRaise,
  };
}
