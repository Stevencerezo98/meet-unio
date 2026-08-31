import { useState } from "react";
import { X, Plus, Trash2, CheckCircle2 } from "lucide-react";
import type { Poll, PollResults, MyVotes } from "@/lib/polls";

interface PollingModalProps {
  open: boolean;
  onClose: () => void;
  polls: Poll[];
  onCreatePoll: (question: string, options: string[]) => void;
  onLaunchPoll: (id: string) => void;
  onVote: (pollId: string, optionIndex: number) => void;
  results: PollResults;
  myVotes: MyVotes;
  isHost: boolean;
}

export default function PollingModal({
  open,
  onClose,
  polls,
  onCreatePoll,
  onLaunchPoll,
  onVote,
  results,
  myVotes,
  isHost,
}: PollingModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  if (!open) return null;

  const handleAddOption = () => {
    setOptions((prev) => [...prev, ""]);
  };

  const handleOptionChange = (index: number, val: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    if (validOptions.length < 2) return;

    onCreatePoll(question.trim(), validOptions);
    setQuestion("");
    setOptions(["", ""]);
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[#242424] text-white shadow-2xl ring-1 ring-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-6 border-b border-white/10 bg-[#1f1f1f]">
          <h2 className="text-base font-semibold text-white">Votaciones y Encuestas</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {isCreating ? (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">
                  Pregunta
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Escribe la pregunta de la encuesta..."
                  className="w-full rounded-lg bg-[#191919] px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none border border-white/10 focus:border-zoom-blue"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">
                  Opciones de respuesta
                </label>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      placeholder={`Opción ${i + 1}`}
                      className="flex-1 rounded-lg bg-[#191919] px-3.5 py-2 text-sm text-white placeholder-gray-500 outline-none border border-white/10 focus:border-zoom-blue"
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(i)}
                        className="p-1.5 text-gray-400 hover:text-leave"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center gap-1.5 text-xs text-zoom-blue hover:text-zoom-blue-hover font-medium pt-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Agregar opción</span>
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-gray-300 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-zoom-blue px-4 py-2 text-xs font-medium text-white hover:bg-zoom-blue-hover"
                >
                  Iniciar encuesta
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {polls.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  Aún no se han creado votaciones.
                </div>
              ) : (
                polls.map((poll) => {
                  const voteCounts = results[poll.id] || poll.options.map(() => 0);
                  const totalVotes = voteCounts.reduce((a, b) => a + b, 0);
                  const myVote = myVotes[poll.id];

                  return (
                    <div
                      key={poll.id}
                      className="rounded-xl bg-[#1d1d1d] p-4 border border-white/5 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-100">
                          {poll.question}
                        </h3>
                        {poll.launched ? (
                          <span className="shrink-0 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            Activa
                          </span>
                        ) : (
                          isHost && (
                            <button
                              onClick={() => onLaunchPoll(poll.id)}
                              className="rounded bg-zoom-blue px-2.5 py-1 text-xs font-medium text-white hover:bg-zoom-blue-hover"
                            >
                              Lanzar
                            </button>
                          )
                        )}
                      </div>

                      {/* Options & voting */}
                      <div className="space-y-2">
                        {poll.options.map((opt, idx) => {
                          const count = voteCounts[idx] || 0;
                          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                          const isSelected = myVote === idx;

                          return (
                            <div key={idx} className="space-y-1">
                              <button
                                type="button"
                                disabled={myVote !== undefined}
                                onClick={() => onVote(poll.id, idx)}
                                className={`flex w-full items-center justify-between rounded-lg p-2.5 text-xs text-left transition-all ${
                                  isSelected
                                    ? "bg-zoom-blue/20 ring-1 ring-zoom-blue text-white"
                                    : "bg-white/5 hover:bg-white/10 text-gray-200"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? "border-zoom-blue bg-zoom-blue" : "border-gray-500"}`}>
                                    {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                                  </div>
                                  <span>{opt}</span>
                                </div>
                                <span className="font-semibold text-gray-300">{pct}%</span>
                              </button>

                              {/* Progress bar */}
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                                <div
                                  className="h-full bg-zoom-blue transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-[11px] text-gray-400 pt-1 flex justify-between">
                        <span>Votos totales: {totalVotes}</span>
                        {myVote !== undefined && <span>Has votado</span>}
                      </div>
                    </div>
                  );
                })
              )}

              {isHost && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-xs font-semibold text-zoom-blue hover:border-zoom-blue hover:bg-zoom-blue/5 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Crear una encuesta</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
