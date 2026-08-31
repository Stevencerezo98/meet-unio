import { useEffect, useRef, useState, useCallback } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import type { ParticipantInfo } from "@/components/meeting/ParticipantTile";

interface UsePictureInPictureOptions {
  activeSpeaker?: ParticipantInfo;
  allParticipants?: ParticipantInfo[];
  roomId?: string;
  isMeetingActive?: boolean;
}

export function usePictureInPicture({
  activeSpeaker,
  allParticipants = [],
  roomId = "Zoom Meeting",
  isMeetingActive = true,
}: UsePictureInPictureOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPipActive, setIsPipActive] = useState(false);
  const [isPipSupported, setIsPipSupported] = useState(true);
  const [inAppPipOpen, setInAppPipOpen] = useState(false);
  const autoPipEnabled = useThemeStore((s) => s.autoPipEnabled);
  const animFrameRef = useRef<number | null>(null);

  // Check support on mount
  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsPipSupported("pictureInPictureEnabled" in document);
    }
  }, []);

  // Initialize hidden canvas and video element for PiP synthesis
  useEffect(() => {
    if (!isMeetingActive) return;

    if (!canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      canvasRef.current = canvas;
    }

    if (!videoRef.current) {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      Object.assign(video, { autoPictureInPicture: true });
      video.style.position = "fixed";
      video.style.width = "1px";
      video.style.height = "1px";
      video.style.opacity = "0.01";
      video.style.pointerEvents = "none";
      video.style.top = "-9999px";
      document.body.appendChild(video);
      videoRef.current = video;

      try {
        const stream = canvasRef.current.captureStream(30);
        video.srcObject = stream;
        video.play().catch(() => {});
      } catch (err) {
        console.warn("Capture stream error", err);
      }

      const onEnter = () => setIsPipActive(true);
      const onLeave = () => setIsPipActive(false);

      video.addEventListener("enterpictureinpicture", onEnter);
      video.addEventListener("leavepictureinpicture", onLeave);

      return () => {
        video.removeEventListener("enterpictureinpicture", onEnter);
        video.removeEventListener("leavepictureinpicture", onLeave);
        if (video.parentNode) {
          video.parentNode.removeChild(video);
        }
        videoRef.current = null;
      };
    }
  }, [isMeetingActive]);

  // Render loop to canvas for crisp PiP streaming
  useEffect(() => {
    if (!isMeetingActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localVideoElement: HTMLVideoElement | null = null;
    if (activeSpeaker?.videoTrack) {
      localVideoElement = document.createElement("video");
      localVideoElement.srcObject = new MediaStream([activeSpeaker.videoTrack]);
      localVideoElement.muted = true;
      localVideoElement.play().catch(() => {});
    }

    const render = () => {
      ctx.fillStyle = "#1e1e1e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (activeSpeaker?.webcamOn && localVideoElement && localVideoElement.readyState >= 2) {
        // Draw video feed
        ctx.save();
        ctx.drawImage(localVideoElement, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        // Draw elegant avatar & name for PiP
        const speakerName = activeSpeaker?.name || "Participant";
        const initial = speakerName.charAt(0).toUpperCase();

        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, "#1f2937");
        grad.addColorStop(1, "#111827");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Avatar circle
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 - 20, 50, 0, Math.PI * 2);
        ctx.fillStyle = activeSpeaker?.color || "#2d8cff";
        ctx.fill();

        if (activeSpeaker?.isSpeaking) {
          ctx.lineWidth = 4;
          ctx.strokeStyle = "#d7d966";
          ctx.stroke();
        }

        // Avatar Initial
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 42px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(initial, canvas.width / 2, canvas.height / 2 - 20);

        // Speaker Name
        ctx.fillStyle = "#ffffff";
        ctx.font = "600 20px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(speakerName, canvas.width / 2, canvas.height / 2 + 55);
      }

      // Bottom bar overlay in PiP
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

      // Name & Status text
      ctx.fillStyle = "#ffffff";
      ctx.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const micText = activeSpeaker?.micOn ? "🎙️ Activo" : "🔇 Silenciado";
      ctx.fillText(`${activeSpeaker?.name || "Zoom"} · ${micText}`, 16, canvas.height - 20);

      // Room info & count
      ctx.fillStyle = "#9ca3af";
      ctx.font = "13px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${allParticipants.length} participantes · ${roomId}`, canvas.width - 16, canvas.height - 20);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (localVideoElement) {
        localVideoElement.srcObject = null;
      }
    };
  }, [activeSpeaker, allParticipants.length, roomId, isMeetingActive]);

  // Request PiP function
  const requestPip = useCallback(async () => {
    if (!videoRef.current) return false;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
      await videoRef.current.play();
      await videoRef.current.requestPictureInPicture();
      setIsPipActive(true);
      return true;
    } catch (err) {
      console.warn("Could not activate native Picture-in-Picture:", err);
      // Fallback to in-app floating PiP
      setInAppPipOpen(true);
      return false;
    }
  }, []);

  // Exit PiP function
  const exitPip = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
      setIsPipActive(false);
      setInAppPipOpen(false);
    } catch (err) {
      console.warn("Exit PiP error:", err);
    }
  }, []);

  // Toggle PiP
  const togglePip = useCallback(async () => {
    if (document.pictureInPictureElement || isPipActive || inAppPipOpen) {
      await exitPip();
    } else {
      await requestPip();
    }
  }, [isPipActive, inAppPipOpen, exitPip, requestPip]);

  // Automatically trigger Picture-in-Picture on tab/window switch or minimize
  useEffect(() => {
    if (!isMeetingActive || !autoPipEnabled) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        if (!document.pictureInPictureElement && videoRef.current) {
          try {
            await videoRef.current.play();
            await videoRef.current.requestPictureInPicture();
          } catch {
            // If browser blocks without gesture, activate floating PiP overlay
            setInAppPipOpen(true);
          }
        }
      }
    };

    const handleWindowBlur = async () => {
      if (autoPipEnabled && !document.pictureInPictureElement && videoRef.current) {
        try {
          await videoRef.current.play();
          await videoRef.current.requestPictureInPicture();
        } catch {
          // Handled gracefully
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isMeetingActive, autoPipEnabled]);

  return {
    isPipActive: isPipActive || inAppPipOpen,
    isNativePip: isPipActive,
    isPipSupported,
    inAppPipOpen,
    setInAppPipOpen,
    requestPip,
    exitPip,
    togglePip,
  };
}
