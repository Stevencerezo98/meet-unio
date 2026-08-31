import { useRef, useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";

interface WhiteboardModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WhiteboardModal({ open, onClose }: WhiteboardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#2d8cff");
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high DPI canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, [open]);

  if (!open) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative flex flex-col h-[85vh] w-full max-w-4xl rounded-2xl bg-[#242424] text-white shadow-2xl ring-1 ring-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-6 border-b border-white/10 bg-[#1f1f1f]">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">Pizarra Colaborativa</h2>
            <div className="flex items-center gap-1.5 ml-4">
              {["#000000", "#2d8cff", "#63c454", "#cc3b33", "#f5c518"].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    color === c ? "scale-125 ring-2 ring-white" : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 ml-3">
              {[2, 4, 8].map((w) => (
                <button
                  key={w}
                  onClick={() => setLineWidth(w)}
                  className={`px-2 py-0.5 rounded text-xs ${
                    lineWidth === w ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCanvas}
              title="Limpiar pizarra"
              className="flex h-8 px-2.5 items-center gap-1 rounded-lg text-xs text-gray-300 hover:bg-white/10 hover:text-white"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Limpiar</span>
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
              aria-label="Cerrar panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-white p-2">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="h-full w-full cursor-crosshair rounded-lg touch-none"
          />
        </div>
      </div>
    </div>
  );
}
