import { PreJoin as LKPreJoin, LocalUserChoices } from "@livekit/components-react";
import "@livekit/components-styles";

interface PreJoinProps {
  onJoin: (opts: { micOn: boolean; webcamOn: boolean; name: string }) => void | Promise<void>;
}

export default function PreJoin({ onJoin }: PreJoinProps) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-stage" data-lk-theme="default">
      <LKPreJoin
        defaults={{
          audioEnabled: true,
          videoEnabled: true,
          username: "Guest",
        }}
        onSubmit={(values: LocalUserChoices) => {
          onJoin({
            micOn: values.audioEnabled,
            webcamOn: values.videoEnabled,
            name: values.username,
          });
        }}
        onError={(err: Error) => {
          console.error(err);
        }}
      />
    </div>
  );
}
