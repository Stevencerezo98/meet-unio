import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import PreJoin from "@/components/meeting/PreJoin";
import LiveMeeting from "@/components/meeting/LiveMeeting";
import { useUserStore } from "@/store/useUserStore";
import { useSessionStore } from "@/store/useSessionStore";

export default function MeetingRoom() {
  const { roomId = "000-000-000" } = useParams();
  const navigate = useNavigate();
  const displayName = useUserStore((s) => s.displayName);
  const [params] = useSearchParams();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (params.get("role") === "host") useSessionStore.getState().setRole("host");
  }, [params]);

  const [joined, setJoined] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [webcamOn, setWebcamOn] = useState(true);

  const leave = (reason?: string) =>
    navigate("/", reason ? { state: { toast: reason } } : undefined);

  const handleJoin = async ({ micOn: m, webcamOn: w }: { micOn: boolean; webcamOn: boolean }) => {
    setMicOn(m);
    setWebcamOn(w);

    const res = await fetch(`/api/livekit/token?room=${roomId}&username=${encodeURIComponent(displayName || "Guest")}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to join meeting");
    }
    const data = await res.json();
    setToken(data.token);
    
    setJoined(true);
  };

  if (!joined || !token) {
    return <PreJoin onJoin={handleJoin} />;
  }

  return (
    <LiveMeeting
      key={roomId}
      roomId={roomId}
      name={displayName}
      micOn={micOn}
      webcamOn={webcamOn}
      token={token}
      onLeave={leave}
    />
  );
}
