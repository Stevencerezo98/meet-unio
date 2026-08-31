import { useState } from "react";
import {
  X,
  Laptop,
  Sun,
  Moon,
  Tv,
  Mic,
  Video,
  Settings,
  Volume2,
  Check,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { useThemeStore, type ThemeMode } from "@/store/useThemeStore";
import { cn } from "@/lib/cn";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onTestPip?: () => void;
}

type TabType = "general" | "appearance" | "backgrounds" | "pip" | "audio" | "video";

export default function SettingsModal({ open, onClose, onTestPip }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("appearance");
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);
  const autoPipEnabled = useThemeStore((s) => s.autoPipEnabled);
  const setAutoPipEnabled = useThemeStore((s) => s.setAutoPipEnabled);

  const [selectedMic, setSelectedMic] = useState("Micrófono integrado predeterminado");
  const [selectedSpeaker, setSelectedSpeaker] = useState("Altavoz integrado predeterminado");
  const [selectedCamera, setSelectedCamera] = useState("Cámara integrada (FaceTime HD)");
  const [mirrorVideo, setMirrorVideo] = useState(true);
  const [hdVideo, setHdVideo] = useState(true);
  const [pipTesting, setPipTesting] = useState(false);

  // Virtual Backgrounds
  const [selectedBg, setSelectedBg] = useState<string>("none");
  const [selectedFilter, setSelectedFilter] = useState<string>("none");

  if (!open) return null;

  const virtualBackgrounds = [
    { id: "none", label: "Ninguno", preview: "bg-neutral-800" },
    { id: "blur-low", label: "Desenfoque suave", preview: "bg-neutral-700 backdrop-blur-sm" },
    { id: "blur-high", label: "Desenfoque intenso", preview: "bg-neutral-600 backdrop-blur-md" },
    {
      id: "office",
      label: "Oficina moderna",
      preview: "bg-gradient-to-tr from-slate-800 via-sky-900 to-indigo-950",
    },
    {
      id: "library",
      label: "Biblioteca acogedora",
      preview: "bg-gradient-to-tr from-amber-950 via-stone-900 to-neutral-900",
    },
    {
      id: "beach",
      label: "Playa al atardecer",
      preview: "bg-gradient-to-tr from-rose-900 via-orange-950 to-amber-900",
    },
    {
      id: "studio",
      label: "Loft minimalista",
      preview: "bg-gradient-to-tr from-slate-900 via-zinc-800 to-neutral-900",
    },
  ];

  const videoFilters = [
    { id: "none", label: "Normal" },
    { id: "studio-light", label: "Luz de estudio" },
    { id: "warm-glow", label: "Tono cálido" },
    { id: "soft-focus", label: "Retoque suave de piel" },
    { id: "noir", label: "Monocromático Noir" },
  ];

  if (!open) return null;

  const handleTestPip = async () => {
    setPipTesting(true);
    try {
      if (onTestPip) {
        onTestPip();
      }
    } catch {
      // Ignored
    }
    setTimeout(() => setPipTesting(false), 2000);
  };

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      mode: "system",
      label: "Sistema",
      icon: <Laptop className="h-5 w-5" />,
      desc: "Sigue la configuración de tema de tu sistema operativo",
    },
    {
      mode: "light",
      label: "Modo Claro",
      icon: <Sun className="h-5 w-5 text-amber-500" />,
      desc: "Interfaz limpia y luminosa estilo Zoom Light",
    },
    {
      mode: "dark",
      label: "Modo Oscuro",
      icon: <Moon className="h-5 w-5 text-indigo-400" />,
      desc: "Fondo oscuro relajante para la vista",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex flex-col md:flex-row h-[560px] w-full max-w-2xl rounded-2xl bg-portal-card text-text-primary shadow-2xl ring-1 ring-portal-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Left Navigation Sidebar */}
        <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-portal-border bg-portal-bg/60 p-3 flex md:flex-col gap-1 shrink-0 overflow-x-auto md:overflow-x-visible">
          <div className="hidden md:flex items-center gap-2 px-3 py-2.5 mb-2 font-semibold text-sm text-text-primary">
            <Settings className="h-4 w-4 text-zoom-blue" />
            <span>Configuración</span>
          </div>

          <button
            onClick={() => setActiveTab("appearance")}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left shrink-0",
              activeTab === "appearance"
                ? "bg-zoom-blue text-white shadow-sm"
                : "text-text-secondary hover:bg-hover hover:text-text-primary"
            )}
          >
            <Sun className="h-4 w-4" />
            <span>Tema y Apariencia</span>
          </button>

          <button
            onClick={() => setActiveTab("backgrounds")}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left shrink-0",
              activeTab === "backgrounds"
                ? "bg-zoom-blue text-white shadow-sm"
                : "text-text-secondary hover:bg-hover hover:text-text-primary"
            )}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Fondos y Filtros</span>
          </button>

          <button
            onClick={() => setActiveTab("pip")}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left shrink-0",
              activeTab === "pip"
                ? "bg-zoom-blue text-white shadow-sm"
                : "text-text-secondary hover:bg-hover hover:text-text-primary"
            )}
          >
            <Tv className="h-4 w-4" />
            <span>Picture-in-Picture</span>
          </button>

          <button
            onClick={() => setActiveTab("video")}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left shrink-0",
              activeTab === "video"
                ? "bg-zoom-blue text-white shadow-sm"
                : "text-text-secondary hover:bg-hover hover:text-text-primary"
            )}
          >
            <Video className="h-4 w-4" />
            <span>Video</span>
          </button>

          <button
            onClick={() => setActiveTab("audio")}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left shrink-0",
              activeTab === "audio"
                ? "bg-zoom-blue text-white shadow-sm"
                : "text-text-secondary hover:bg-hover hover:text-text-primary"
            )}
          >
            <Mic className="h-4 w-4" />
            <span>Audio</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden bg-portal-card">
          {/* Header */}
          <div className="flex h-14 items-center justify-between px-6 border-b border-portal-border shrink-0">
            <h2 className="text-base font-semibold text-text-primary">
              {activeTab === "appearance" && "Tema y Apariencia"}
              {activeTab === "backgrounds" && "Fondos Virtuales y Filtros"}
              {activeTab === "pip" && "Configuración Picture-in-Picture"}
              {activeTab === "video" && "Configuración de Video"}
              {activeTab === "audio" && "Configuración de Audio"}
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-1">
                    Tema de la Aplicación
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Elige cómo deseas ver la interfaz de Zoom o déjala sincronizada con tu sistema operativo.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {themeOptions.map((opt) => {
                    const isSelected = themeMode === opt.mode;
                    return (
                      <button
                        key={opt.mode}
                        onClick={() => setThemeMode(opt.mode)}
                        className={cn(
                          "relative flex flex-col items-start p-4 rounded-xl text-left border transition-all",
                          isSelected
                            ? "border-zoom-blue bg-zoom-blue/5 ring-2 ring-zoom-blue shadow-sm"
                            : "border-portal-border hover:bg-hover"
                        )}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <div className="p-2 rounded-lg bg-portal-bg border border-portal-border">
                            {opt.icon}
                          </div>
                          {isSelected && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zoom-blue text-white">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-text-primary mb-1">
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-text-secondary leading-relaxed">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-xl border border-portal-border bg-portal-bg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-zoom-blue" />
                    <span className="text-xs font-semibold text-text-primary">
                      Información de Modo Claro
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Al seleccionar <strong>Modo Claro</strong>, tanto las salas de reuniones como el portal principal adoptan una paleta blanca y suave con alto contraste en los controles para una experiencia cómoda durante el día.
                  </p>
                </div>
              </div>
            )}

            {/* Backgrounds & Filters Tab */}
            {activeTab === "backgrounds" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-1">
                    Fondos Virtuales
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Selecciona una imagen o desenfoque para reemplazar tu fondo real en la videollamada.
                  </p>
                </div>

                {/* Virtual Backgrounds Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {virtualBackgrounds.map((bg) => {
                    const isSelected = selectedBg === bg.id;
                    return (
                      <button
                        key={bg.id}
                        onClick={() => setSelectedBg(bg.id)}
                        className={cn(
                          "group relative flex flex-col items-center justify-center h-24 rounded-xl border overflow-hidden transition-all text-center p-2",
                          bg.preview,
                          isSelected
                            ? "border-zoom-blue ring-2 ring-zoom-blue shadow-md"
                            : "border-portal-border hover:border-text-secondary"
                        )}
                      >
                        <span className="relative z-10 text-xs font-medium text-white drop-shadow">
                          {bg.label}
                        </span>
                        {isSelected && (
                          <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-zoom-blue text-white shadow">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Studio Video Filters */}
                <div className="pt-3 border-t border-portal-border">
                  <h3 className="text-sm font-medium text-text-primary mb-1 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-zoom-blue" />
                    <span>Filtros de Video & Retoque</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {videoFilters.map((f) => {
                      const isSelected = selectedFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFilter(f.id)}
                          className={cn(
                            "px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all",
                            isSelected
                              ? "border-zoom-blue bg-zoom-blue/10 text-zoom-blue"
                              : "border-portal-border bg-portal-bg text-text-primary hover:bg-hover"
                          )}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PiP Tab */}
            {activeTab === "pip" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-1">
                    Picture-in-Picture (PiP) Automático
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Mantén la vista del orador o de la reunión flotando sobre otras aplicaciones cuando minimices o cambies de ventana.
                  </p>
                </div>

                <div className="rounded-xl border border-portal-border bg-portal-bg p-4 space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPipEnabled}
                      onChange={(e) => setAutoPipEnabled(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded accent-zoom-blue"
                    />
                    <div>
                      <span className="block text-xs font-medium text-text-primary">
                        Activar Picture-in-Picture automáticamente al salir de la pantalla o minimizar
                      </span>
                      <span className="block text-[11px] text-text-secondary mt-0.5">
                        Al cambiar de pestaña o ventana del navegador, el video pasará instantáneamente a una mini-ventana flotante en tu escritorio.
                      </span>
                    </div>
                  </label>

                  <div className="pt-2 border-t border-portal-border flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-medium text-text-primary">
                        Probar Picture-in-Picture
                      </span>
                      <span className="block text-[11px] text-text-secondary">
                        Lanza una ventana de prueba para verificar compatibilidad
                      </span>
                    </div>
                    <button
                      onClick={handleTestPip}
                      disabled={pipTesting}
                      className="rounded-lg bg-zoom-blue px-3.5 py-1.5 text-xs font-medium text-white hover:bg-zoom-blue-hover active:bg-zoom-blue-pressed transition-colors flex items-center gap-1.5"
                    >
                      <Tv className="h-3.5 w-3.5" />
                      <span>{pipTesting ? "Abriendo PiP..." : "Probar PiP"}</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-portal-border p-4 bg-portal-bg/40 text-xs text-text-secondary space-y-1">
                  <span className="font-semibold text-text-primary block">
                    Consejo de Uso:
                  </span>
                  <p>
                    Puedes hacer clic en el botón <strong>PiP</strong> en la barra superior o controles durante cualquier llamada para fijar la ventana flotante en tu pantalla.
                  </p>
                </div>
              </div>
            )}

            {/* Video Tab */}
            {activeTab === "video" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">
                    Cámara
                  </label>
                  <select
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="w-full rounded-lg border border-portal-border bg-portal-bg px-3 py-2 text-xs text-text-primary outline-none focus:border-zoom-blue"
                  >
                    <option value="FaceTime HD Camera (Built-in)">FaceTime HD Camera (Built-in)</option>
                    <option value="USB Video Capture">USB HD Webcam</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mirrorVideo}
                      onChange={(e) => setMirrorVideo(e.target.checked)}
                      className="h-4 w-4 rounded accent-zoom-blue"
                    />
                    <span>Reflejar mi video (Efecto espejo)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hdVideo}
                      onChange={(e) => setHdVideo(e.target.checked)}
                      className="h-4 w-4 rounded accent-zoom-blue"
                    />
                    <span>Habilitar HD en pantalla completa</span>
                  </label>
                </div>
              </div>
            )}

            {/* Audio Tab */}
            {activeTab === "audio" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">
                    Micrófono
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedMic}
                      onChange={(e) => setSelectedMic(e.target.value)}
                      className="flex-1 rounded-lg border border-portal-border bg-portal-bg px-3 py-2 text-xs text-text-primary outline-none focus:border-zoom-blue"
                    >
                      <option value="Default Microphone (Built-in)">Default Microphone (Built-in)</option>
                      <option value="Headphones Mic">Auriculares con Micrófono</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">
                    Altavoz
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedSpeaker}
                      onChange={(e) => setSelectedSpeaker(e.target.value)}
                      className="flex-1 rounded-lg border border-portal-border bg-portal-bg px-3 py-2 text-xs text-text-primary outline-none focus:border-zoom-blue"
                    >
                      <option value="Default Speaker (Built-in)">Default Speaker (Built-in)</option>
                      <option value="External Speakers">Altavoces externos</option>
                    </select>
                    <button className="flex items-center gap-1 rounded-lg border border-portal-border bg-portal-bg px-3 py-2 text-xs font-medium text-text-primary hover:bg-hover">
                      <Volume2 className="h-3.5 w-3.5 text-zoom-blue" />
                      <span>Probar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-3.5 border-t border-portal-border shrink-0 bg-portal-bg/30">
            <button
              onClick={onClose}
              className="rounded-lg bg-zoom-blue px-4 py-1.5 text-xs font-semibold text-white hover:bg-zoom-blue-hover active:bg-zoom-blue-pressed transition-colors"
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
