import { create } from 'zustand';
import type { ChatMessage, ExplanationMode } from '../types/domain';
import { uid } from '../lib/utils';

interface QueryState {
  messages: ChatMessage[];
  isLoading: boolean;
  mode: ExplanationMode;

  addUserMessage: (content: string) => string;
  addAssistantMessage: (msg: Omit<ChatMessage, 'id' | 'role' | 'timestamp'>) => void;
  setLoading: (v: boolean) => void;
  setMode: (mode: ExplanationMode) => void;
  clearChat: () => void;
}

export const useQueryStore = create<QueryState>()((set) => ({
  messages: [],
  isLoading: false,
  mode: 'engineer',

  addUserMessage: (content) => {
    const id = uid();
    set((s) => ({
      messages: [
        ...s.messages,
        { id, role: 'user', content, timestamp: Date.now() },
      ],
    }));
    return id;
  },

  addAssistantMessage: (msg) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { ...msg, id: uid(), role: 'assistant', timestamp: Date.now() },
      ],
    })),

  setLoading: (v) => set({ isLoading: v }),

  setMode: (mode) => set({ mode }),

  clearChat: () => set({ messages: [] }),
}));
