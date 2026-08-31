import { useState, useEffect } from "react";
import {
  X,
  Search,
  Timer,
  Bot,
  FileText,
  LayoutGrid,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  Sparkles,
  Send,
  Award,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface AppsPanelProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
}

type ActiveAppId = "timer" | "ai-companion" | "notes" | "stickies" | "quiz" | null;

interface StickyNote {
  id: string;
  text: string;
  color: "yellow" | "blue" | "pink" | "green";
  author: string;
}

interface AgendaItem {
  id: string;
  text: string;
  done: boolean;
}

export default function AppsPanel({ open, onClose, roomId }: AppsPanelProps) {
  const [tab, setTab] = useState<"my-apps" | "discover">("my-apps");
  const [search, setSearch] = useState("");
  const [activeApp, setActiveApp] = useState<ActiveAppId>(null);

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min default
  const [initialSeconds, setInitialSeconds] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"countdown" | "stopwatch">("countdown");
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  // Notes State
  const [notes, setNotes] = useState<string>(
    `# Meeting Notes - Room ${roomId}\n\n- Discuss project milestones\n- Review Q3 roadmap & UX improvements\n- Assign next action items`
  );
  const [agenda, setAgenda] = useState<AgendaItem[]>([
    { id: "1", text: "Welcome & introductions", done: true },
    { id: "2", text: "Review previous meeting action items", done: true },
    { id: "3", text: "New feature demos & Q&A", done: false },
    { id: "4", text: "Next sprint planning & closing", done: false },
  ]);
  const [newAgendaText, setNewAgendaText] = useState("");
  const [copiedNotes, setCopiedNotes] = useState(false);

  // Stickies State
  const [stickies, setStickies] = useState<StickyNote[]>([
    { id: "1", text: "✨ Simplify navigation UI", color: "yellow", author: "Steven" },
    { id: "2", text: "🚀 Great progress on PiP mode!", color: "green", author: "Alex" },
    { id: "3", text: "💡 Add dark/light system sync", color: "blue", author: "Maria" },
  ]);
  const [newStickyText, setNewStickyText] = useState("");
  const [stickyColor, setStickyColor] = useState<"yellow" | "blue" | "pink" | "green">("yellow");

  // AI Companion State
  const [aiChat, setAiChat] = useState<Array<{ role: "ai" | "user"; text: string }>>([
    {
      role: "ai",
      text: "👋 Hi! I'm your Zoom AI Companion. I'm actively taking meeting notes, tracking key takeaways, and answering any questions about this call.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Quiz / Trivia State
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  const quizQuestions = [
    {
      q: "What is the key benefit of Zoom's Picture-in-Picture mode?",
      options: [
        "Keeping meeting video visible while multitasking",
        "Increasing internet download speed",
        "Changing microphone volume automatically",
        "Recording in 8K resolution",
      ],
      correct: 0,
    },
    {
      q: "Which audio setting allows raw uncompressed sound for musical instruments?",
      options: ["Echo cancellation", "Original Sound", "Low Bandwidth Mode", "Stereo Pan"],
      correct: 1,
    },
    {
      q: "What color is the active speaker highlight ring in standard Zoom UI?",
      options: ["Emerald Green", "Bright Gold / Yellow", "Electric Blue", "Crimson Red"],
      correct: 1,
    },
  ];

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerMode === "countdown") {
          setTimerSeconds((prev) => {
            if (prev <= 1) {
              setIsTimerRunning(false);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchSeconds((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMode]);

  if (!open) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAskAI = () => {
    if (!aiInput.trim()) return;
    const userQ = aiInput.trim();
    setAiChat((prev) => [...prev, { role: "user", text: userQ }]);
    setAiInput("");
    setAiGenerating(true);

    setTimeout(() => {
      let response = "";
      if (userQ.toLowerCase().includes("summary") || userQ.toLowerCase().includes("resumen")) {
        response = `📋 **Meeting Summary so far:**\n- All participants reviewed the updated Zoom interface.\n- New Light/Dark/System theme options and Picture-in-Picture workflows are verified.\n- Next steps: Finalize sprint goals and export notes.`;
      } else if (userQ.toLowerCase().includes("action") || userQ.toLowerCase().includes("tarea")) {
        response = `✅ **Current Action Items:**\n1. Review customer feedback on meeting UI.\n2. Verify system theme detection on mobile devices.\n3. Share presentation deck with all attendees.`;
      } else {
        response = `🤖 Based on the meeting context, we are focusing on room #${roomId}. I've logged your query and added it to the session record.`;
      }
      setAiChat((prev) => [...prev, { role: "ai", text: response }]);
      setAiGenerating(false);
    }, 900);
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(notes);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const appsList = [
    {
      id: "timer" as const,
      name: "Timer & Stopwatch",
      desc: "Countdown clock, Pomodoro intervals and shared stopwatch for presentations",
      icon: <Timer className="h-5 w-5 text-amber-500" />,
      tag: "Productivity",
      badge: "Built-in",
    },
    {
      id: "ai-companion" as const,
      name: "AI Companion",
      desc: "Live meeting summaries, action items, and in-meeting questions",
      icon: <Bot className="h-5 w-5 text-zoom-blue" />,
      tag: "AI & Notes",
      badge: "Smart",
    },
    {
      id: "notes" as const,
      name: "Meeting Notes & Agenda",
      desc: "Collaborative rich text, checklist and exportable minutes",
      icon: <FileText className="h-5 w-5 text-emerald-500" />,
      tag: "Collaboration",
      badge: "Essential",
    },
    {
      id: "stickies" as const,
      name: "Miro Stickies & Board",
      desc: "Brainstorming canvas with digital sticky notes and ideation",
      icon: <LayoutGrid className="h-5 w-5 text-purple-500" />,
      tag: "Whiteboard",
      badge: "Creative",
    },
    {
      id: "quiz" as const,
      name: "Kahoot / Trivia Quiz",
      desc: "Engaging interactive quizzes, icebreakers, and live participant games",
      icon: <HelpCircle className="h-5 w-5 text-rose-500" />,
      tag: "Icebreakers",
      badge: "Interactive",
    },
  ];

  const filteredApps = appsList.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full w-full sm:w-[360px] flex-col border-l border-panel-border bg-portal-card text-text-primary shadow-2xl z-30 select-none animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex h-12 items-center justify-between px-4 border-b border-panel-border shrink-0">
        {activeApp ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveApp(null)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-sm font-semibold text-text-primary capitalize">
              {appsList.find((a) => a.id === activeApp)?.name}
            </h2>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-zoom-blue/10 text-zoom-blue">
              <LayoutGrid className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-sm font-semibold text-text-primary">Zoom Apps</h2>
          </div>
        )}

        <button
          onClick={onClose}
          aria-label="Cerrar panel"
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-hover hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Content */}
      {!activeApp ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-panel-border px-3 pt-2">
            <button
              onClick={() => setTab("my-apps")}
              className={cn(
                "pb-2 px-3 text-xs font-semibold border-b-2 transition-colors",
                tab === "my-apps"
                  ? "border-zoom-blue text-zoom-blue"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              )}
            >
              My Apps ({appsList.length})
            </button>
            <button
              onClick={() => setTab("discover")}
              className={cn(
                "pb-2 px-3 text-xs font-semibold border-b-2 transition-colors",
                tab === "discover"
                  ? "border-zoom-blue text-zoom-blue"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              )}
            >
              Discover
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-panel-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-secondary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Zoom Apps..."
                className="w-full rounded-lg bg-portal-bg pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder-text-secondary outline-none border border-portal-border focus:border-zoom-blue"
              />
            </div>
          </div>

          {/* Apps List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {tab === "my-apps" ? (
              filteredApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setActiveApp(app.id)}
                  className="group flex items-start gap-3 p-3 rounded-xl border border-portal-border bg-portal-bg/40 hover:bg-hover hover:border-zoom-blue/40 cursor-pointer transition-all shadow-sm"
                >
                  <div className="p-2.5 rounded-xl bg-portal-card border border-portal-border shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    {app.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-text-primary truncate">
                        {app.name}
                      </span>
                      <span className="text-[10px] font-medium text-zoom-blue bg-zoom-blue/10 px-1.5 py-0.5 rounded">
                        {app.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                      {app.desc}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-portal-border bg-portal-bg p-3.5 space-y-2">
                  <span className="text-xs font-semibold text-text-primary block">
                    Featured Integrations
                  </span>
                  <div className="space-y-2">
                    {[
                      { name: "Asana for Zoom", desc: "Create and assign action items during the meeting" },
                      { name: "Figma & FigJam", desc: "Collaborate on design boards directly inside video call" },
                      { name: "YouTube Watch Together", desc: "Sync video playback for all attendees" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-portal-border bg-portal-card"
                      >
                        <div>
                          <span className="text-xs font-medium text-text-primary block">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-text-secondary">{item.desc}</span>
                        </div>
                        <button
                          onClick={() => setActiveApp("notes")}
                          className="px-2.5 py-1 text-[11px] font-medium rounded bg-zoom-blue/10 text-zoom-blue hover:bg-zoom-blue hover:text-white transition-colors"
                        >
                          Open
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Render Selected App */
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          {/* APP 1: TIMER */}
          {activeApp === "timer" && (
            <div className="flex flex-1 flex-col items-center justify-between">
              <div className="w-full flex justify-center gap-2 mb-4">
                <button
                  onClick={() => {
                    setTimerMode("countdown");
                    setIsTimerRunning(false);
                  }}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-lg transition-colors",
                    timerMode === "countdown"
                      ? "bg-zoom-blue text-white"
                      : "bg-portal-bg text-text-secondary hover:text-text-primary"
                  )}
                >
                  Countdown
                </button>
                <button
                  onClick={() => {
                    setTimerMode("stopwatch");
                    setIsTimerRunning(false);
                  }}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-lg transition-colors",
                    timerMode === "stopwatch"
                      ? "bg-zoom-blue text-white"
                      : "bg-portal-bg text-text-secondary hover:text-text-primary"
                  )}
                >
                  Stopwatch
                </button>
              </div>

              {/* Big Clock Display */}
              <div className="flex flex-col items-center justify-center my-auto">
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-4 border-portal-border bg-portal-bg shadow-inner">
                  <span className="font-mono text-4xl font-bold tracking-tight text-text-primary">
                    {timerMode === "countdown"
                      ? formatTime(timerSeconds)
                      : formatTime(stopwatchSeconds)}
                  </span>
                </div>

                {/* Presets for Countdown */}
                {timerMode === "countdown" && (
                  <div className="grid grid-cols-4 gap-1.5 mt-6 w-full max-w-xs">
                    {[
                      { label: "1 min", sec: 60 },
                      { label: "5 min", sec: 300 },
                      { label: "10 min", sec: 600 },
                      { label: "25 min", sec: 1500 },
                    ].map((preset) => (
                      <button
                        key={preset.sec}
                        onClick={() => {
                          setIsTimerRunning(false);
                          setTimerSeconds(preset.sec);
                          setInitialSeconds(preset.sec);
                        }}
                        className={cn(
                          "py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors",
                          timerSeconds === preset.sec
                            ? "border-zoom-blue bg-zoom-blue/10 text-zoom-blue"
                            : "border-portal-border bg-portal-bg text-text-secondary hover:text-text-primary"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 w-full pt-4 border-t border-portal-border">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-all",
                    isTimerRunning
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-zoom-blue hover:bg-zoom-blue-hover"
                  )}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Start</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    if (timerMode === "countdown") {
                      setTimerSeconds(initialSeconds);
                    } else {
                      setStopwatchSeconds(0);
                    }
                  }}
                  className="flex items-center justify-center p-2.5 rounded-xl border border-portal-border bg-portal-bg text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* APP 2: AI COMPANION */}
          {activeApp === "ai-companion" && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {aiChat.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded-xl leading-relaxed",
                      msg.role === "ai"
                        ? "bg-portal-bg border border-portal-border text-text-primary"
                        : "bg-zoom-blue text-white ml-6"
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-semibold text-[11px] opacity-80">
                      {msg.role === "ai" && <Sparkles className="h-3 w-3 text-zoom-blue" />}
                      <span>{msg.role === "ai" ? "AI Companion" : "You"}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
                {aiGenerating && (
                  <div className="p-3 rounded-xl bg-portal-bg border border-portal-border text-xs text-text-secondary flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-zoom-blue animate-spin" />
                    <span>Analyzing meeting transcription...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex gap-1.5 py-2 overflow-x-auto shrink-0 scrollbar-none">
                <button
                  onClick={() => {
                    setAiInput("Summarize the meeting key takeaways");
                  }}
                  className="px-2 py-1 rounded-full text-[11px] bg-portal-bg border border-portal-border text-text-secondary hover:text-text-primary whitespace-nowrap"
                >
                  📝 Summarize call
                </button>
                <button
                  onClick={() => {
                    setAiInput("What are the action items?");
                  }}
                  className="px-2 py-1 rounded-full text-[11px] bg-portal-bg border border-portal-border text-text-secondary hover:text-text-primary whitespace-nowrap"
                >
                  ✅ Action items
                </button>
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2 pt-2 border-t border-portal-border">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                  placeholder="Ask AI about this meeting..."
                  className="flex-1 rounded-lg border border-portal-border bg-portal-bg px-3 py-2 text-xs text-text-primary outline-none focus:border-zoom-blue"
                />
                <button
                  onClick={handleAskAI}
                  disabled={!aiInput.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zoom-blue text-white hover:bg-zoom-blue-hover disabled:opacity-40 transition-colors shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* APP 3: MEETING NOTES & AGENDA */}
          {activeApp === "notes" && (
            <div className="flex flex-1 flex-col overflow-hidden space-y-3">
              {/* Agenda Section */}
              <div className="rounded-xl border border-portal-border bg-portal-bg p-3">
                <span className="text-xs font-semibold text-text-primary block mb-2">
                  Meeting Agenda
                </span>
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                  {agenda.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 text-xs text-text-primary cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() =>
                          setAgenda((prev) =>
                            prev.map((a) => (a.id === item.id ? { ...a, done: !a.done } : a))
                          )
                        }
                        className="h-3.5 w-3.5 rounded accent-zoom-blue"
                      />
                      <span className={cn(item.done && "line-through text-text-secondary")}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-portal-border/60">
                  <input
                    type="text"
                    value={newAgendaText}
                    onChange={(e) => setNewAgendaText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newAgendaText.trim()) {
                        setAgenda((prev) => [
                          ...prev,
                          { id: Date.now().toString(), text: newAgendaText.trim(), done: false },
                        ]);
                        setNewAgendaText("");
                      }
                    }}
                    placeholder="Add agenda topic..."
                    className="flex-1 bg-transparent text-xs text-text-primary placeholder-text-secondary outline-none"
                  />
                  <button
                    onClick={() => {
                      if (newAgendaText.trim()) {
                        setAgenda((prev) => [
                          ...prev,
                          { id: Date.now().toString(), text: newAgendaText.trim(), done: false },
                        ]);
                        setNewAgendaText("");
                      }
                    }}
                    className="p-1 rounded text-zoom-blue hover:bg-zoom-blue/10"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Shared Notes Textarea */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-semibold text-text-primary">Shared Minutes</span>
                  <button
                    onClick={handleCopyNotes}
                    className="flex items-center gap-1 text-[11px] text-zoom-blue hover:underline"
                  >
                    {copiedNotes ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy notes</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex-1 w-full rounded-xl border border-portal-border bg-portal-bg p-3 text-xs font-mono text-text-primary outline-none focus:border-zoom-blue resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* APP 4: MIRO STICKY NOTES */}
          {activeApp === "stickies" && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-portal-border">
                {(["yellow", "green", "blue", "pink"] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setStickyColor(color)}
                    className={cn(
                      "h-5 w-5 rounded-full transition-transform",
                      color === "yellow" && "bg-amber-300",
                      color === "green" && "bg-emerald-300",
                      color === "blue" && "bg-sky-300",
                      color === "pink" && "bg-rose-300",
                      stickyColor === color ? "scale-110 ring-2 ring-zoom-blue" : "opacity-70"
                    )}
                  />
                ))}
                <span className="text-[11px] text-text-secondary ml-1">Color</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={newStickyText}
                  onChange={(e) => setNewStickyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newStickyText.trim()) {
                      setStickies((prev) => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          text: newStickyText.trim(),
                          color: stickyColor,
                          author: "You",
                        },
                      ]);
                      setNewStickyText("");
                    }
                  }}
                  placeholder="Type an idea or sticky note..."
                  className="flex-1 rounded-lg border border-portal-border bg-portal-bg px-3 py-1.5 text-xs text-text-primary outline-none focus:border-zoom-blue"
                />
                <button
                  onClick={() => {
                    if (newStickyText.trim()) {
                      setStickies((prev) => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          text: newStickyText.trim(),
                          color: stickyColor,
                          author: "You",
                        },
                      ]);
                      setNewStickyText("");
                    }
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zoom-blue text-white hover:bg-zoom-blue-hover transition-colors shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Grid of Stickies */}
              <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2.5 auto-rows-max p-1">
                {stickies.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "relative p-3 rounded-xl shadow-md text-neutral-900 flex flex-col justify-between min-h-[90px] rotate-[-0.5deg] hover:rotate-0 transition-transform",
                      s.color === "yellow" && "bg-amber-200",
                      s.color === "green" && "bg-emerald-200",
                      s.color === "blue" && "bg-sky-200",
                      s.color === "pink" && "bg-rose-200"
                    )}
                  >
                    <p className="text-xs font-medium leading-snug break-words">{s.text}</p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/10 text-[10px] text-neutral-600">
                      <span>{s.author}</span>
                      <button
                        onClick={() => setStickies((prev) => prev.filter((item) => item.id !== s.id))}
                        className="hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APP 5: QUIZ / TRIVIA */}
          {activeApp === "quiz" && (
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-portal-border">
                  <span className="text-xs font-medium text-text-secondary">
                    Question {quizIndex + 1} of {quizQuestions.length}
                  </span>
                  <span className="text-xs font-semibold text-zoom-blue flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    <span>Score: {quizScore}</span>
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-text-primary leading-snug mb-4">
                  {quizQuestions[quizIndex].q}
                </h3>

                <div className="space-y-2">
                  {quizQuestions[quizIndex].options.map((opt, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === quizQuestions[quizIndex].correct;
                    const isChecked = selectedAnswer !== null;

                    return (
                      <button
                        key={idx}
                        disabled={isChecked}
                        onClick={() => {
                          setSelectedAnswer(idx);
                          if (idx === quizQuestions[quizIndex].correct) {
                            setQuizScore((s) => s + 100);
                          }
                        }}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border text-xs font-medium transition-all",
                          !isChecked && "border-portal-border bg-portal-bg hover:bg-hover",
                          isChecked && isCorrect && "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold",
                          isChecked && isSelected && !isCorrect && "border-rose-500 bg-rose-500/10 text-rose-500"
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next Question */}
              {selectedAnswer !== null && (
                <button
                  onClick={() => {
                    setSelectedAnswer(null);
                    setQuizIndex((prev) => (prev + 1) % quizQuestions.length);
                  }}
                  className="w-full py-2.5 rounded-xl bg-zoom-blue hover:bg-zoom-blue-hover text-white text-xs font-semibold shadow-sm transition-colors mt-4"
                >
                  {quizIndex + 1 < quizQuestions.length ? "Next Question" : "Restart Quiz"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
