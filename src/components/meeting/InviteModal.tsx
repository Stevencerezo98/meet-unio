import { useState } from "react";
import { X, Copy, Check, Mail, UserPlus, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  topic?: string;
  hostName?: string;
}

export default function InviteModal({
  open,
  onClose,
  roomId,
  topic = "Zoom Meeting",
  hostName = "Host",
}: InviteModalProps) {
  const [tab, setTab] = useState<"link" | "contacts">("link");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);
  const [searchContact, setSearchContact] = useState("");
  const [invitedContacts, setInvitedContacts] = useState<string[]>([]);

  if (!open) return null;

  const meetingUrl = `${window.location.origin}/meeting/${roomId}`;
  const passcode = "884920";

  const fullInvitationText = `${hostName} te está invitando a una reunión programada de Zoom.

Tema: ${topic}
Hora: Hoy

Unirse a la reunión de Zoom:
${meetingUrl}

ID de reunión: ${roomId}
Código de acceso: ${passcode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyFull = () => {
    navigator.clipboard.writeText(fullInvitationText);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleEmailInvite = (service: "default" | "gmail" | "yahoo") => {
    const subject = encodeURIComponent(`Invitación a reunión de Zoom: ${topic}`);
    const body = encodeURIComponent(fullInvitationText);

    if (service === "gmail") {
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
        "_blank"
      );
    } else if (service === "yahoo") {
      window.open(
        `https://compose.mail.yahoo.com/?subject=${subject}&body=${body}`,
        "_blank"
      );
    } else {
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  const mockContacts = [
    { id: "c1", name: "David Chen", email: "david.c@empresa.com", status: "En línea" },
    { id: "c2", name: "Sarah Jenkins", email: "sarah.j@empresa.com", status: "Disponible" },
    { id: "c3", name: "Michael Chang", email: "m.chang@empresa.com", status: "En reunión" },
    { id: "c4", name: "Elena Rostova", email: "elena.r@empresa.com", status: "En línea" },
  ];

  const filteredContacts = mockContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
      c.email.toLowerCase().includes(searchContact.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex flex-col w-full max-w-lg rounded-2xl bg-portal-card text-text-primary shadow-2xl ring-1 ring-portal-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-5 border-b border-portal-border shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-zoom-blue" />
            <h2 className="text-sm font-semibold text-text-primary">
              Invitar personas a unirse a la reunión
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-portal-border px-5 pt-2 bg-portal-bg/40">
          <button
            onClick={() => setTab("link")}
            className={cn(
              "pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors",
              tab === "link"
                ? "border-zoom-blue text-zoom-blue"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            Email y enlace de invitación
          </button>
          <button
            onClick={() => setTab("contacts")}
            className={cn(
              "pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors",
              tab === "contacts"
                ? "border-zoom-blue text-zoom-blue"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            Directorio de contactos
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
          {tab === "link" ? (
            <>
              {/* Meeting info box */}
              <div className="rounded-xl border border-portal-border bg-portal-bg p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-500 font-medium pb-1.5 border-b border-portal-border">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Reunión cifrada AES de 256 bits</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-text-secondary block text-[11px]">ID de reunión:</span>
                    <span className="font-mono font-semibold text-text-primary">{roomId}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block text-[11px]">Código de acceso:</span>
                    <span className="font-mono font-semibold text-text-primary">{passcode}</span>
                  </div>
                </div>
              </div>

              {/* Direct Email Client buttons */}
              <div>
                <span className="block text-xs font-medium text-text-primary mb-2">
                  Enviar con servicio de correo:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleEmailInvite("default")}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-portal-border bg-portal-bg hover:bg-hover hover:border-zoom-blue/40 text-xs font-medium text-text-primary transition-all group"
                  >
                    <Mail className="h-5 w-5 text-zoom-blue mb-1.5 group-hover:scale-110 transition-transform" />
                    <span>Correo predeterminado</span>
                  </button>
                  <button
                    onClick={() => handleEmailInvite("gmail")}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-portal-border bg-portal-bg hover:bg-hover hover:border-zoom-blue/40 text-xs font-medium text-text-primary transition-all group"
                  >
                    <div className="h-5 w-5 flex items-center justify-center font-bold text-rose-500 text-sm mb-1.5 group-hover:scale-110 transition-transform">
                      G
                    </div>
                    <span>Gmail</span>
                  </button>
                  <button
                    onClick={() => handleEmailInvite("yahoo")}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-portal-border bg-portal-bg hover:bg-hover hover:border-zoom-blue/40 text-xs font-medium text-text-primary transition-all group"
                  >
                    <div className="h-5 w-5 flex items-center justify-center font-bold text-purple-500 text-sm mb-1.5 group-hover:scale-110 transition-transform">
                      Y!
                    </div>
                    <span>Yahoo Mail</span>
                  </button>
                </div>
              </div>

              {/* Invite URL copy input */}
              <div className="pt-2">
                <span className="block text-xs font-medium text-text-secondary mb-1">
                  Enlace de invitación:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={meetingUrl}
                    className="flex-1 rounded-lg border border-portal-border bg-portal-bg px-3 py-2 text-xs font-mono text-text-primary outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zoom-blue hover:bg-zoom-blue-hover text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedLink ? "Copiado" : "Copiar"}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Contacts Tab */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-secondary" />
                <input
                  type="text"
                  value={searchContact}
                  onChange={(e) => setSearchContact(e.target.value)}
                  placeholder="Buscar contactos por nombre o correo..."
                  className="w-full rounded-lg border border-portal-border bg-portal-bg pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder-text-secondary outline-none focus:border-zoom-blue"
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredContacts.map((contact) => {
                  const isInvited = invitedContacts.includes(contact.id);
                  return (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-portal-border bg-portal-bg hover:bg-hover transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-text-primary">
                            {contact.name}
                          </span>
                          <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            {contact.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-text-secondary block">
                          {contact.email}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (!isInvited) {
                            setInvitedContacts((prev) => [...prev, contact.id]);
                          }
                        }}
                        disabled={isInvited}
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded-lg transition-colors",
                          isInvited
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-zoom-blue text-white hover:bg-zoom-blue-hover"
                        )}
                      >
                        {isInvited ? "Invitado ✓" : "Invitar"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-portal-border bg-portal-bg/30 shrink-0">
          <button
            onClick={handleCopyFull}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-portal-border bg-portal-card hover:bg-hover text-xs font-medium text-text-primary transition-colors"
          >
            {copiedFull ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-zoom-blue" />}
            <span>{copiedFull ? "¡Invitación copiada!" : "Copiar invitación completa"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zoom-blue hover:bg-zoom-blue-hover text-white text-xs font-semibold transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
