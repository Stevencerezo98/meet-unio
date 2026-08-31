import { useState, useRef } from "react";
import { X, Send, Paperclip, FileText, Download } from "lucide-react";
import type { MockChatMessage } from "@/lib/mock";
import { cn } from "@/lib/cn";

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  url: string;
}

export interface ChatMessageItem extends MockChatMessage {
  files?: AttachedFile[];
}

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMessageItem[];
  onSendMessage: (text: string, files?: AttachedFile[]) => void;
  participants: { id: string; name: string }[];
}

export default function ChatPanel({
  open,
  onClose,
  messages,
  onSendMessage,
  participants,
}: ChatPanelProps) {
  const [text, setText] = useState("");
  const [recipient, setRecipient] = useState("Todos");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    // File size cap: 10MB per file
    const MAX_SIZE = 10 * 1024 * 1024;
    const oversized = selected.find((f) => f.size > MAX_SIZE);
    if (oversized) {
      setFileError("Cada archivo debe pesar menos de 10 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Max 2 files cap
    let toAdd = selected;
    if (attachedFiles.length + selected.length > 2) {
      setFileError("Puedes adjuntar hasta 2 archivos por mensaje.");
      toAdd = selected.slice(0, 2 - attachedFiles.length);
    }

    const newAttached = toAdd.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      url: URL.createObjectURL(f),
    }));

    setAttachedFiles((prev) => [...prev, ...newAttached].slice(0, 2));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSend = () => {
    if (!text.trim() && attachedFiles.length === 0) return;
    onSendMessage(text.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
    setText("");
    setAttachedFiles([]);
    setFileError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full w-full sm:w-[340px] flex-col border-l border-panel-border bg-portal-card text-text-primary shadow-2xl z-30 select-none animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex h-12 items-center justify-between px-4 border-b border-panel-border">
        <h2 className="text-sm font-semibold text-text-primary">Chat de la reunión</h2>
        <button
          onClick={onClose}
          aria-label="Cerrar panel"
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-xs text-text-secondary">
            No hay mensajes aún. ¡Saluda a todos!
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="space-y-1">
              <div className="flex items-baseline justify-between text-[11px]">
                <span
                  className={cn(
                    "font-semibold truncate max-w-[170px]",
                    m.isLocal ? "text-zoom-blue" : "text-text-primary"
                  )}
                >
                  {m.senderName}
                  {m.toName && m.toName !== "Everyone" && m.toName !== "Todos" && (
                    <span className="font-normal text-amber-500 ml-1">
                      (Directo a {m.toName})
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-text-secondary">{m.timestamp}</span>
              </div>

              {/* Message text */}
              {m.message && (
                <div
                  className={cn(
                    "rounded-xl px-3 py-2 text-xs leading-relaxed break-words",
                    m.isLocal
                      ? "bg-zoom-blue/15 border border-zoom-blue/30 text-text-primary font-medium"
                      : "bg-portal-bg border border-portal-border text-text-primary"
                  )}
                >
                  {m.message}
                </div>
              )}

              {/* Attached files */}
              {m.files && m.files.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {m.files.map((file) => (
                    <a
                      key={file.id}
                      href={file.url}
                      download={file.name}
                      role="button"
                      aria-label={`Descargar ${file.name}`}
                      className="flex items-center justify-between gap-2 rounded-lg bg-portal-bg p-2 text-xs hover:bg-hover transition-colors border border-portal-border group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 shrink-0 text-zoom-blue" />
                        <span className="font-medium text-text-primary truncate max-w-[180px]">
                          {file.name}
                        </span>
                      </div>
                      <Download className="h-3.5 w-3.5 shrink-0 text-text-secondary group-hover:text-text-primary" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Recipient Selector ("To: Everyone") */}
      <div className="px-3 pt-2 pb-1 border-t border-panel-border bg-portal-card text-[11px] flex items-center gap-1.5">
        <span className="text-text-secondary">Para:</span>
        <select
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="bg-portal-bg text-text-primary rounded px-2 py-0.5 outline-none border border-portal-border text-xs"
        >
          <option value="Todos">Todos</option>
          {participants
            .filter((p) => p.name !== "You" && p.name !== "Tú")
            .map((p) => (
              <option key={p.id} value={p.name}>
                {p.name} (Mensaje directo)
              </option>
            ))}
        </select>
      </div>

      {/* Attached Files Preview & Errors */}
      {fileError && (
        <div className="px-3 py-1 bg-leave/20 text-leave text-[11px] font-medium border-t border-leave/20">
          {fileError}
        </div>
      )}

      {attachedFiles.length > 0 && (
        <div className="px-3 py-1.5 bg-portal-bg flex flex-wrap gap-1.5 border-t border-panel-border">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-1.5 rounded bg-portal-card border border-portal-border px-2 py-1 text-[11px] text-text-primary"
            >
              <FileText className="h-3 w-3 text-zoom-blue" />
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button
                onClick={() => removeFile(file.id)}
                className="text-text-secondary hover:text-text-primary ml-1"
                aria-label={`Quitar ${file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 bg-portal-card border-t border-panel-border flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-hover text-text-secondary hover:text-text-primary transition-colors"
          title="Adjuntar archivo (máx. 2, menores a 10MB)"
          aria-label="Adjuntar archivo"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje aquí..."
          className="flex-1 rounded-lg bg-portal-bg px-3 py-2 text-xs text-text-primary placeholder-text-secondary outline-none border border-portal-border focus:border-zoom-blue"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() && attachedFiles.length === 0}
          aria-label="Enviar mensaje"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zoom-blue text-white hover:bg-zoom-blue-hover disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
