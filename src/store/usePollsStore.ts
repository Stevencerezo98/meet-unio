import { create } from "zustand";
import type { Poll, PollResults, MyVotes } from "@/lib/polls";

interface PollsStore {
  polls: Poll[];
  results: PollResults;
  myVotes: MyVotes;
  createPoll: (question: string, options: string[]) => void;
  launchPoll: (id: string) => void;
  vote: (pollId: string, optionIndex: number) => void;
}

export const usePollsStore = create<PollsStore>((set) => ({
  polls: [
    {
      id: "poll-1",
      question: "How is the audio and video quality?",
      options: ["Crystal clear", "Good", "Could be better"],
      launched: true,
    },
  ],
  results: {
    "poll-1": [4, 2, 0],
  },
  myVotes: {},
  createPoll: (question, options) =>
    set((state) => {
      const newPoll: Poll = {
        id: `poll-${Date.now()}`,
        question,
        options,
        launched: true,
      };
      return {
        polls: [...state.polls, newPoll],
        results: {
          ...state.results,
          [newPoll.id]: options.map(() => 0),
        },
      };
    }),
  launchPoll: (id) =>
    set((state) => ({
      polls: state.polls.map((p) => (p.id === id ? { ...p, launched: true } : p)),
    })),
  vote: (pollId, optionIndex) =>
    set((state) => {
      const currentCounts = state.results[pollId] || [];
      const updatedCounts = [...currentCounts];
      updatedCounts[optionIndex] = (updatedCounts[optionIndex] || 0) + 1;
      return {
        myVotes: { ...state.myVotes, [pollId]: optionIndex },
        results: { ...state.results, [pollId]: updatedCounts },
      };
    }),
}));
