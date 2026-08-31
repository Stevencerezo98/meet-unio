import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";

interface LiveMeetingProps {
  roomId: string;
  name: string;
  micOn: boolean;
  webcamOn: boolean;
  token: string;
  onLeave: (reason?: string) => void;
}

export default function LiveMeeting({
  micOn,
  webcamOn,
  token,
  onLeave,
}: LiveMeetingProps) {
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL;

  if (!serverUrl) {
    return <div className="text-white p-8 flex items-center justify-center h-screen bg-neutral-900">VITE_LIVEKIT_URL is not set</div>;
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={micOn}
      video={webcamOn}
      onDisconnected={() => onLeave("You left the meeting")}
      data-lk-theme="default"
      style={{ height: "100vh" }}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
