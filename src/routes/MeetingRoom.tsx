import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { LiveKitRoom } from "@livekit/components-react";
import PreJoin from "@/components/meeting/PreJoin";
import LiveMeeting from "@/components/meeting/LiveMeeting";
import { useUserStore } from "@/store/useUserStore";
import { useSessionStore } from "@/store/useSessionStore";

export default function MeetingRoom() {
  const { roomId = "000-000-000" } = useParams();
  const displayName = useUserStore((s) => s.displayName);
  const [params] = useSearchParams();

  const [joined, setJoined] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [webcamOn, setWebcamOn] = useState(true);
  const isHost = useSessionStore((s) => s.role) === "host" || params.get("role") === "host";

  useEffect(() => {
    if (params.get("role") === "host") {
      useSessionStore.getState().setRole("host");
    }
  }, [params]);

  const handleJoin = async ({
    micOn: m,
    webcamOn: w,
    name: n,
  }: {
    micOn: boolean;
    webcamOn: boolean;
    name: string;
  }) => {
    setMicOn(m);
    setWebcamOn(w);
    const userName = n || displayName || "Guest";

    if (n) {
      useUserStore.getState().setDisplayName(n);
    }

    try {
      const res = await fetch(
        `/api/livekit/token?room=${encodeURIComponent(roomId)}&username=${encodeURIComponent(userName)}`
      );
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setWsUrl(data.wsUrl || import.meta.env.VITE_LIVEKIT_URL);
      }
    } catch (error) {
      console.error("Error al obtener token de LiveKit:", error);
    }

    setJoined(true);
  };

  if (!joined) {
    return <PreJoin onJoin={handleJoin} initialName={displayName} roomId={roomId} />;
  }

  if (!token || !wsUrl) {
    return (
      <div className="flex h-screen items-center justify-center bg-stage text-white">
        <p className="animate-pulse">Conectando a la sala...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={wsUrl}
      token={token}
      connect={true}
      video={webcamOn}
      audio={micOn}
      data-lk-theme="default"
    >
      <LiveMeeting
        roomId={roomId}
        isHost={isHost}
        initialMicOn={micOn}
        initialWebcamOn={webcamOn}
      />
    </LiveKitRoom>
  );
}