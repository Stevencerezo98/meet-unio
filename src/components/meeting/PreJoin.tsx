import { useState, useRef, useEffect } from "react";
import { Video, Mic, MicOff, VideoOff, ShieldCheck } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useUserStore } from "@/store/useUserStore";

interface PreJoinProps {
  onJoin: (opts: { micOn: boolean; webcamOn: boolean; name: string }) => void | Promise<void>;
  initialName?: string;
  roomId?: string;
}

export default function PreJoin({ onJoin, initialName, roomId }: PreJoinProps) {
  const storeName = useUserStore((s) => s.displayName);
  const setStoreName = useUserStore((s) => s.setDisplayName);
  const [name, setName] = useState(initialName || storeName || "");
  const [micOn, setMicOn] = useState(true);
  const [webcamOn, setWebcamOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize camera preview
  useEffect(() => {
    let localStream: MediaStream | null = null;

    if (webcamOn) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          localStream = s;
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch(() => {
          // Camera permission denied or not available
          setStream(null);
        });
    } else {
      setStream(null);
    }

    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [webcamOn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || "Invitado";
    setStoreName(finalName);
    onJoin({
      micOn,
      webcamOn,
      name: finalName,
    });
  };

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center bg-stage px-4 py-8 text-white select-none">
      {/* Top logo */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zoom-blue text-white shadow-md">
          <Video className="h-5 w-5 fill-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">zoom</span>
      </div>

      {/* Main card */}
      <div className="w-full max-w-xl rounded-2xl bg-[#242424] p-6 shadow-2xl ring-1 ring-white/10 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-100">¿Listo para unirte?</h1>
            {roomId && (
              <p className="text-xs text-text-secondary">
                ID de reunión: <span className="font-mono text-gray-300">{roomId}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Seguro</span>
          </div>
        </div>

        {/* Video Preview Box */}
        <div className="relative mb-6 flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
          {webcamOn && stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar
                name={name || "Invitado"}
                color="#3b6ea5"
                size={84}
                className="ring-4 ring-white/10"
              />
              <span className="text-xs text-gray-400">Cámara apagada</span>
            </div>
          )}

          {/* Floating preview toggles */}
          <div className="absolute bottom-3 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md p-1.5 ring-1 ring-white/10">
            <button
              type="button"
              onClick={() => setMicOn(!micOn)}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                micOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-leave text-white"
              }`}
              title={micOn ? "Silenciar micrófono" : "Reactivar micrófono"}
            >
              {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setWebcamOn(!webcamOn)}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                webcamOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-leave text-white"
              }`}
              title={webcamOn ? "Apagar cámara" : "Encender cámara"}
            >
              {webcamOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Form controls */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-300">
              Tu nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingresa tu nombre"
              className="w-full rounded-lg bg-[#191919] px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none border border-white/10 focus:border-zoom-blue focus:ring-1 focus:ring-zoom-blue transition-all"
            />
          </div>

          <div className="flex flex-col gap-2 pt-1 text-xs text-gray-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!micOn}
                onChange={(e) => setMicOn(!e.target.checked)}
                className="h-4 w-4 rounded accent-zoom-blue"
              />
              <span>No conectar al audio</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!webcamOn}
                onChange={(e) => setWebcamOn(!e.target.checked)}
                className="h-4 w-4 rounded accent-zoom-blue"
              />
              <span>Desactivar mi video</span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-zoom-blue py-3 text-sm font-semibold text-white shadow-md hover:bg-zoom-blue-hover active:bg-zoom-blue-pressed transition-colors"
            >
              Entrar a la reunión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
