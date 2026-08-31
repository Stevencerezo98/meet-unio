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
    if (n) {
      useUserStore.getState().setDisplayName(n);
    }

    // Try fetching livekit token if server exists, otherwise continue directly
    try {
      const res = await fetch(
        `/api/livekit/token?room=${roomId}&username=${encodeURIComponent(n || displayName || "Guest")}`
      );
      if (res.ok) {
        await res.json();
      }
    } catch {
      // Offline / standalone fallback
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
      isHost={isHost}
      initialMicOn={micOn}
      initialWebcamOn={webcamOn}
    />
  );
}
