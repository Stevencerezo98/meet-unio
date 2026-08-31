import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import PreJoin from "@/components/meeting/PreJoin";
import LiveMeeting from "@/components/meeting/LiveMeeting";
import { useUserStore } from "@/store/useUserStore";
import { useSessionStore } from "@/store/useSessionStore";

export default function MeetingRoom() {
  const { roomId = "000-000-000" } = useParams();
  const displayName = useUserStore((s) => s.displayName);
  const [params] = useSearchParams();

  useEffect(() => {
    if (params.get("role") === "host") {
      useSessionStore.getState().setRole("host");
    }
  }, [params]);

  const [joined, setJoined] = useState(false);
  const [token, setToken] = useState<string | null>(null); // Estado para almacenar el JWT de LiveKit
  const [micOn, setMicOn] = useState(true);
  const [webcamOn, setWebcamOn] = useState(true);
  const isHost = useSessionStore((s) => s.role) === "host" || params.get("role") === "host";

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
        `/api/livekit/token?room=${roomId}&username=${encodeURIComponent(userName)}`
      );
      if (res.ok) {
        const data = await res.json();
        // Guarda el token recibido desde el backend
        setToken(data.token); 
      }
    } catch (error) {
      console.error("Error al obtener el token de LiveKit:", error);
    }

    setJoined(true);
  };

  if (!joined) {
    return <PreJoin onJoin={handleJoin} initialName={displayName} roomId={roomId} />;
  }

  return (
    <LiveMeeting
      key={roomId}
      roomId={roomId}
      token={token} // <-- Pasa el token al componente que conecta a la videoconferencia
      isHost={isHost}
      initialMicOn={micOn}
      initialWebcamOn={webcamOn}
    />
  );
}